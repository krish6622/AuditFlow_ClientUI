import logoUrl from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";

/**
 * Elangovan Associates logo mark — the firm's actual logo image (navy serif "E"
 * crossed by a gold/blue swoosh). Sizing comes from the caller via ``className``
 * (e.g. ``h-9 w-9``); ``object-contain`` preserves the artwork's aspect ratio so
 * the near-square source never distorts on light or dark surfaces.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="Elangovan Associates"
      className={cn("rounded-md object-contain", className)}
    />
  );
}
