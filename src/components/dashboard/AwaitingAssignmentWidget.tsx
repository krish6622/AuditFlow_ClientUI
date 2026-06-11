import { useState } from "react";
import { motion } from "framer-motion";
import { Inbox, UserPlus } from "lucide-react";

import { AssignWorkOrderModal } from "@/components/work-orders/AssignWorkOrderModal";
import type { RecentWorkOrder } from "@/types/dashboard";

interface Props {
  items: RecentWorkOrder[];
  count: number;
  onChanged: () => void;
}

export function AwaitingAssignmentWidget({ items, count, onChanged }: Props) {
  const [target, setTarget] = useState<RecentWorkOrder | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-gold/30 bg-white shadow-[0_10px_40px_-24px_rgba(11,19,43,0.25)] dark:border-gold/20 dark:bg-[#0f1830]"
    >
      <div className="flex items-center justify-between border-b border-softgray px-6 py-5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10">
            <Inbox className="h-5 w-5 text-gold" />
          </span>
          <div>
            <h2 className="font-serif text-xl font-medium text-navy dark:text-ivory">
              Awaiting Assignment
            </h2>
            <p className="text-sm text-charcoal/55 dark:text-white/50">
              New requests needing an employee.
            </p>
          </div>
        </div>
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-gold px-2.5 text-sm font-semibold text-white">
          {count}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-charcoal/50 dark:text-white/40">
          Nothing waiting — every request has been assigned. 🎉
        </p>
      ) : (
        <ul className="divide-y divide-softgray dark:divide-white/10">
          {items.map((wo) => (
            <li
              key={wo.id}
              className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-charcoal/[0.02] dark:hover:bg-white/[0.03]"
            >
              <div className="min-w-0">
                <p className="font-medium tabular-nums text-navy dark:text-white">{wo.number}</p>
                <p className="truncate text-sm text-charcoal/60 dark:text-white/50">
                  {wo.customer_name ?? "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTarget(wo)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy/15 px-4 py-2 text-sm font-medium text-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:text-gold dark:border-white/15 dark:text-white/80"
              >
                <UserPlus className="h-4 w-4" />
                Assign
              </button>
            </li>
          ))}
        </ul>
      )}

      <AssignWorkOrderModal
        open={target !== null}
        workOrder={target}
        onClose={() => setTarget(null)}
        onAssigned={onChanged}
      />
    </motion.div>
  );
}
