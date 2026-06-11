import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Ban, CheckCircle2, Loader2, Pencil, Plus, Receipt, Trash2, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssignWorkOrderModal } from "@/components/work-orders/AssignWorkOrderModal";
import { WorkOrderFormModal } from "@/components/work-orders/WorkOrderFormModal";
import { ApiError, workOrdersApi } from "@/lib/api";
import {
  categoryLabel,
  WORK_ORDER_STATUSES,
  type WorkOrder,
  type WorkOrderStatus,
} from "@/types/workOrder";

const STATUS_BADGE: Record<
  WorkOrderStatus,
  { label: string; variant: "amber" | "blue" | "green" | "secondary" }
> = {
  awaiting_assignment: { label: "Awaiting Assignment", variant: "amber" },
  assigned: { label: "Assigned", variant: "blue" },
  in_progress: { label: "In Progress", variant: "blue" },
  completed: { label: "Completed", variant: "green" },
  closed: { label: "Closed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

const PAGE_SIZE = 20;

export default function WorkOrdersPage() {
  const [items, setItems] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkOrder | null>(null);
  const [assignTarget, setAssignTarget] = useState<WorkOrder | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Completed work orders are eligible for invoice generation.
  function createInvoice(wo: WorkOrder) {
    navigate("/invoice", {
      state: {
        prefill: {
          customerName: wo.customer_name ?? "",
          items: [{ description: wo.description ?? "", amount: 0 }],
        },
      },
    });
  }

  // Arriving via the "Create Work Order" quick action goes to the dedicated page.
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      searchParams.delete("new");
      setSearchParams(searchParams, { replace: true });
      navigate("/work-orders/new");
    }
  }, [searchParams, setSearchParams, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workOrdersApi.list({
        status: statusFilter,
        search: search.trim() || undefined,
        page,
        page_size: PAGE_SIZE,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load work orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(wo: WorkOrder) {
    setEditing(wo);
    setModalOpen(true);
  }

  async function handleDelete(wo: WorkOrder) {
    if (!window.confirm(`Delete work order ${wo.number}?`)) return;
    try {
      await workOrdersApi.remove(wo.id);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  async function handleClose(wo: WorkOrder) {
    if (!window.confirm(`Close ${wo.number}? This marks the order reviewed and complete.`)) return;
    setError(null);
    try {
      await workOrdersApi.close(wo.id);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not close the order");
    }
  }

  async function handleCancel(wo: WorkOrder) {
    if (!window.confirm(`Cancel ${wo.number}?`)) return;
    setError(null);
    try {
      await workOrdersApi.cancel(wo.id);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not cancel the order");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Work Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, assign, and track jobs for your customers.
          </p>
        </div>
        <Button onClick={() => navigate("/work-orders/new")}>
          <Plus className="h-4 w-4" />
          New work order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by number, customer, employee, description…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="sm:max-w-md"
        />
        <Select
          className="sm:w-48"
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as WorkOrderStatus | "");
          }}
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
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No work orders yet. Create your first one.
                </TableCell>
              </TableRow>
            ) : (
              items.map((wo) => {
                const badge = STATUS_BADGE[wo.status];
                return (
                  <TableRow key={wo.id}>
                    <TableCell className="font-medium">{wo.number}</TableCell>
                    <TableCell>{categoryLabel(wo.category, wo.category_other)}</TableCell>
                    <TableCell>{wo.customer_name}</TableCell>
                    <TableCell>{wo.assigned_employee_name ?? "—"}</TableCell>
                    <TableCell className="max-w-[16rem] truncate" title={wo.description ?? ""}>
                      {wo.description}
                    </TableCell>
                    <TableCell>{wo.due_date ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {(wo.status === "awaiting_assignment" || wo.status === "assigned") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAssignTarget(wo)}
                            aria-label="Assign"
                            title={wo.status === "assigned" ? "Reassign" : "Assign employee"}
                          >
                            <UserPlus className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        {wo.status === "completed" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleClose(wo)}
                              aria-label="Review & close"
                              title="Review & close"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => createInvoice(wo)}
                              aria-label="Create invoice"
                              title="Create invoice from this order"
                            >
                              <Receipt className="h-4 w-4 text-emerald-600" />
                            </Button>
                          </>
                        )}
                        {(wo.status === "awaiting_assignment" ||
                          wo.status === "assigned" ||
                          wo.status === "in_progress") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancel(wo)}
                            aria-label="Cancel order"
                            title="Cancel order"
                          >
                            <Ban className="h-4 w-4 text-amber-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(wo)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(wo)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} total</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <WorkOrderFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        workOrder={editing}
      />

      <AssignWorkOrderModal
        open={assignTarget !== null}
        workOrder={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssigned={load}
      />
    </div>
  );
}
