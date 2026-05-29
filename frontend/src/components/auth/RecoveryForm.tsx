import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

interface RecoveryFormProps {
  onSubmit: (
    email: string,
    code?: string,
    password?: string,
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;
  isLoading?: boolean;
}

type RecoveryStep = "email" | "code" | "success";

export function RecoveryForm({ onSubmit, isLoading = false }: RecoveryFormProps) {
  const [step, setStep] = useState<RecoveryStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = await onSubmit(email);
    if (result.success) {
      setStep("code");
    } else if (result.error) {
      setError(result.error);
    }
  }

  async function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const result = await onSubmit(email, code, password);
    if (result.success) {
      setStep("success");
    } else if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === "email" && "Reset your password"}
            {step === "code" && "Enter recovery code"}
            {step === "success" && "Password reset"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to receive a recovery code"}
            {step === "code" && "Check your inbox for the recovery code"}
            {step === "success" && "Your password has been reset successfully"}
          </CardDescription>
        </CardHeader>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send recovery code
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleCodeSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="recovery-code">Recovery code</Label>
                <Input
                  id="recovery-code"
                  type="text"
                  placeholder="Enter the code from your email"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recovery-password">New password</Label>
                <Input
                  id="recovery-password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recovery-confirm">Confirm password</Label>
                <Input
                  id="recovery-confirm"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset password
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError(null);
                  setCode("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-center text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Try a different email
              </button>
            </CardFooter>
          </form>
        )}

        {step === "success" && (
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-2 py-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-center text-muted-foreground">
                You can now sign in with your new password.
              </p>
            </div>
            <Link to="/login">
              <Button className="w-full">
                Sign in
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
