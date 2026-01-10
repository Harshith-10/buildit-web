import type * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/index";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/60 bg-card/60 p-6 backdrop-blur",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-70"
      />
      <div className="flex items-start gap-4">
        <div className="mt-0.5 rounded-lg border border-border/60 bg-background/40 p-2 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
