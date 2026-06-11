import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { ApiError, employeesApi, workOrdersApi } from "@/lib/api";
import type { Employee } from "@/types/employee";

interface Target {
  id: string;
  number: string;
  customer_name?: string | null;
}

interface Props {
  open: boolean;
  workOrder: Target | null;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignWorkOrderModal({ open, workOrder, onClose, onAssigned }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAssigneeId("");
      setDueDate("");
      setError(null);
      employeesApi
        .list()
        .then((list) => setEmployees(list.filter((e) => e.role === "employee" && e.is_active)))
        .catch(() => setEmployees([]));
    }
  }, [open]);

  if (!workOrder) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workOrder) return;
    if (!assigneeId) {
      setError("Please choose an employee to assign.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await workOrdersApi.assign(workOrder.id, {
        assignee_id: assigneeId,
        due_date: dueDate || null,
      });
      onAssigned();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not assign the work order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign ${workOrder.number}`}
      description={workOrder.customer_name ?? undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assignee">Assign to</Label>
          <Select id="assignee" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="" disabled>
              Select an employee…
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
                {emp.designation ? ` · ${emp.designation}` : ""}
              </option>
            ))}
          </Select>
          {employees.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No active employees available to assign.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">
            Due date <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Assign &amp; notify
          </Button>
        </div>
      </form>
    </Modal>
  );
}
