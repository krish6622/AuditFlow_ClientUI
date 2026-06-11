import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        amber: "border-transparent bg-amber-100 text-amber-800",
        blue: "border-transparent bg-blue-100 text-blue-800",
        green: "border-transparent bg-green-100 text-green-800",
        // Brand status chips (visiting-card palette)
        gold: "border border-gold/30 bg-gold/10 text-[#9A6F2E] dark:text-gold",
        navy: "border-transparent bg-navy/10 text-navy dark:bg-white/10 dark:text-ivory",
        royal: "border-transparent bg-royal/10 text-royal dark:bg-royal/20 dark:text-blue-200",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
