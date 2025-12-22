import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  trend?: {
    value: number; // percentage
    label?: string; // e.g., "from last month"
    direction: "up" | "down" | "neutral";
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  iconClassName,
  trend,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-full bg-primary/10", iconClassName)}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div
            className={cn(
              "text-xs flex items-center mt-1",
              trend.direction === "up"
                ? "text-green-500"
                : trend.direction === "down"
                  ? "text-red-500"
                  : "text-muted-foreground",
            )}
          >
            {trend.direction === "up"
              ? "↑"
              : trend.direction === "down"
                ? "↓"
                : "→"}
            <span className="ml-1">{Math.abs(trend.value)}%</span>
            {trend.label && (
              <span className="text-muted-foreground ml-1">{trend.label}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
