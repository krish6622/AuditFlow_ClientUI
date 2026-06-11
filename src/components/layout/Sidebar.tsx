import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  ClipboardPen,
  Contact,
  FileText,
  History,
  KeyRound,
  LayoutDashboard,
  PieChart,
  Settings,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Brand } from "@/components/Brand";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  permission?: string;
  /** Hide the item when the user also holds this permission (e.g. admins). */
  hideForPermission?: string;
}

const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  // Employee-only: their own submitted requests (admins use Work Orders instead).
  {
    label: "My Requests",
    to: "/my-requests",
    icon: ClipboardPen,
    permission: "workorder:create_request",
    hideForPermission: "workorder:view_all",
  },
  { label: "Work Orders", to: "/work-orders", icon: ClipboardList, permission: "workorder:view_all" },
  { label: "Invoices", to: "/invoices", icon: FileText },
  { label: "Customers", to: "/customers", icon: Contact, permission: "customer:view" },
  { label: "Employees", to: "/employees", icon: Users, permission: "employee:view" },
  { label: "Reports", to: "/reports", icon: PieChart, permission: "report:view" },
  { label: "Audit Log", to: "/audit-logs", icon: History, permission: "audit:view" },
];

const SETTINGS_NAV: NavItem[] = [
  { label: "Profile", to: "/profile", icon: UserCircle },
  { label: "Change Password", to: "/change-password", icon: KeyRound },
  { label: "Settings", to: "/settings", icon: Settings },
];

// Fine-grain texture for the navy panel (very subtle).
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function NavRow({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
          isActive
            ? "bg-white/[0.06] text-white shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
            : "text-slate-400 hover:translate-x-0.5 hover:bg-white/[0.03] hover:text-white"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active champagne-gold indicator with soft glow */}
          <span
            className={cn(
              "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-gold transition-opacity duration-200",
              isActive
                ? "opacity-100 shadow-[0_0_12px_rgba(198,167,105,0.7)]"
                : "opacity-0 group-hover:opacity-40"
            )}
          />
          <Icon
            className={cn(
              "h-[18px] w-[18px] transition-colors",
              isActive ? "text-gold" : "text-slate-500 group-hover:text-gold/80"
            )}
          />
          <span className={cn("font-medium tracking-wide", isActive && "font-semibold")}>
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
      {children}
    </p>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { can } = useAuth();
  const mainNav = MAIN_NAV.filter(
    (item) =>
      (!item.permission || can(item.permission)) &&
      !(item.hideForPermission && can(item.hideForPermission))
  );

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-navy">
      {/* Texture & lighting layers */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
        style={{ backgroundImage: GRAIN }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(198,167,105,0.10) 0%, transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gold/25 to-transparent" />

      {/* Brand */}
      <div className="relative z-10 px-5 py-6">
        <Brand variant="onDark" size="md" />
      </div>

      <div className="relative z-10 mx-5 h-px bg-white/5" />

      {/* Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-3 pb-4">
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

      {/* Footer hallmark */}
      <div className="relative z-10 border-t border-white/5 px-5 py-4">
        <p className="text-[11px] tracking-wide text-slate-500">
          <span className="text-gold/80">Secure.</span> Reliable. Confidential.
        </p>
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
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-72">
          <SidebarContent />
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-72 transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent onNavigate={onClose} />
        </div>
      </div>
    </>
  );
}
