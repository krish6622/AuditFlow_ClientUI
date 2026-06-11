import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, UserRoundCheck, X } from "lucide-react";

import { ApiError, employeesApi } from "@/lib/api";
import type { PendingEmployee } from "@/types/dashboard";

interface Props {
  items: PendingEmployee[];
  count: number;
  onChanged: () => void;
}

/**
 * Admin dashboard widget surfacing self-registered users awaiting approval.
 * Approve activates the account; reject blocks sign-in. Mirrors the look of
 * AwaitingAssignmentWidget so the dashboard stays visually consistent.
 */
export function PendingApprovalsWidget({ items, count, onChanged }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    try {
      if (action === "approve") await employeesApi.approve(id);
      else await employeesApi.reject(id);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

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
            <UserRoundCheck className="h-5 w-5 text-gold" />
          </span>
          <div>
            <h2 className="font-serif text-xl font-medium text-navy dark:text-ivory">
              Pending Employee Approvals
            </h2>
            <p className="text-sm text-charcoal/55 dark:text-white/50">
              New sign-ups awaiting your approval before they can log in.
            </p>
          </div>
        </div>
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-gold px-2.5 text-sm font-semibold text-white">
          {count}
        </span>
      </div>

      {error && (
        <p className="px-6 pt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-charcoal/50 dark:text-white/40">
          No accounts waiting for approval. 🎉
        </p>
      ) : (
        <ul className="divide-y divide-softgray dark:divide-white/10">
          {items.map((u) => {
            const busy = busyId === u.id;
            return (
              <li
                key={u.id}
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-charcoal/[0.02] dark:hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <p className="font-medium text-navy dark:text-white">{u.full_name}</p>
                  <p className="truncate text-sm text-charcoal/60 dark:text-white/50">
                    {u.email ?? u.phone ?? "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => act(u.id, "approve")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500/30 dark:text-emerald-400"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => act(u.id, "reject")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:text-red-400"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
