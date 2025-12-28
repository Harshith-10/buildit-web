"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { ExamViolationDialog } from "@/components/layouts/exam/exam-violation-dialog";
import { useDevToolsDetection } from "@/hooks/exam/use-devtools-detection";
import { useEscInterceptor } from "@/hooks/exam/use-esc-interceptor";
import { useFullscreenEnforcement } from "@/hooks/exam/use-fullscreen-enforcement";
import { useTabSwitchDetection } from "@/hooks/exam/use-tab-switch-detection";
import { useWindowBlurDetection } from "@/hooks/exam/use-window-blur-detection";
import { useViolationStore } from "@/stores/violation-store";

interface ExamViolationEnforcementProps {
  enabled: boolean;
  onTerminate: () => void;
}

/**
 * Centralized violation enforcement system for exams.
 * 
 * Manages:
 * - Fullscreen enforcement (strict, auto-reopen) - HIGHEST PRIORITY
 * - Tab switch detection
 * - Window blur detection
 * - DevTools detection (best-effort)
 * - ESC key interception
 * - Blocking violation dialog
 * - Auto-termination at 3 violations
 */
export function ExamViolationEnforcement({ 
  enabled,
  onTerminate,
}: ExamViolationEnforcementProps) {
  const router = useRouter();
  const {
    state,
    activeViolation,
    setExamActive,
    setOnTerminate,
    resolveViolation,
    getViolationCount,
    getTotalViolations,
    isTerminated,
  } = useViolationStore();

  // Set exam active state
  useEffect(() => {
    setExamActive(enabled);
    console.log(`[ViolationEnforcement] Exam active: ${enabled}`);
  }, [enabled, setExamActive]);

  // Register termination callback
  useEffect(() => {
    setOnTerminate(onTerminate);
  }, [onTerminate, setOnTerminate]);

  // Handle exam termination
  useEffect(() => {
    if (isTerminated()) {
      const totalViolations = getTotalViolations();
      console.log(`[ViolationEnforcement] Exam terminated due to ${totalViolations} violations`);
      
      toast.error(`Exam terminated: ${totalViolations} violations detected`, {
        duration: 5000,
      });
    }
  }, [isTerminated, getTotalViolations]);

  // Global ESC key interceptor (always active during exam)
  useEscInterceptor(enabled);

  // Fullscreen enforcement with auto-reopen
  const { enterFullscreen, checkFullscreen } = useFullscreenEnforcement({
    enabled,
    onViolation: () => {
      console.log("[ViolationEnforcement] Fullscreen violation detected");
    },
  });

  // Tab switch detection
  useTabSwitchDetection({
    enabled,
    onViolation: () => {
      console.log("[ViolationEnforcement] Tab switch violation detected");
    },
  });

  // Window blur detection
  useWindowBlurDetection({
    enabled,
    onViolation: () => {
      console.log("[ViolationEnforcement] Window blur violation detected");
    },
  });

  // DevTools detection (best-effort)
  useDevToolsDetection({
    enabled,
    onViolation: () => {
      console.log("[ViolationEnforcement] DevTools violation detected");
    },
  });

  // Handle fullscreen re-entry
  const handleFullscreenReenter = () => {
    console.log("[ViolationEnforcement] User clicked re-enter fullscreen");
    enterFullscreen();
    // Dialog will auto-close when fullscreen is successfully entered
  };

  // Handle violation resolution (for non-fullscreen violations)
  const handleResolve = () => {
    console.log("[ViolationEnforcement] User resolved violation");
    resolveViolation();
  };

  // Dialog should be open when there's an active violation
  const dialogOpen = state === "VIOLATION_ACTIVE" && activeViolation !== null;

  // PRIORITY LOGIC: If not in fullscreen, always show fullscreen dialog
  // even if other violations are active
  const isInFullscreen = checkFullscreen();
  const displayViolationType = (!isInFullscreen && enabled) 
    ? "fullscreen" 
    : activeViolation?.violationType || "fullscreen";

  // Show termination dialog if terminated
  if (state === "TERMINATED") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
        <div className="max-w-md rounded-lg border border-destructive bg-background p-6 text-center shadow-2xl">
          <div className="mb-4 text-destructive">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold">Exam Terminated</h2>
          <p className="mb-4 text-muted-foreground">
            Your exam has been terminated due to {getTotalViolations()} violations.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to exams page...
          </p>
        </div>
      </div>
    );
  }

  if (!activeViolation) return null;

  return (
    <ExamViolationDialog
      open={dialogOpen}
      violationType={displayViolationType}
      violationCount={getViolationCount(displayViolationType)}
      totalViolations={getTotalViolations()}
      onResolve={handleResolve}
      onFullscreenReenter={handleFullscreenReenter}
    />
  );
}
