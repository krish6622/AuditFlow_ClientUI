import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Loader2, Plus } from "lucide-react";

import { StatusBadge } from "@/components/work-orders/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, workOrdersApi } from "@/lib/api";
import {
  categoryLabel,
  WORK_ORDER_STATUSES,
  type WorkOrder,
  type WorkOrderStatus,
} from "@/types/workOrder";

function formatDate(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MyRequestsPage() {
  const [items, setItems] = useState<WorkOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workOrdersApi.myRequests({ status: statusFilter, page_size: 100 });
      setItems(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your requests");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Work requests you've submitted and their current status.
          </p>
        </div>
        <Button asChild>
          <Link to="/work-orders/new">
            <Plus className="h-4 w-4" />
            New request
          </Link>
        </Button>
      </div>

      <Select
        className="sm:max-w-xs"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | "")}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {WORK_ORDER_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  <ClipboardList className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  You haven't submitted any requests yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell className="font-medium">{wo.number}</TableCell>
                  <TableCell>{categoryLabel(wo.category, wo.category_other)}</TableCell>
                  <TableCell>{wo.customer_name ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={wo.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(wo.due_date)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
