import DashboardPage from "@/pages/DashboardPage";
import EmployeeDashboardPage from "@/pages/EmployeeDashboardPage";
import { useAuth } from "@/context/AuthContext";

/** Employees see their assignment dashboard; admins see the analytics dashboard. */
export default function HomePage() {
  const { user } = useAuth();
  return user?.role === "employee" ? <EmployeeDashboardPage /> : <DashboardPage />;
}
