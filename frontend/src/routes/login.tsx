import { useNavigate } from "@tanstack/react-router";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuth } from "../hooks/use-auth";

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(email: string, password: string, _rememberMe: boolean) {
    const result = await login(email, password);
    if (result.success) {
      navigate({ to: "/" });
    }
    return result;
  }

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />;
}
