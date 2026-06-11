import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, KeyRound, LogOut, Settings, UserCircle } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  employee: "Employee",
};

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;
  const role = ROLE_LABEL[user.role] ?? user.role;

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-charcoal/5 dark:hover:bg-white/10 sm:gap-3 sm:pr-3"
      >
        <span className="rounded-full ring-1 ring-gold/40">
          <Avatar name={user.full_name} />
        </span>
        <div className="hidden text-left leading-tight sm:block">
          <p className="text-sm font-medium text-charcoal dark:text-white">{user.full_name}</p>
          <p className="text-xs text-charcoal/50 dark:text-white/50">{role}</p>
        </div>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-charcoal/40 transition-transform dark:text-white/40 sm:block",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_60px_-20px_rgba(11,19,43,0.25)] dark:border-white/10 dark:bg-[#0f1830]">
          <div className="border-b border-softgray px-4 py-3 dark:border-white/10">
            <p className="truncate text-sm font-medium text-charcoal dark:text-white">
              {user.full_name}
            </p>
            <p className="truncate text-xs text-charcoal/50 dark:text-white/50">
              {user.email ?? user.phone ?? ""}
            </p>
          </div>
          <div className="p-1.5">
            <MenuButton icon={UserCircle} label="Profile" onClick={() => go("/profile")} />
            <MenuButton icon={KeyRound} label="Change Password" onClick={() => go("/change-password")} />
            <MenuButton icon={Settings} label="Settings" onClick={() => go("/settings")} />
          </div>
          <div className="border-t border-softgray p-1.5 dark:border-white/10">
            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof UserCircle;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-charcoal transition-colors hover:bg-charcoal/5 dark:text-white/80 dark:hover:bg-white/10"
    >
      <Icon className="h-4 w-4 text-charcoal/40 dark:text-white/40" />
      {label}
    </button>
  );
}
