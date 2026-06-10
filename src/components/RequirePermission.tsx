import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

/**
 * Route guard: renders the nested routes only if the current user holds the
 * given permission; otherwise redirects home. Mirrors the backend RBAC so admin
 * pages (Employees, Work Orders, Customers) are unreachable by employees even
 * via a direct URL — the API still enforces the same rules server-side.
 */
export function RequirePermission({ permission }: { permission: string }) {
  const { can, loading } = useAuth();
  if (loading) return null;
  if (!can(permission)) return <Navigate to="/" replace />;
  return <Outlet />;
}
