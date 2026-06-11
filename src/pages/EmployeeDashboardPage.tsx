import { useCallback, useEffect, useState } from "react";
import { CalendarClock, ClipboardList, Loader2 } from "lucide-react";

import { EmployeeStatusModal } from "@/components/work-orders/EmployeeStatusModal";
import { StatusBadge } from "@/components/work-orders/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { ApiError, workOrdersApi } from "@/lib/api";
import { WORK_ORDER_STATUSES, type WorkOrder, type WorkOrderStatus } from "@/types/workOrder";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<WorkOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workOrdersApi.mine({ status: statusFilter, page_size: 100 });
      setOrders(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your work orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = {
    assigned: orders.filter((o) => o.status === "assigned").length,
    in_progress: orders.filter((o) => o.status === "in_progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hi {user?.full_name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here are the jobs assigned to you.</p>
      </div>

      {/* Quick counts */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Assigned", value: counts.assigned, cls: "text-amber-600" },
          { label: "In Progress", value: counts.in_progress, cls: "text-blue-600" },
          { label: "Completed", value: counts.completed, cls: "text-emerald-600" },
        ].map((c) => (
          <Card key={c.label} className="p-4 text-center">
            <p className={`text-2xl font-semibold ${c.cls}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          My Work Orders
        </h2>
        <Select
          className="w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | "")}
        >
          <option value="">All statuses</option>
          {WORK_ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <ClipboardList className="h-8 w-8 opacity-40" />
          <p>No work orders assigned to you yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {orders.map((wo) => (
            <Card key={wo.id} className="p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{wo.number}</p>
                  <p className="text-sm text-muted-foreground">{wo.customer_name}</p>
                </div>
                <StatusBadge status={wo.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-foreground">{wo.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {wo.due_date ? `Due ${wo.due_date}` : "No due date"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActive(wo);
                    setModalOpen(true);
                  }}
                >
                  Update status
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EmployeeStatusModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        workOrder={active}
      />
    </div>
  );
}
