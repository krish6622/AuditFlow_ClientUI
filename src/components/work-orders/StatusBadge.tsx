import { Badge } from "@/components/ui/badge";
import type { WorkOrderStatus } from "@/types/workOrder";

const MAP: Record<WorkOrderStatus, { label: string; variant: "amber" | "blue" | "green" }> = {
  pending: { label: "Pending", variant: "amber" },
  in_progress: { label: "In Progress", variant: "blue" },
  completed: { label: "Completed", variant: "green" },
};

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const cfg = MAP[status] ?? MAP.pending;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
