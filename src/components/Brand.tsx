import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";

type Variant = "onLight" | "onDark";
type Size = "sm" | "md" | "lg";

interface BrandProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const SIZES: Record<
  Size,
  { mark: string; rule: string; name: string; sub: string; gap: string }
> = {
  sm: { mark: "h-9 w-9", rule: "h-8", name: "text-sm", sub: "text-[8px]", gap: "gap-2.5" },
  md: { mark: "h-12 w-12", rule: "h-10", name: "text-lg", sub: "text-[9px]", gap: "gap-3" },
  lg: { mark: "h-16 w-16", rule: "h-14", name: "text-3xl", sub: "text-[12px]", gap: "gap-4" },
};

/**
 * Elangovan Associates brand lockup: the serif "E" + gold-swoosh mark, a thin
 * vertical gold rule, then "ELANGOVAN" in serif above "ASSOCIATES" flanked by
 * two thin gold divider lines.
 */
export function Brand({ variant = "onLight", size = "md", className }: BrandProps) {
  const s = SIZES[size];
  const ink = variant === "onDark" ? "text-white" : "text-navy dark:text-ivory";

  return (
    <div className={cn("flex items-center", s.gap, className)} aria-label="Elangovan Associates">
      <BrandMark className={cn("shrink-0", s.mark, ink)} />

      {/* thin vertical gold rule */}
      <span className={cn("w-px shrink-0 bg-gradient-to-b from-gold/10 via-gold/70 to-gold/10", s.rule)} />

      <div className="leading-none">
        <p className={cn("font-serif font-medium tracking-[0.10em]", s.name, ink)}>ELANGOVAN</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-px w-3 bg-gold/70" />
          <span className={cn("font-sans font-medium uppercase tracking-[0.36em] text-gold", s.sub)}>
            Associates
          </span>
          <span className="h-px flex-1 bg-gold/50" />
        </div>
      </div>
    </div>
  );
}
