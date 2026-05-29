import { config } from "../config";

const KRATOS_BASE = config.authEndpoint;

/**
 * Kratos self-service flow types
 */
export type KratosFlow = "login" | "registration" | "settings" | "recovery" | "verification";

/**
 * Represents a Kratos UI node (form field)
 */
export interface KratosUiNode {
  type: "input" | "img" | "text" | "a" | "script";
  group: "default" | "password" | "oidc" | "profile" | "link" | "code" | "totp" | "webauthn" | "lookup_secret";
  attributes: {
    name: string;
    type: string;
    value?: string | boolean | number;
    required?: boolean;
    disabled?: boolean;
    node_type: string;
    label?: KratosLabel;
    autocomplete?: string;
    pattern?: string;
    [key: string]: unknown;
  };
  messages?: KratosMessage[];
  meta: { label?: KratosLabel };
}

export interface KratosLabel {
  id: number;
  text: string;
  type: string;
  context?: Record<string, unknown>;
}

export interface KratosMessage {
  id: number;
  text: string;
  type: "error" | "info" | "success";
  context?: Record<string, unknown>;
}

export interface KratosFlowState {
  id: string;
  type: string;
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: {
    action: string;
    method: string;
    nodes: KratosUiNode[];
    messages?: KratosMessage[];
  };
  state?: string;
  active?: string;
  messages?: KratosMessage[];
  return_to?: string;
  refresh?: boolean;
  continue_with?: KratosContinueWith[];
  [key: string]: unknown;
}

export interface KratosContinueWith {
  action: string;
  flow: {
    id: string;
    url: string;
    verifiable_address?: string;
  };
  [key: string]: unknown;
}

export interface KratosSession {
  id: string;
  active: boolean;
  expires_at: string;
  authenticated_at: string;
  authenticator_assurance_level: string;
  identity: KratosIdentity;
  devices?: KratosSessionDevice[];
}

export interface KratosIdentity {
  id: string;
  schema_id: string;
  schema_url: string;
  state: string;
  state_changed_at: string;
  traits: Record<string, unknown>;
  verifiable_addresses?: KratosVerifiableAddress[];
  recovery_addresses?: KratosRecoveryAddress[];
  metadata_public?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface KratosVerifiableAddress {
  id: string;
  value: string;
  via: string;
  status: string;
  verified: boolean;
}

export interface KratosRecoveryAddress {
  id: string;
  value: string;
  via: string;
}

export interface KratosSessionDevice {
  id: string;
  ip_address: string;
  user_agent: string;
  location: string;
}

export interface KratosError {
  id: string;
  error: {
    code: number;
    status: string;
    message: string;
    reason: string;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * API response helpers
 */
interface KratosApiResponse<T> {
  data: T | null;
  error: string | null;
  flowId: string | null;
  refresh: boolean;
  continueWith: KratosContinueWith[] | null;
}

/**
 * Initialize a self-service flow by calling the Kratos public API.
 *
 * Uses `Accept: application/json` to get the flow state as JSON
 * instead of being redirected.
 */
async function initFlow(flow: KratosFlow, returnTo?: string): Promise<KratosApiResponse<KratosFlowState>> {
  let url = `${KRATOS_BASE}/self-service/${flow}/browser`;
  if (returnTo) {
    url += `?return_to=${encodeURIComponent(returnTo)}`;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { data: null, error: errorText, flowId: null, refresh: false, continueWith: null };
    }

    const data: KratosFlowState = await response.json();
    return { data, error: null, flowId: data.id, refresh: false, continueWith: data.continue_with || null };
  } catch (err) {
    return {
      data: null,
      error: (err as Error).message || "Failed to initialize flow",
      flowId: null,
      refresh: false,
      continueWith: null,
    };
  }
}

/**
 * Submit form data for a self-service flow.
 */
async function submitFlow(
  flow: KratosFlow,
  flowId: string,
  formPayload: Record<string, unknown>,
  csrfToken: string,
): Promise<KratosApiResponse<KratosFlowState>> {
  const url = `${KRATOS_BASE}/self-service/${flow}?flow=${encodeURIComponent(flowId)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(formPayload),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.ui) {
        // Kratos returned updated flow with validation errors
        return { data: errorData, error: null, flowId: errorData.id, refresh: false, continueWith: null };
      }
      const errorText = await response.text();
      return { data: null, error: errorText, flowId: null, refresh: false, continueWith: null };
    }

    // Check for continue_with (e.g., after login, may need to pass to oathkeeper)
    const data: KratosFlowState = await response.json();
    return { data, error: null, flowId: data.id, refresh: data.refresh || false, continueWith: data.continue_with || null };
  } catch (err) {
    return {
      data: null,
      error: (err as Error).message || "Failed to submit flow",
      flowId: null,
      refresh: false,
      continueWith: null,
    };
  }
}

/**
 * Get the current session via Kratos whoami endpoint.
 * Returns null if not authenticated.
 */
async function getSession(): Promise<KratosSession | null> {
  try {
    const response = await fetch(`${KRATOS_BASE}/sessions/whoami`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    return await response.json() as KratosSession;
  } catch {
    return null;
  }
}

/**
 * Initiate logout and destroy the Kratos session.
 */
async function logout(): Promise<boolean> {
  try {
    // Get the logout URL from Kratos (it returns a 302 with the flow)
    const initResponse = await fetch(`${KRATOS_BASE}/self-service/logout/browser`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!initResponse.ok) {
      return false;
    }

    const logoutFlow: { logout_url: string; logout_token: string } = await initResponse.json();

    // Call the logout URL to destroy the session
    await fetch(logoutFlow.logout_url, {
      method: "GET",
      credentials: "include",
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Extract the CSRF token from a Kratos flow state.
 */
function extractCsrfToken(flow: KratosFlowState): string {
  const csrfNode = flow.ui.nodes.find(
    (n) => n.attributes.name === "csrf_token",
  );
  return (csrfNode?.attributes.value as string) || "";
}

/**
 * Extract form field nodes grouped by method/group from a Kratos flow.
 */
function extractFormFields(flow: KratosFlowState) {
  const fields: Record<string, KratosUiNode[]> = {};

  for (const node of flow.ui.nodes) {
    if (node.type !== "input" || node.attributes.name === "csrf_token" || node.attributes.name === "method") {
      continue;
    }
    const group = node.group || "default";
    if (!fields[group]) {
      fields[group] = [];
    }
    fields[group].push(node);
  }

  return fields;
}

/**
 * Get the first message of a specific type from a flow.
 */
function getFlowMessage(flow: KratosFlowState, type: KratosMessage["type"] = "error"): string | null {
  const uiMessages = flow.ui.messages?.filter((m) => m.type === type) || [];
  if (uiMessages.length > 0) return uiMessages[0].text;

  const flowMessages = flow.messages?.filter((m) => m.type === type) || [];
  if (flowMessages.length > 0) return flowMessages[0].text;

  return null;
}

export const KratosApi = {
  initFlow,
  submitFlow,
  getSession,
  logout,
  extractCsrfToken,
  extractFormFields,
  getFlowMessage,
};

export default KratosApi;
