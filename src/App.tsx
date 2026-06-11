import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RequirePermission } from "@/components/RequirePermission";
import { AuthProvider } from "@/context/AuthContext";
import AuditLogPage from "@/pages/AuditLogPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import CustomersPage from "@/pages/CustomersPage";
import EmployeesPage from "@/pages/EmployeesPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import HomePage from "@/pages/HomePage";
import InvoiceBuilderPage from "@/pages/InvoiceBuilderPage";
import InvoicesPage from "@/pages/InvoicesPage";
import LoginPage from "@/pages/LoginPage";
import MyRequestsPage from "@/pages/MyRequestsPage";
import NewWorkOrderPage from "@/pages/NewWorkOrderPage";
import ProfilePage from "@/pages/ProfilePage";
import ReportsPage from "@/pages/ReportsPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import SettingsPage from "@/pages/SettingsPage";
import SignupPage from "@/pages/SignupPage";
import WorkOrdersPage from "@/pages/WorkOrdersPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Invoice module — public (no authentication required) */}
          <Route path="/invoice" element={<InvoiceBuilderPage />} />

          {/* Authenticated app shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />

              {/* Admin-only sections (employees are redirected home) */}
              <Route element={<RequirePermission permission="workorder:view_all" />}>
                <Route path="/work-orders" element={<WorkOrdersPage />} />
              </Route>
              <Route element={<RequirePermission permission="workorder:create_request" />}>
                <Route path="/work-orders/new" element={<NewWorkOrderPage />} />
                <Route path="/my-requests" element={<MyRequestsPage />} />
              </Route>
              <Route element={<RequirePermission permission="employee:view" />}>
                <Route path="/employees" element={<EmployeesPage />} />
              </Route>
              <Route element={<RequirePermission permission="audit:view" />}>
                <Route path="/audit-logs" element={<AuditLogPage />} />
              </Route>
              <Route element={<RequirePermission permission="customer:view" />}>
                <Route path="/customers" element={<CustomersPage />} />
              </Route>
              <Route element={<RequirePermission permission="report:view" />}>
                <Route path="/reports" element={<ReportsPage />} />
              </Route>

              {/* Open to everyone (invoicing is a public module) */}
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
