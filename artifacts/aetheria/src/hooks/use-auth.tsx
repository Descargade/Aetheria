import { useState, useEffect, useCallback, createContext, useContext } from "react";

interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const STORAGE_KEY = "aetheria_auth";

function getStoredAuth(): { user: User | null; token: string | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { user: parsed.user, token: parsed.token };
    }
  } catch {}
  return { user: null, token: null };
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const { user, token } = getStoredAuth();
    return { user, token, isLoading: true };
  });

  useEffect(() => {
    const { user, token } = getStoredAuth();
    if (token && !user) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            setState({ user: data.user, token, isLoading: false });
          } else {
            localStorage.removeItem(STORAGE_KEY);
            setState({ user: null, token: null, isLoading: false });
          }
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          setState({ user: null, token: null, isLoading: false });
        });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Error al iniciar sesión");
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: data.user, token: data.token }));
    setState({ user: data.user, token: data.token, isLoading: false });
    return data.user;
  }, []);

  const register = useCallback(async (payload: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Error al registrar");
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: data.user, token: data.token }));
    setState({ user: data.user, token: data.token, isLoading: false });
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: !!state.user,
    login,
    register,
    logout,
  };
}

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
