import { CheckCircle2, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/work-orders/StatusBadge";
import {
  categoryLabel,
  type WorkOrder,
  type WorkOrderUrgency,
} from "@/types/workOrder";

const URGENCY_BADGE: Record<WorkOrderUrgency, { label: string; variant: "secondary" | "blue" | "amber" }> = {
  low: { label: "Low", variant: "secondary" },
  medium: { label: "Medium", variant: "blue" },
  high: { label: "High", variant: "amber" },
};

function formatAmount(amount: string): string {
  const n = Number(amount);
  if (Number.isNaN(n) || n === 0) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

interface Props {
  workOrder: WorkOrder;
  onCreateAnother: () => void;
}

export function WorkOrderSummaryCard({ workOrder: wo, onCreateAnother }: Props) {
  const urgency = URGENCY_BADGE[wo.urgency];

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Work order created</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{wo.number}</h2>
          </div>
          <StatusBadge status={wo.status} />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Category" value={categoryLabel(wo.category, wo.category_other)} />
          <Field label="Date" value={wo.order_date} />
          <Field label="Customer" value={wo.customer_name} />
          <Field label="Contact" value={wo.contact_number} />
          <Field label="Assigned employee" value={wo.assigned_employee_name} />
          <Field label="Urgency" value={<Badge variant={urgency.variant}>{urgency.label}</Badge>} />
          <Field label="Due date" value={wo.due_date} />
          <Field label="Expected amount" value={formatAmount(wo.amount)} />
          <div className="sm:col-span-2">
            <Field
              label="Work description"
              value={<span className="whitespace-pre-wrap">{wo.description}</span>}
            />
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCreateAnother}>
            <Plus className="h-4 w-4" />
            Create another
          </Button>
          <Button asChild>
            <Link to="/work-orders">View all work orders</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
