import { Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { AlertTriangle } from "lucide-react";

export function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            An error occurred during the authentication process. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>This may be caused by an expired link or an invalid request.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link to="/login" className="w-full">
            <Button className="w-full">Go to sign in</Button>
          </Link>
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full">Go to dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
