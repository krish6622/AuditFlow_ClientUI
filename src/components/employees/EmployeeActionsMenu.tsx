import { useEffect, useRef, useState, type ComponentType } from "react";
import { MoreVertical, Pencil, Power, PowerOff, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Employee } from "@/types/employee";

const LAST_ADMIN_MSG = "At least one Admin must remain in the organization.";

interface Props {
  employee: Employee;
  lastAdmin: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

function Item({
  icon: Icon,
  label,
  onClick,
  destructive,
  disabled,
  title,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        destructive
          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

/** Per-row Actions menu: Edit · Activate/Deactivate · Delete (red). */
export function EmployeeActionsMenu({
  employee,
  lastAdmin,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const close = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <Button variant="ghost" size="icon" aria-label="Actions" onClick={() => setOpen((o) => !o)}>
        <MoreVertical className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border bg-card py-1 text-left shadow-lg">
          <Item icon={Pencil} label="Edit" onClick={close(onEdit)} />
          {employee.is_active ? (
            <Item
              icon={PowerOff}
              label="Deactivate"
              onClick={close(onDeactivate)}
              disabled={lastAdmin}
              title={lastAdmin ? LAST_ADMIN_MSG : undefined}
            />
          ) : (
            <Item icon={Power} label="Activate" onClick={close(onActivate)} />
          )}
          <div className="my-1 h-px bg-border" />
          <Item
            icon={Trash2}
            label="Delete"
            destructive
            onClick={close(onDelete)}
            disabled={lastAdmin}
            title={lastAdmin ? LAST_ADMIN_MSG : undefined}
          />
        </div>
      )}
    </div>
  );
}
