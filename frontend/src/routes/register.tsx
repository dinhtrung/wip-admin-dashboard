import { useNavigate } from "@tanstack/react-router";
import { RegisterForm } from "../components/auth/RegisterForm";
import { useAuth } from "../hooks/use-auth";

export function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  async function handleRegister(email: string, password: string, name: string) {
    const result = await register(email, password, name);
    if (result.success) {
      navigate({ to: "/" });
    }
    return result;
  }

  return <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />;
}
