import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  ClipboardPen,
  Contact,
  FileText,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface Item {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  permission?: string;
  hideForPermission?: string;
}

const ITEMS: Item[] = [
  { label: "Home", to: "/", icon: LayoutDashboard, end: true },
  {
    label: "Requests",
    to: "/my-requests",
    icon: ClipboardPen,
    permission: "workorder:create_request",
    hideForPermission: "workorder:view_all",
  },
  { label: "Orders", to: "/work-orders", icon: ClipboardList, permission: "workorder:view_all" },
  { label: "Invoices", to: "/invoices", icon: FileText },
  { label: "Clients", to: "/customers", icon: Contact, permission: "customer:view" },
  { label: "Team", to: "/employees", icon: Users, permission: "employee:view" },
];

/** Fixed bottom navigation for mobile (hidden on lg+). */
export function MobileNav() {
  const { can } = useAuth();
  const items = ITEMS.filter(
    (i) =>
      (!i.permission || can(i.permission)) &&
      !(i.hideForPermission && can(i.hideForPermission))
  ).slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-softgray bg-ivory/95 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1020]/95 lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {items.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors",
                isActive ? "text-gold" : "text-charcoal/50 dark:text-white/50"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-5 w-5", isActive && "text-gold")} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
