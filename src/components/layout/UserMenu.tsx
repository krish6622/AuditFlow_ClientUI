import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, KeyRound, LogOut, UserCircle } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  org_admin: "Organization Admin",
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-muted sm:gap-3 sm:pr-3"
      >
        <Avatar name={user.full_name} />
        <div className="hidden text-left leading-tight sm:block">
          <p className="text-sm font-medium text-foreground">{user.full_name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-muted-foreground transition-transform sm:block",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border bg-card shadow-lg">
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-medium text-foreground">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email ?? user.phone ?? ""}</p>
          </div>
          <div className="p-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/change-password");
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Change Password
            </button>
          </div>
          <div className="border-t p-1">
            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
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
