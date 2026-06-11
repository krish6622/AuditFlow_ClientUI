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
  WORK_ORDER_CATEGORIES,
  WORK_ORDER_STATUSES,
  WORK_ORDER_URGENCIES,
  type WorkOrder,
  type WorkOrderCategory,
  type WorkOrderInput,
  type WorkOrderStatus,
  type WorkOrderUrgency,
} from "@/types/workOrder";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** When provided, the modal edits this order; otherwise it creates a new one. */
  workOrder?: WorkOrder | null;
}

interface FormState {
  category: WorkOrderCategory | "";
  category_other: string;
  customer_name: string;
  contact_number: string;
  assignee_id: string;
  urgency: WorkOrderUrgency;
  order_date: string;
  description: string;
  due_date: string;
  notes: string;
  status: WorkOrderStatus;
}

const EMPTY: FormState = {
  category: "",
  category_other: "",
  customer_name: "",
  contact_number: "",
  assignee_id: "",
  urgency: "medium",
  order_date: "",
  description: "",
  due_date: "",
  notes: "",
  status: "awaiting_assignment",
};

function fromWorkOrder(wo: WorkOrder): FormState {
  return {
    category: wo.category ?? "",
    category_other: wo.category_other ?? "",
    customer_name: wo.customer_name ?? "",
    contact_number: wo.contact_number ?? "",
    assignee_id: wo.assignee_id ?? "",
    urgency: wo.urgency ?? "medium",
    order_date: wo.order_date ?? "",
    description: wo.description ?? "",
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
  const assignable = employees.filter((e) => e.is_active || e.id === form.assignee_id);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.category) {
      setError("Please choose a category.");
      return;
    }
    if (form.category === "others" && !form.category_other.trim()) {
      setError("Please describe the 'Others' category.");
      return;
    }
    if (!form.contact_number.trim()) {
      setError("Contact number is required.");
      return;
    }

    setSaving(true);
    const payload: WorkOrderInput = {
      category: form.category,
      category_other: form.category === "others" ? form.category_other.trim() : null,
      customer_name: form.customer_name.trim(),
      contact_number: form.contact_number.trim(),
      description: form.description.trim(),
      assignee_id: form.assignee_id || null,
      urgency: form.urgency,
      order_date: form.order_date || null,
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
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="wo_category">Category</Label>
            <Select
              id="wo_category"
              value={form.category}
              onChange={(e) => set("category", e.target.value as WorkOrderCategory | "")}
            >
              <option value="" disabled>
                Select a category…
              </option>
              {WORK_ORDER_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wo_urgency">Urgency</Label>
            <Select
              id="wo_urgency"
              value={form.urgency}
              onChange={(e) => set("urgency", e.target.value as WorkOrderUrgency)}
            >
              {WORK_ORDER_URGENCIES.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {form.category === "others" && (
          <div className="space-y-2">
            <Label htmlFor="wo_category_other">Describe the category</Label>
            <Input
              id="wo_category_other"
              value={form.category_other}
              onChange={(e) => set("category_other", e.target.value)}
            />
          </div>
        )}

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
            <Label htmlFor="contact_number">Contact Number *</Label>
            <Input
              id="contact_number"
              required
              placeholder="Enter customer contact number"
              value={form.contact_number}
              onChange={(e) => set("contact_number", e.target.value)}
            />
          </div>
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
            <Label htmlFor="order_date">Date</Label>
            <Input
              id="order_date"
              type="date"
              value={form.order_date}
              onChange={(e) => set("order_date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date (Optional)</Label>
            <Input
              id="due_date"
              type="date"
              value={form.due_date}
              placeholder="Select due date"
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
          <Textarea id="notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
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
