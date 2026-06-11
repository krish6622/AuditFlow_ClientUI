import { Badge } from "@/components/ui/badge";
import type { WorkOrderStatus } from "@/types/workOrder";

type Variant = "amber" | "blue" | "green" | "secondary";

const MAP: Record<WorkOrderStatus, { label: string; variant: Variant }> = {
  awaiting_assignment: { label: "Awaiting Assignment", variant: "amber" },
  assigned: { label: "Assigned", variant: "blue" },
  in_progress: { label: "In Progress", variant: "blue" },
  completed: { label: "Completed", variant: "green" },
  closed: { label: "Closed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const cfg = MAP[status] ?? MAP.awaiting_assignment;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
