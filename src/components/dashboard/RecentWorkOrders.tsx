import { Link } from "react-router-dom";
import { ArrowRight, Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RecentWorkOrder } from "@/types/dashboard";
import type { WorkOrderStatus } from "@/types/workOrder";

const STATUS: Record<WorkOrderStatus, { label: string; cls: string }> = {
  awaiting_assignment: {
    label: "Awaiting Assignment",
    cls: "bg-gold/15 text-[#9a7b3f] dark:bg-gold/15 dark:text-gold",
  },
  assigned: {
    label: "Assigned",
    cls: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  },
  completed: {
    label: "Completed",
    cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  closed: {
    label: "Closed",
    cls: "bg-charcoal/10 text-charcoal dark:bg-white/10 dark:text-white/70",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-charcoal/10 text-charcoal/70 dark:bg-white/10 dark:text-white/50",
  },
};

function formatDue(date: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props {
  orders: RecentWorkOrder[];
  loading: boolean;
}

const COLS = ["Order ID", "Customer", "Assignee", "Status", "Due Date", ""];

export function RecentWorkOrders({ orders, loading }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-softgray bg-white shadow-[0_10px_40px_-24px_rgba(11,19,43,0.25)] dark:border-white/10 dark:bg-[#0f1830]">
      <div className="flex items-center justify-between border-b border-softgray px-6 py-5 dark:border-white/10">
        <div>
          <h2 className="font-serif text-xl font-medium text-navy dark:text-ivory">
            Recent Work Orders
          </h2>
          <p className="mt-0.5 text-sm text-charcoal/55 dark:text-white/50">
            Latest jobs across your team.
          </p>
        </div>
        <Link
          to="/work-orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy transition-colors hover:text-gold dark:text-white/80 dark:hover:text-gold"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-softgray dark:border-white/10">
              {COLS.map((c, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-charcoal/45 dark:text-white/40"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-softgray/60 dark:border-white/5">
                  {COLS.map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-softgray dark:bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} className="px-6 py-14 text-center text-charcoal/50 dark:text-white/40">
                  No work orders yet.{" "}
                  <Link to="/work-orders/new" className="font-medium text-gold hover:underline">
                    Create your first one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const s = STATUS[o.status];
                return (
                  <tr
                    key={o.id}
                    className="group border-b border-softgray/60 transition-colors last:border-0 hover:bg-charcoal/[0.02] dark:border-white/5 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-4 font-medium tabular-nums text-navy dark:text-white">
                      {o.number}
                    </td>
                    <td className="px-6 py-4 text-charcoal dark:text-white/80">
                      {o.customer_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-charcoal/80 dark:text-white/70">
                      {o.assigned_employee_name ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                          s.cls
                        )}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal/70 dark:text-white/60">
                      {formatDue(o.due_date)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/work-orders"
                        aria-label={`View ${o.number}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-charcoal/40 opacity-0 transition-all hover:bg-charcoal/5 hover:text-navy group-hover:opacity-100 dark:text-white/40 dark:hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
