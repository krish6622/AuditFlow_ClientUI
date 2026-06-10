import { CircleCheckBig, ClipboardList, FileText, Wallet } from "lucide-react";

import { KpiCard, KpiCardSkeleton, KpiGrid } from "@/components/dashboard/KpiCards";
import { PromoCard } from "@/components/dashboard/PromoCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentWorkOrders } from "@/components/dashboard/RecentWorkOrders";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";

function formatINR(amount: string | number): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isNaN(n) ? 0 : n);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error } = useDashboard();

  const totals = data?.totals;
  const deltas = data?.deltas;

  return (
    <div className="space-y-6">
      <WelcomeSection name={user?.full_name ?? "there"} />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <KpiGrid>
        {loading || !totals || !deltas ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              label="Total Work Orders"
              value={String(totals.work_orders)}
              icon={ClipboardList}
              accent="blue"
              deltaPct={deltas.work_orders_pct}
            />
            <KpiCard
              label="Completed Orders"
              value={String(totals.completed_work_orders)}
              icon={CircleCheckBig}
              accent="emerald"
              deltaPct={deltas.completed_pct}
            />
            <KpiCard
              label="Total Invoices"
              value={String(totals.invoices)}
              icon={FileText}
              accent="amber"
              deltaPct={deltas.invoices_pct}
            />
            <KpiCard
              label="Total Revenue"
              value={formatINR(totals.revenue)}
              icon={Wallet}
              accent="violet"
              deltaPct={deltas.revenue_pct}
            />
          </>
        )}
      </KpiGrid>

      {/* Main grid: recent orders + promo (left), quick actions (right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentWorkOrders orders={data?.recent_work_orders ?? []} loading={loading} />
          <PromoCard />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
