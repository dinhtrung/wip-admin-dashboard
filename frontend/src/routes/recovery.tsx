import { useKratosFlow } from "../hooks/use-kratos-flow";
import { RecoveryForm } from "../components/auth/RecoveryForm";
import { Loader2 } from "lucide-react";

export function RecoveryPage() {
  const { flow, error, isLoading, csrfToken, submit, retry } = useKratosFlow("recovery");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !flow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive">Error</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            onClick={() => retry()}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(email: string, code?: string, password?: string) {
    if (code && password) {
      // Submit recovery with code + new password
      const result = await submit({
        email,
        code,
        method: "code",
        csrf_token: csrfToken,
      });
      return { success: result.success, error: result.error || undefined };
    }

    // Send recovery email
    const result = await submit({
      email,
      method: "code",
      csrf_token: csrfToken,
    });
    return { success: result.success, error: result.error || undefined };
  }

  return <RecoveryForm onSubmit={handleSubmit} isLoading={isLoading} />;
}
