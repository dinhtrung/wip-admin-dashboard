import { useKratosFlow } from "../hooks/use-kratos-flow";
import { VerificationForm } from "../components/auth/VerificationForm";
import { Loader2 } from "lucide-react";

export function VerificationPage() {
  const { flow, error, isLoading, csrfToken, submit, retry } = useKratosFlow("verification");

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

  async function handleSubmit(code: string) {
    const result = await submit({
      code,
      method: "code",
      csrf_token: csrfToken,
    });
    return { success: result.success, error: result.error || undefined };
  }

  return <VerificationForm onSubmit={handleSubmit} isLoading={isLoading} />;
}
