import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("aetheria_auth_token"));
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("aetheria_auth_token");
      if (storedToken) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              setUser(data.user);
            } else {
              localStorage.removeItem("aetheria_auth_token");
            }
          } else {
            localStorage.removeItem("aetheria_auth_token");
          }
        } catch {
          localStorage.removeItem("aetheria_auth_token");
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al iniciar sesión");
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("aetheria_auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message ?? "Error al registrarse");
      return result;
    },
    onSuccess: (data) => {
      localStorage.setItem("aetheria_auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (data: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = () => {
    localStorage.removeItem("aetheria_auth_token");
    setToken(null);
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}