"use client";

import { AlertTriangle, MonitorOff, RefreshCcw, Focus, Code2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ViolationType } from "@/stores/violation-store";

interface ExamViolationDialogProps {
  open: boolean;
  violationType: ViolationType;
  violationCount: number;
  totalViolations?: number;
  onResolve: () => void;
  onFullscreenReenter?: () => void;
}

const VIOLATION_CONFIG = {
  fullscreen: {
    icon: MonitorOff,
    title: "Fullscreen Required",
    message: "You exited fullscreen mode. The exam is paused.",
    buttonText: "Re-enter Fullscreen",
    color: "text-red-500",
  },
  tab: {
    icon: RefreshCcw,
    title: "Tab Switch Detected",
    message: "You switched tabs or minimized the exam window. This action has been logged.",
    buttonText: "Return to Exam",
    color: "text-orange-500",
  },
  blur: {
    icon: Focus,
    title: "Window Focus Lost",
    message: "You moved away from the exam window. This action has been logged.",
    buttonText: "Continue Exam",
    color: "text-orange-500",
  },
  devtools: {
    icon: Code2,
    title: "Suspicious Activity Detected",
    message: "Developer Tools or suspicious activity detected. This action has been logged.",
    buttonText: "Continue Exam",
    color: "text-yellow-500",
  },
} as const;

export function ExamViolationDialog({
  open,
  violationType,
  violationCount,
  totalViolations = 0,
  onResolve,
  onFullscreenReenter,
}: ExamViolationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const config = VIOLATION_CONFIG[violationType];
  const Icon = config.icon;

  // Block ESC key globally when dialog is open
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("[ExamViolationDialog] ESC key blocked");
      }
    };

    // Capture phase to intercept before any other handlers
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [open]);

  // Trap focus inside dialog
  useEffect(() => {
    if (!open || !dialogRef.current) return;

    const focusableElements = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [open]);

  // Block pointer events on backdrop (no clicking outside)
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[ExamViolationDialog] Backdrop click blocked");
  };

  const handleActionClick = async () => {
    if (violationType === "fullscreen" && onFullscreenReenter) {
      // For fullscreen violations, attempt to re-enter fullscreen
      console.log("[ExamViolationDialog] Attempting to re-enter fullscreen");
      onFullscreenReenter();
      // Dialog will auto-close when fullscreen is successfully entered
      // (handled by the fullscreen hook)
    } else {
      // For other violations, just resolve
      console.log(`[ExamViolationDialog] Resolving ${violationType} violation`);
      onResolve();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={handleBackdropClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="violation-title"
        aria-describedby="violation-description"
      >
        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div className={`rounded-full bg-background p-2 ${config.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2
              id="violation-title"
              className="text-lg font-semibold"
            >
              {config.title}
            </h2>
            <p
              id="violation-description"
              className="mt-2 text-sm text-muted-foreground"
            >
              {config.message}
            </p>

            {/* Violation Count */}
            {violationCount > 1 && (
              <div className="mt-3 rounded-md bg-muted px-3 py-2 text-xs">
                <span className="font-medium">Warning:</span> This is violation{" "}
                <span className="font-bold text-destructive">#{violationCount}</span> of this type.
              </div>
            )}

            {/* Total Violations Warning */}
            {totalViolations > 0 && (
              <div className={`mt-3 rounded-md px-3 py-2 text-xs font-medium ${
                totalViolations >= 2 ? 'bg-destructive/10 border border-destructive text-destructive' : 'bg-muted'
              }`}>
                <span className="font-bold">Total violations: {totalViolations}/3</span>
                {totalViolations >= 2 && (
                  <span className="ml-2">
                    ⚠️ {3 - totalViolations} violation{3 - totalViolations === 1 ? '' : 's'} remaining before exam termination
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleActionClick}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            autoFocus
          >
            {config.buttonText}
          </button>
        </div>

        {/* ESC Disabled Notice */}
        <div className="mt-4 border-t border-border pt-3 text-center text-xs text-muted-foreground">
          This dialog cannot be dismissed with ESC or by clicking outside
        </div>
      </div>
    </div>
  );
}
