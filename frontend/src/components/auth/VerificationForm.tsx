import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, AlertCircle, CheckCircle2, MailCheck } from "lucide-react";
import { useSearch } from "@tanstack/react-router";

interface VerificationFormProps {
  onSubmit: (code: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  isLoading?: boolean;
  email?: string;
}

export function VerificationForm({ onSubmit, isLoading = false, email }: VerificationFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = await onSubmit(code);
    if (result.success) {
      setVerified(true);
    } else if (result.error) {
      setError(result.error);
    }
  }

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            <div className="text-center">
              <h2 className="text-2xl font-bold">Email verified!</h2>
              <p className="mt-2 text-muted-foreground">
                Your email has been verified successfully.
              </p>
            </div>
            {email && (
              <p className="text-sm text-muted-foreground">{email}</p>
            )}
            <Link to="/login" className="w-full">
              <Button className="w-full">Continue to sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            {email
              ? `Enter the verification code sent to ${email}`
              : "Enter the verification code from your email"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="one-time-code"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
