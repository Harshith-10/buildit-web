import * as React from "react";

import { cn } from "@/lib/utils/index";

interface DiagonalCrossGridTopProps {
  children?: React.ReactNode;
  className?: string;
  tileSize?: number;
  lineColor?: string;
  mask?: boolean;
}

export function DiagonalCrossGridTop({
  children,
  className,
  tileSize = 40,
  lineColor = "var(--border)",
  mask = true,
}: DiagonalCrossGridTopProps) {
  const maskGradient =
    "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)";

  return (
    <div className={cn("relative w-full", className)}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49%, ${lineColor} 49%, ${lineColor} 51%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, ${lineColor} 49%, ${lineColor} 51%, transparent 51%)
          `,
          backgroundSize: `${tileSize}px ${tileSize}px`,
          WebkitMaskImage: mask ? maskGradient : undefined,
          maskImage: mask ? maskGradient : undefined,
        }}
      />

      <div className="relative">{children}</div>
    </div>
  );
}