import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, ShieldCheck, ShieldMinus, Users } from "lucide-react";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmployeeActionsMenu } from "@/components/employees/EmployeeActionsMenu";
import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal";
import { RoleChangeModal } from "@/components/employees/RoleChangeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { ApiError, employeesApi } from "@/lib/api";
import type { Employee } from "@/types/employee";

const LAST_ADMIN_MSG = "At least one Admin must exist in the organization.";
type StatusFilter = "" | "active" | "inactive";
type Pending = { kind: "deactivate" | "delete"; emp: Employee };

export default function EmployeesPage() {
  const { can } = useAuth();
  const canManage = can("employee:manage");

  const [items, setItems] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [roleTarget, setRoleTarget] = useState<Employee | null>(null);

  const [pending, setPending] = useState<Pending | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(
        await employeesApi.list({
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          include_deleted: showDeleted,
        })
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, showDeleted]);

  useEffect(() => {
    void load();
  }, [load]);

  // The last remaining active admin can't be demoted, deactivated or deleted
  // (mirrors the backend guard so those actions are disabled up front).
  const activeAdminCount = items.filter(
    (e) => e.role === "admin" && e.is_active && !e.deleted_at
  ).length;
  const isLastAdmin = (emp: Employee) =>
    emp.role === "admin" && emp.is_active && !emp.deleted_at && activeAdminCount <= 1;

  async function activate(emp: Employee) {
    setError(null);
    try {
      await employeesApi.activate(emp.id);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not activate employee");
    }
  }

  async function confirmPending() {
    if (!pending) return;
    setConfirmLoading(true);
    setConfirmError(null);
    try {
      if (pending.kind === "deactivate") await employeesApi.deactivate(pending.emp.id);
      else await employeesApi.remove(pending.emp.id);
      setPending(null);
      void load();
    } catch (err) {
      setConfirmError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setConfirmLoading(false);
    }
  }

  function statusBadge(emp: Employee) {
    if (emp.deleted_at) return <Badge variant="secondary">Deleted</Badge>;
    return (
      <Badge variant={emp.is_active ? "green" : "secondary"}>
        {emp.is_active ? "Active" : "Inactive"}
      </Badge>
    );
  }

  const colSpan = 6;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Employees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your team, their roles, and who can receive work assignments.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name, phone, email, designation…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-md"
        />
        <Select
          className="sm:w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-input accent-navy"
          />
          Show deleted
        </label>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="py-12 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No team members found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((emp) => {
                const lastAdmin = isLastAdmin(emp);
                const deleted = !!emp.deleted_at;
                return (
                  <TableRow key={emp.id} className={deleted ? "opacity-60" : undefined}>
                    <TableCell className="font-medium">
                      {emp.deleted_at ? `${emp.full_name} (Deleted)` : emp.full_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.role === "admin" ? "gold" : "navy"}>
                        {emp.role === "admin" ? "Admin" : "Employee"}
                      </Badge>
                    </TableCell>
                    <TableCell>{emp.designation ?? "—"}</TableCell>
                    <TableCell>{emp.phone ?? "—"}</TableCell>
                    <TableCell>{statusBadge(emp)}</TableCell>
                    <TableCell className="text-right">
                      {canManage && !deleted && (
                        <div className="flex items-center justify-end gap-1">
                          {emp.role === "admin" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRoleTarget(emp)}
                              disabled={lastAdmin}
                              aria-label="Change role to Employee"
                              title={lastAdmin ? LAST_ADMIN_MSG : "Change role to Employee"}
                            >
                              <ShieldMinus className="h-4 w-4 text-amber-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRoleTarget(emp)}
                              aria-label="Promote to Admin"
                              title="Promote to Admin"
                            >
                              <ShieldCheck className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          <EmployeeActionsMenu
                            employee={emp}
                            lastAdmin={lastAdmin}
                            onEdit={() => {
                              setEditing(emp);
                              setModalOpen(true);
                            }}
                            onActivate={() => activate(emp)}
                            onDeactivate={() => {
                              setConfirmError(null);
                              setPending({ kind: "deactivate", emp });
                            }}
                            onDelete={() => {
                              setConfirmError(null);
                              setPending({ kind: "delete", emp });
                            }}
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <EmployeeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        employee={editing}
      />

      <RoleChangeModal
        open={roleTarget !== null}
        employee={roleTarget}
        onClose={() => setRoleTarget(null)}
        onChanged={load}
      />

      <ConfirmDialog
        open={pending?.kind === "deactivate"}
        title="Deactivate Employee"
        message="This employee will no longer be able to access AuditFlow. Existing records will be preserved."
        confirmLabel="Deactivate"
        loading={confirmLoading}
        error={confirmError}
        onConfirm={confirmPending}
        onClose={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending?.kind === "delete"}
        title="Delete Employee"
        message="This action cannot be undone. The employee will lose access to AuditFlow and be removed from active employee lists."
        warning="If this employee has active work orders, deletion will be blocked."
        confirmLabel="Delete Employee"
        destructive
        loading={confirmLoading}
        error={confirmError}
        onConfirm={confirmPending}
        onClose={() => setPending(null)}
      />
    </div>
  );
}
