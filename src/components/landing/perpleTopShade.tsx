import * as React from "react";

import { cn } from "@/lib/utils/index";

interface PurpleTopShadeProps {
  children?: React.ReactNode;
  className?: string;
  glowOpacity?: number;
  lightGlowOpacity?: number;
  base?: "background" | "transparent";
  fixed?: boolean;
}

export function PurpleTopShade({
  children,
  className,
  glowOpacity = 0.85,
  lightGlowOpacity,
  base = "background",
  fixed = false,
}: PurpleTopShadeProps) {
  const resolvedLightGlowOpacity = lightGlowOpacity ?? glowOpacity * 0.45;
  const baseFill = base === "background" ? "var(--background)" : "transparent";
  const positioning = fixed ? "fixed" : "absolute";

  return (
    <div
      className={cn(
        "relative w-full text-foreground",
        base === "background" ? "bg-background" : "bg-transparent",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn("inset-0 z-0 hidden dark:block", positioning)}
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, ${glowOpacity}), transparent 70%), ${baseFill}`,
        }}
      />
      <div
        aria-hidden
        className={cn("inset-0 z-0 dark:hidden", positioning)}
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, ${resolvedLightGlowOpacity}), transparent 70%), ${baseFill}`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}