import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Sparkline } from "@/components/dashboard/Sparkline";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

export type Accent = "navy" | "gold" | "emerald" | "charcoal";

const ACCENT: Record<Accent, { icon: string; chip: string; spark: string }> = {
  navy: { icon: "text-navy dark:text-white", chip: "bg-navy/5 dark:bg-white/10", spark: "#0B132B" },
  gold: { icon: "text-gold", chip: "bg-gold/10", spark: "#C6A769" },
  emerald: {
    icon: "text-emerald-600",
    chip: "bg-emerald-50 dark:bg-emerald-500/10",
    spark: "#059669",
  },
  charcoal: {
    icon: "text-charcoal dark:text-white/80",
    chip: "bg-charcoal/5 dark:bg-white/10",
    spark: "#5b6473",
  },
};

export interface KpiCardProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  icon: LucideIcon;
  accent: Accent;
  /** Month-over-month change in percent; null hides the indicator. */
  deltaPct: number | null;
  spark: number[];
  index?: number;
}

export function KpiCard({
  label,
  value,
  format,
  icon: Icon,
  accent,
  deltaPct,
  spark,
  index = 0,
}: KpiCardProps) {
  const animated = useCountUp(value);
  const a = ACCENT[accent];
  const display = format ? format(animated) : Math.round(animated).toLocaleString("en-IN");
  const up = (deltaPct ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-softgray bg-white p-6 shadow-[0_10px_40px_-24px_rgba(11,19,43,0.25)] transition-shadow duration-200 hover:shadow-[0_18px_50px_-22px_rgba(11,19,43,0.32)] dark:border-white/10 dark:bg-[#0f1830]"
    >
      <div className="flex items-start justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", a.chip)}>
          <Icon className={cn("h-5 w-5", a.icon)} />
        </span>
        {deltaPct !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              up
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            )}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(Math.round(deltaPct))}%
          </span>
        )}
      </div>

      <p className="mt-5 text-sm text-charcoal/55 dark:text-white/55">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-navy dark:text-ivory">
        {display}
      </p>

      <div className="mt-3">
        <Sparkline data={spark} color={a.spark} id={`spark-${accent}-${index}`} />
      </div>
      <p className="mt-1 text-xs text-charcoal/40 dark:text-white/40">vs last month</p>
    </motion.div>
  );
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-3xl border border-softgray bg-white p-6 dark:border-white/10 dark:bg-[#0f1830]">
      <div className="h-11 w-11 animate-pulse rounded-2xl bg-softgray dark:bg-white/10" />
      <div className="mt-5 h-4 w-24 animate-pulse rounded bg-softgray dark:bg-white/10" />
      <div className="mt-2 h-8 w-20 animate-pulse rounded bg-softgray dark:bg-white/10" />
      <div className="mt-4 h-11 w-full animate-pulse rounded bg-softgray/60 dark:bg-white/5" />
    </div>
  );
}
