import { motion } from "framer-motion";
import { CircleCheckBig, ClipboardList, FileText } from "lucide-react";

import { AwaitingAssignmentWidget } from "@/components/dashboard/AwaitingAssignmentWidget";
import { KpiCard, KpiCardSkeleton, KpiGrid } from "@/components/dashboard/KpiCards";
import { PendingApprovalsWidget } from "@/components/dashboard/PendingApprovalsWidget";
import { PromoCard } from "@/components/dashboard/PromoCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentWorkOrders } from "@/components/dashboard/RecentWorkOrders";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";

// Illustrative month-trend series for the KPI sparklines (visual accent).
const SPARKS = {
  workOrders: [8, 10, 9, 12, 11, 14, 16, 15, 18],
  completed: [4, 6, 5, 7, 9, 8, 11, 12, 14],
  invoices: [2, 3, 3, 5, 4, 6, 7, 8, 9],
};

export default function DashboardPage() {
  const { user, can } = useAuth();
  const { data, loading, error, reload } = useDashboard();

  const totals = data?.totals;
  const deltas = data?.deltas;
  const awaiting = data?.awaiting_assignment ?? [];
  const pending = data?.pending_approvals ?? [];
  const canApprove = can("employee:manage");

  return (
    <div className="space-y-8">
      <WelcomeSection name={user?.full_name ?? "there"} />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <KpiGrid>
        {loading || !totals || !deltas ? (
          Array.from({ length: 3 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              label="Total Work Orders"
              value={totals.work_orders}
              icon={ClipboardList}
              accent="navy"
              deltaPct={deltas.work_orders_pct}
              spark={SPARKS.workOrders}
              index={0}
            />
            <KpiCard
              label="Completed Orders"
              value={totals.completed_work_orders}
              icon={CircleCheckBig}
              accent="emerald"
              deltaPct={deltas.completed_pct}
              spark={SPARKS.completed}
              index={1}
            />
            <KpiCard
              label="Total Invoices"
              value={totals.invoices}
              icon={FileText}
              accent="gold"
              deltaPct={deltas.invoices_pct}
              spark={SPARKS.invoices}
              index={2}
            />
          </>
        )}
      </KpiGrid>

      {/* Pending employee approvals (admins) */}
      {!loading && canApprove && totals && totals.pending_approvals > 0 && (
        <PendingApprovalsWidget
          items={pending}
          count={totals.pending_approvals}
          onChanged={reload}
        />
      )}

      {/* Awaiting assignment queue (admins) */}
      {!loading && totals && totals.awaiting_assignment > 0 && (
        <AwaitingAssignmentWidget
          items={awaiting}
          count={totals.awaiting_assignment}
          onChanged={reload}
        />
      )}

      {/* Main grid: recent orders + promo (left), quick actions (right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 lg:col-span-2"
        >
          <RecentWorkOrders orders={data?.recent_work_orders ?? []} loading={loading} />
          <PromoCard />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-1"
        >
          <QuickActions />
        </motion.div>
      </div>
    </div>
  );
}
