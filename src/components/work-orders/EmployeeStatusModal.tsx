import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { StatusBadge } from "@/components/work-orders/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, workOrdersApi } from "@/lib/api";
import {
  WORK_ORDER_PROGRESS_STATUSES,
  type WorkOrder,
  type WorkOrderStatus,
} from "@/types/workOrder";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  workOrder: WorkOrder | null;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export function EmployeeStatusModal({ open, onClose, onSaved, workOrder }: Props) {
  const [status, setStatus] = useState<WorkOrderStatus>("in_progress");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && workOrder) {
      // Employees only move work forward (in progress → completed).
      setStatus(workOrder.status === "completed" ? "completed" : "in_progress");
      setNote("");
      setError(null);
    }
  }, [open, workOrder]);

  if (!workOrder) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workOrder) return;
    setError(null);
    setSaving(true);
    try {
      await workOrdersApi.updateStatus(workOrder.id, {
        status,
        note: note.trim() || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={workOrder.number}>
      <div className="mb-4 rounded-lg border bg-muted/40 p-3">
        <Detail label="Customer" value={workOrder.customer_name ?? "—"} />
        <Detail label="Description" value={workOrder.description ?? "—"} />
        <Detail label="Due date" value={workOrder.due_date ?? "—"} />
        <div className="flex items-center justify-between gap-4 pt-1 text-sm">
          <span className="text-muted-foreground">Current status</span>
          <StatusBadge status={workOrder.status} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Change status</Label>
          <Select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
          >
            {WORK_ORDER_PROGRESS_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">Completion / progress note</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you do? Any issues?"
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
            Save update
          </Button>
        </div>
      </form>
    </Modal>
  );
}
