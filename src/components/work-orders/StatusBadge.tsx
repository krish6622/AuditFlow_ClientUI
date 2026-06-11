import { Badge } from "@/components/ui/badge";
import type { WorkOrderStatus } from "@/types/workOrder";

type Variant = "gold" | "navy" | "royal" | "green" | "secondary";

const MAP: Record<WorkOrderStatus, { label: string; variant: Variant }> = {
  awaiting_assignment: { label: "Awaiting Assignment", variant: "gold" },
  assigned: { label: "Assigned", variant: "navy" },
  in_progress: { label: "In Progress", variant: "royal" },
  completed: { label: "Completed", variant: "green" },
  closed: { label: "Closed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const cfg = MAP[status] ?? MAP.awaiting_assignment;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
