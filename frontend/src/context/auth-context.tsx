import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type FC,
} from "react";
import KratosApi from "../api/kratos";
import type { KratosIdentity } from "../api/kratos";

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  traits: Record<string, unknown>;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<RegisterResult>;
  refreshSession: () => Promise<void>;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function mapIdentityToUser(identity: KratosIdentity): User {
  const traits = identity.traits;
  return {
    id: identity.id,
    email: (traits.email as string) || "",
    name: `${traits.first_name || ""} ${traits.last_name || ""}`.trim() || (traits.name as string) || (traits.email as string) || "",
    roles: Array.isArray(traits.roles) ? traits.roles as string[] : [],
    traits,
  };
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  const refreshSession = useCallback(async () => {
    try {
      const session = await KratosApi.getSession();
      if (session && session.active) {
        setUser(mapIdentityToUser(session.identity));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      // Step 1: Initialize login flow
      const initResult = await KratosApi.initFlow("login");
      if (!initResult.data || initResult.error) {
        return { success: false, error: initResult.error || "Failed to start login flow" };
      }

      const flow = initResult.data;
      const csrfToken = KratosApi.extractCsrfToken(flow);

      // Step 2: Submit login credentials
      const submitResult = await KratosApi.submitFlow(
        "login",
        flow.id,
        {
          method: "password",
          password_identifier: email,
          password,
          identifier: email,
          csrf_token: csrfToken,
        },
        csrfToken,
      );

      if (submitResult.error) {
        return { success: false, error: submitResult.error };
      }

      if (submitResult.data?.ui) {
        const errorMsg = KratosApi.getFlowMessage(submitResult.data, "error");
        if (errorMsg) {
          return { success: false, error: errorMsg };
        }
      }

      // Step 3: Get the session after successful login
      const session = await KratosApi.getSession();
      if (session && session.active) {
        setUser(mapIdentityToUser(session.identity));
        return { success: true };
      }

      return { success: false, error: "Login succeeded but no session found" };
    } catch (err) {
      return { success: false, error: (err as Error).message || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await KratosApi.logout();
    } catch {
      // Always clear local state even if Kratos call fails
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<RegisterResult> => {
    setIsLoading(true);
    try {
      // Step 1: Initialize registration flow
      const initResult = await KratosApi.initFlow("registration");
      if (!initResult.data || initResult.error) {
        return { success: false, error: initResult.error || "Failed to start registration flow" };
      }

      const flow = initResult.data;
      const csrfToken = KratosApi.extractCsrfToken(flow);

      // Split name into first/last
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Step 2: Submit registration
      const submitResult = await KratosApi.submitFlow(
        "registration",
        flow.id,
        {
          method: "password",
          "traits.email": email,
          "traits.first_name": firstName,
          "traits.last_name": lastName,
          "traits.name": name,
          password,
          csrf_token: csrfToken,
        },
        csrfToken,
      );

      if (submitResult.error) {
        return { success: false, error: submitResult.error };
      }

      if (submitResult.data?.ui) {
        const errorMsg = KratosApi.getFlowMessage(submitResult.data, "error");
        if (errorMsg) {
          return { success: false, error: errorMsg };
        }
      }

      // Step 3: Get the session after successful registration
      const session = await KratosApi.getSession();
      if (session && session.active) {
        setUser(mapIdentityToUser(session.identity));
        return { success: true };
      }

      return { success: false, error: "Registration succeeded but no session found" };
    } catch (err) {
      return { success: false, error: (err as Error).message || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
