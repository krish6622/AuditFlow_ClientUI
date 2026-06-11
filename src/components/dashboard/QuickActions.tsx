import { Link } from "react-router-dom";
import {
  ChevronRight,
  ClipboardList,
  Contact,
  FilePlus2,
  FileText,
  Plus,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Action {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  chip: string;
}

const ACTIONS: Action[] = [
  {
    title: "Create Work Order",
    description: "Raise a new job",
    to: "/work-orders/new",
    icon: Plus,
    chip: "bg-navy/5 text-navy dark:bg-white/10 dark:text-white",
  },
  {
    title: "View Work Orders",
    description: "Track every job",
    to: "/work-orders",
    icon: ClipboardList,
    chip: "bg-gold/10 text-gold",
  },
  {
    title: "Create Invoice",
    description: "Bill a completed order",
    to: "/invoice",
    icon: FilePlus2,
    chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10",
  },
  {
    title: "View Invoices",
    description: "Manage billing",
    to: "/invoices",
    icon: FileText,
    chip: "bg-charcoal/5 text-charcoal dark:bg-white/10 dark:text-white/80",
  },
  {
    title: "Manage Customers",
    description: "Your client book",
    to: "/customers",
    icon: Contact,
    chip: "bg-gold/10 text-gold",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-3xl border border-softgray bg-white p-5 shadow-[0_10px_40px_-24px_rgba(11,19,43,0.25)] dark:border-white/10 dark:bg-[#0f1830]">
      <h2 className="px-1 pb-3 font-serif text-xl font-medium text-navy dark:text-ivory">
        Quick Actions
      </h2>
      <div className="space-y-1.5">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.title}
              to={a.to}
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-charcoal/[0.03] dark:hover:bg-white/[0.04]"
            >
              {/* Gold accent appears on hover */}
              <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-gold opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", a.chip)}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal dark:text-white">{a.title}</p>
                <p className="truncate text-xs text-charcoal/50 dark:text-white/45">
                  {a.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-charcoal/30 transition-transform group-hover:translate-x-0.5 group-hover:text-gold dark:text-white/30" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
