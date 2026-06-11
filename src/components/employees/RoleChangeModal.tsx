import { useState } from "react";
import { Loader2, ShieldCheck, ShieldMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ApiError, employeesApi } from "@/lib/api";
import type { Employee } from "@/types/employee";

interface Props {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onChanged: () => void;
}

// Exact confirmation copy from the role-promotion flow.
const PROMOTE_COPY =
  "You are granting Admin access. Admins can manage employees, assign work orders, and generate invoices.";

export function RoleChangeModal({ open, employee, onClose, onChanged }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!employee) return null;

  const promoting = employee.role !== "admin";
  const targetRole = promoting ? "admin" : "employee";

  async function submit() {
    if (!employee) return;
    setSaving(true);
    setError(null);
    try {
      await employeesApi.setRole(employee.id, targetRole);
      onChanged();
      onClose();
    } catch (err) {
      // Surface the backend's friendly message (e.g. the last-admin guard).
      setError(err instanceof ApiError ? err.message : "Could not change role");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={promoting ? "Grant Admin access?" : "Change role to Employee?"}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
          {promoting ? (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          ) : (
            <ShieldMinus className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          )}
          <p className="text-sm text-foreground">
            {promoting
              ? PROMOTE_COPY
              : `${employee.full_name} will lose admin access and become an Employee — able to see only their own assigned work.`}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {promoting ? "Promote " : "Demote "}
          <span className="font-medium text-foreground">{employee.full_name}</span>?
        </p>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {promoting ? "Grant Admin access" : "Change to Employee"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
