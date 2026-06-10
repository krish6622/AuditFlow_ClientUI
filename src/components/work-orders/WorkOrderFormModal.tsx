import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, employeesApi, workOrdersApi } from "@/lib/api";
import type { Employee } from "@/types/employee";
import {
  WORK_ORDER_STATUSES,
  type WorkOrder,
  type WorkOrderInput,
  type WorkOrderStatus,
} from "@/types/workOrder";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** When provided, the modal edits this order; otherwise it creates a new one. */
  workOrder?: WorkOrder | null;
}

interface FormState {
  customer_name: string;
  assignee_id: string;
  description: string;
  amount: string;
  due_date: string;
  notes: string;
  status: WorkOrderStatus;
}

const EMPTY: FormState = {
  customer_name: "",
  assignee_id: "",
  description: "",
  amount: "",
  due_date: "",
  notes: "",
  status: "pending",
};

function fromWorkOrder(wo: WorkOrder): FormState {
  return {
    customer_name: wo.customer_name ?? "",
    assignee_id: wo.assignee_id ?? "",
    description: wo.description ?? "",
    amount: wo.amount ?? "",
    due_date: wo.due_date ?? "",
    notes: wo.notes ?? "",
    status: wo.status,
  };
}

export function WorkOrderFormModal({ open, onClose, onSaved, workOrder }: Props) {
  const isEdit = !!workOrder;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(workOrder ? fromWorkOrder(workOrder) : EMPTY);
      setError(null);
      employeesApi.list().then(setEmployees).catch(() => setEmployees([]));
    }
  }, [open, workOrder]);

  // Active employees, plus the currently-assigned one even if now inactive.
  const assignable = employees.filter(
    (e) => e.is_active || e.id === form.assignee_id
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload: WorkOrderInput = {
      customer_name: form.customer_name.trim(),
      description: form.description.trim(),
      assignee_id: form.assignee_id || null,
      amount: form.amount === "" ? 0 : form.amount,
      due_date: form.due_date || null,
      notes: form.notes.trim() || null,
      status: form.status,
    };
    try {
      if (isEdit && workOrder) {
        await workOrdersApi.update(workOrder.id, payload);
      } else {
        await workOrdersApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save work order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${workOrder?.number}` : "Create work order"}
      description={isEdit ? undefined : "Add a new job for a customer."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer name</Label>
            <Input
              id="customer_name"
              required
              value={form.customer_name}
              onChange={(e) => set("customer_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee">Assign employee</Label>
            <Select
              id="employee"
              value={form.assignee_id}
              onChange={(e) => set("assignee_id", e.target.value)}
            >
              <option value="">Unassigned</option>
              {assignable.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                  {emp.designation ? ` · ${emp.designation}` : ""}
                  {emp.is_active ? "" : " (inactive)"}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Work description</Label>
          <Textarea
            id="description"
            required
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due date</Label>
            <Input
              id="due_date"
              type="date"
              value={form.due_date}
              onChange={(e) => set("due_date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as WorkOrderStatus)}
            >
              {WORK_ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
