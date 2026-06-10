import { Link } from "react-router-dom";
import {
  ChevronRight,
  ClipboardList,
  FilePlus2,
  FileText,
  Plus,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Action {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  accent: string;
}

const ACTIONS: Action[] = [
  {
    title: "Create Work Order",
    description: "Add a new work order",
    to: "/work-orders?new=1",
    icon: Plus,
    accent: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    title: "View Work Orders",
    description: "Manage and track work orders",
    to: "/work-orders",
    icon: ClipboardList,
    accent: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
  {
    title: "Create Invoice",
    description: "Generate invoice from work order",
    to: "/invoices",
    icon: FilePlus2,
    accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    title: "View Invoices",
    description: "Manage and send invoices",
    to: "/invoices",
    icon: FileText,
    accent: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    title: "Manage Employees",
    description: "Add or manage employees",
    to: "/employees",
    icon: Users,
    accent: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  },
];

export function QuickActions() {
  return (
    <Card className="p-2">
      <h2 className="px-3 pb-1 pt-3 text-base font-semibold text-foreground">Quick Actions</h2>
      <div className="space-y-1 p-1">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.title}
              to={a.to}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", a.accent)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="truncate text-xs text-muted-foreground">{a.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
