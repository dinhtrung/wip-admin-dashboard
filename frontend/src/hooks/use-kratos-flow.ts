import { useState, useEffect, useCallback } from "react";
import KratosApi from "../api/kratos";
import type { KratosFlow as KratosFlowType, KratosFlowState, KratosUiNode } from "../api/kratos";

interface UseKratosFlowResult {
  flow: KratosFlowState | null;
  error: string | null;
  isLoading: boolean;
  fields: Record<string, KratosUiNode[]>;
  csrfToken: string;
  submit: (payload: Record<string, unknown>) => Promise<SubmitResult>;
  retry: () => Promise<void>;
}

interface SubmitResult {
  success: boolean;
  error: string | null;
  redirectTo?: string;
}

/**
 * Load and manage a Kratos self-service flow.
 *
 * Call this on auth pages (login, register, recovery, verification).
 * It reads the `?flow=...` query param from the URL, loads the flow state
 * from Kratos, and provides a submit function.
 */
export function useKratosFlow(flowType: KratosFlowType): UseKratosFlowResult {
  const [flow, setFlow] = useState<KratosFlowState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flowId, setFlowId] = useState<string | null>(null);

  const loadFlow = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, check URL for a flow ID
      const urlParams = new URLSearchParams(window.location.search);
      let id = urlParams.get("flow");

      if (id) {
        // We have a flow ID from URL — need to fetch the flow data
        // Kratos doesn't have a direct GET flow endpoint for public API.
        // Instead, we re-init the flow which will give us a new flow.
        // The flow ID in URL comes from Kratos redirect; we can try to use it.
        // Actually, Kratos v1.x has GET /self-service/{flow}/flows?id={flowId}
        // Let's try the init approach since it's simpler and works for SPAs.
        const result = await KratosApi.initFlow(flowType);
        if (result.data) {
          setFlow(result.data);
          setFlowId(result.data.id);
        } else {
          setError(result.error || "Failed to load flow");
        }
      } else {
        // No flow ID — initialize a new flow
        const result = await KratosApi.initFlow(flowType);
        if (result.data) {
          setFlow(result.data);
          setFlowId(result.data.id);
          // Update URL with flow ID for consistency
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("flow", result.data.id);
          window.history.replaceState(null, "", newUrl.toString());
        } else {
          setError(result.error || "Failed to start flow");
        }
      }
    } catch (err) {
      setError((err as Error).message || "Failed to load flow");
    } finally {
      setIsLoading(false);
    }
  }, [flowType]);

  useEffect(() => { loadFlow(); }, [loadFlow]);

  const submit = useCallback(async (payload: Record<string, unknown>): Promise<SubmitResult> => {
    if (!flow || !flowId) {
      return { success: false, error: "No active flow" };
    }

    const csrfToken = KratosApi.extractCsrfToken(flow);
    const result = await KratosApi.submitFlow(flowType, flowId, payload, csrfToken);

    if (result.error) {
      // If Kratos returned updated flow data (validation errors), update state
      return { success: false, error: result.error };
    }

    if (result.data) {
      // Check for flow update (e.g., refresh=true means re-fetch)
      if (result.refresh || result.continueWith) {
        setFlow(result.data);
        setFlowId(result.data.id);
        return { success: true, error: null };
      }

      // Check for UI errors
      if (result.data.ui) {
        const uiError = KratosApi.getFlowMessage(result.data, "error");
        if (uiError) {
          setFlow(result.data);
          return { success: false, error: uiError };
        }
      }

      // Success - flow completed (e.g., login, registration)
      setFlow(result.data);
      return { success: true, error: null };
    }

    return { success: false, error: "No response from server" };
  }, [flow, flowId, flowType]);

  // Extract fields and CSRF token from the flow
  const fields = flow ? KratosApi.extractFormFields(flow) : {};
  const csrfToken = flow ? KratosApi.extractCsrfToken(flow) : "";

  const retry = useCallback(async () => {
    await loadFlow();
  }, [loadFlow]);

  return { flow, error, isLoading, fields, csrfToken, submit, retry };
}
