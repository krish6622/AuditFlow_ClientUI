import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  FileText,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  Users,
  UserCircle,
  Contact,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  /** Permission required to see this item; omitted = visible to everyone. */
  permission?: string;
}

const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { label: "Work Orders", to: "/work-orders", icon: ClipboardList, permission: "workorder:view_all" },
  // Invoicing is a public module — visible to everyone (admins and employees).
  { label: "Invoices", to: "/invoices", icon: FileText },
  { label: "Employees", to: "/employees", icon: Users, permission: "employee:view" },
  { label: "Customers", to: "/customers", icon: Contact, permission: "customer:view" },
];

const SETTINGS_NAV: NavItem[] = [
  { label: "Profile", to: "/profile", icon: UserCircle },
  { label: "Change Password", to: "/change-password", icon: KeyRound },
];

function NavRow({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "h-[18px] w-[18px] transition-colors",
              isActive ? "text-white" : "text-slate-400 group-hover:text-white"
            )}
          />
          {item.label}
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </p>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { can } = useAuth();
  const mainNav = MAIN_NAV.filter((item) => !item.permission || can(item.permission));

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-900/40">
          <ClipboardList className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-semibold text-white">WorkFlow</p>
          <p className="text-xs text-slate-400">Organization Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3">
        <SectionLabel>Menu</SectionLabel>
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>

        <SectionLabel>Settings</SectionLabel>
        <div className="space-y-1">
          {SETTINGS_NAV.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      {/* Pro Tip */}
      <div className="p-3">
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-600/20 to-violet-600/20 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20">
              <Lightbulb className="h-4 w-4 text-amber-300" />
            </div>
            <p className="text-sm font-semibold text-white">Pro Tip</p>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            Convert completed work orders into invoices in one click to get paid faster.
          </p>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

/** Static on desktop (lg+); slide-in drawer on smaller screens. */
export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-64 transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent onNavigate={onClose} />
        </div>
      </div>
    </>
  );
}
