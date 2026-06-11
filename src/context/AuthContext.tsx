import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authApi, tokenStore } from "@/lib/api";
import type { RegisterResponse, UserProfile, UserRole } from "@/types/auth";

// Frontend mirror of the backend RBAC matrix (app/core/rbac.py). Used only to
// gate UI affordances — the backend remains the source of truth on every call.
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "org:manage",
    "employee:manage",
    "employee:view",
    "audit:view",
    "customer:manage",
    "customer:view",
    "workorder:manage",
    "workorder:create_request",
    "workorder:view_all",
    "invoice:manage",
    "invoice:view",
    "report:view",
  ],
  employee: [
    "workorder:create_request",
    "workorder:view_assigned",
    "workorder:update_status",
  ],
};

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    full_name?: string;
  }) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!tokenStore.access && !tokenStore.refresh) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await authApi.me());
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const login = useCallback(async (identifier: string, password: string) => {
    await authApi.login(identifier, password);
    setUser(await authApi.me());
  }, []);

  // Registration does not sign the user in: the account is created
  // PENDING_APPROVAL and must be approved by an admin first. Just relay the
  // backend's confirmation message to the caller.
  const register = useCallback<AuthContextValue["register"]>(
    (input) => authApi.register(input),
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const can = useCallback(
    (permission: string) =>
      !!user && ROLE_PERMISSIONS[user.role]?.includes(permission),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, refreshUser: loadUser, can }),
    [user, loading, login, register, logout, loadUser, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
