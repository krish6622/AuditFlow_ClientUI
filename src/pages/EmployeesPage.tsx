import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Power, ShieldCheck, ShieldMinus, Users } from "lucide-react";

import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal";
import { RoleChangeModal } from "@/components/employees/RoleChangeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function EmployeesPage() {
  const { can } = useAuth();
  const canManage = can("employee:manage");

  const [items, setItems] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [roleTarget, setRoleTarget] = useState<Employee | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await employeesApi.list(search.trim() || undefined));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  // The last remaining active admin cannot be demoted or deactivated (mirrors
  // the backend guard so the UI disables those actions up front).
  const activeAdminCount = items.filter((e) => e.role === "admin" && e.is_active).length;
  const isLastAdmin = (emp: Employee) =>
    emp.role === "admin" && emp.is_active && activeAdminCount <= 1;

  async function toggleStatus(emp: Employee) {
    setError(null);
    try {
      await employeesApi.setStatus(emp.id, !emp.is_active);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update status");
    }
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

      <Input
        placeholder="Search by name, phone, email, designation…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-md"
      />

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
                  No team members yet. Add your first one.
                </TableCell>
              </TableRow>
            ) : (
              items.map((emp) => {
                const lastAdmin = isLastAdmin(emp);
                return (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.full_name}</TableCell>
                    <TableCell>
                      <Badge variant={emp.role === "admin" ? "blue" : "secondary"}>
                        {emp.role === "admin" ? "Admin" : "Employee"}
                      </Badge>
                    </TableCell>
                    <TableCell>{emp.designation ?? "—"}</TableCell>
                    <TableCell>{emp.phone ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={emp.is_active ? "green" : "secondary"}>
                        {emp.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditing(emp);
                              setModalOpen(true);
                            }}
                            aria-label="Edit"
                            title="Edit details"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

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

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStatus(emp)}
                            disabled={emp.is_active && lastAdmin}
                            aria-label={emp.is_active ? "Deactivate" : "Activate"}
                            title={
                              emp.is_active && lastAdmin
                                ? LAST_ADMIN_MSG
                                : emp.is_active
                                  ? "Deactivate"
                                  : "Activate"
                            }
                          >
                            <Power
                              className={
                                emp.is_active
                                  ? "h-4 w-4 text-emerald-600"
                                  : "h-4 w-4 text-muted-foreground"
                              }
                            />
                          </Button>
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
    </div>
  );
}
