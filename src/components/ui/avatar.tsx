import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Circular initials avatar with a blue→purple gradient. */
export function Avatar({ name, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white shadow-sm",
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
