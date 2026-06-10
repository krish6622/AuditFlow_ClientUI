import { Construction, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
}

/** Tasteful empty state for modules that are planned but not yet built. */
export function ComingSoon({ title, description, icon: Icon = Construction }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">Coming soon</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            This module is part of the roadmap and will appear here once it ships.
          </p>
        </div>
      </Card>
    </div>
  );
}
