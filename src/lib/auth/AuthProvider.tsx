import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authStore, type AuthUser } from "./auth-store";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (payload: {
    full_name: string;
    email: string;
    mobile: string;
    password: string;
    confirm_password: string;
  }) => Promise<void>;
  guest: () => Promise<void>;
  logout: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setUser(authStore.getUser());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = authStore.getUser();
      if (stored && authStore.getRefreshToken()) {
        await authStore.refreshTokens();
      }
      if (!cancelled) {
        setUser(authStore.getUser());
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user && authStore.isAuthenticated(),
      login: async (email, password, rememberMe) => {
        const u = await authStore.login(email, password, rememberMe);
        setUser(u);
      },
      signup: async (payload) => {
        const u = await authStore.signup(payload);
        setUser(u);
      },
      guest: async () => {
        const u = await authStore.guest();
        setUser(u);
      },
      logout: () => {
        authStore.logout();
        setUser(null);
      },
      refresh,
    }),
    [user, isLoading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
