import {
  createContext,
  useState,
  useCallback,
  type ReactNode,
  type FC,
} from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Stub for Ory Kratos integration
  const login = useCallback(async (_email: string, _password: string) => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Ory Kratos via Oathkeeper
      // const response = await apiClient.post('/self-service/login', { email, password });
      // const { session } = response.data;
      // setUser(session.user);
      throw new Error("Not implemented - Ory Kratos integration pending");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Invalidate Ory Kratos session
      // await apiClient.delete('/self-service/logout');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (_email: string, _password: string, _name: string) => {
      setIsLoading(true);
      try {
        // TODO: Integrate with Ory Kratos registration
        // const response = await apiClient.post('/self-service/registration', { email, password, name });
        // const { session } = response.data;
        // setUser(session.user);
        throw new Error(
          "Not implemented - Ory Kratos integration pending",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
