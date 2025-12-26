"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { recordViolation } from "@/actions/exam-session";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SecurityMonitorProps {
  sessionId: string;
  onViolation?: (count: number) => void;
}

export function SecurityMonitor({
  sessionId,
  onViolation,
}: SecurityMonitorProps) {
  const router = useRouter();
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showTermination, setShowTermination] = useState(false);
  const [violationType, setViolationType] = useState<string>("");
  const isProcessingViolation = useRef(false);

  const handleViolation = async (type: string) => {
    if (isProcessingViolation.current) return;

    isProcessingViolation.current = true;
    setViolationType(type);

    try {
      const result = await recordViolation(sessionId, type);
      const newCount = result.violations;
      setViolations(newCount);
      onViolation?.(newCount);

      if (result.terminated) {
        setShowTermination(true);
      } else {
        setShowWarning(true);
      }
    } catch (error) {
      console.error("Error recording violation:", error);
    } finally {
      // Allow violations again after 2 seconds to prevent spam
      setTimeout(() => {
        isProcessingViolation.current = false;
      }, 2000);
    }
  };

  useEffect(() => {
    // Monitor fullscreen changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation("fullscreen_exit");
      }
    };

    // Monitor tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("tab_switch");
      }
    };

    // Request fullscreen on mount
    const requestFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.log("Fullscreen request failed:", err);
      }
    };

    requestFullscreen();

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Prevent right-click context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [handleViolation]);

  const handleWarningClose = async () => {
    setShowWarning(false);

    // Force re-enter fullscreen
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Failed to re-enter fullscreen:", err);
        // If user denies fullscreen, count as another violation
        setTimeout(() => {
          handleViolation("fullscreen_denied");
        }, 1000);
      }
    }
  };

  const handleTerminationClose = () => {
    setShowTermination(false);
    router.push("/exams");
  };

  return (
    <>
      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Security Violation Detected</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {violationType === "fullscreen_exit"
                  ? "You exited fullscreen mode."
                  : "You switched to another tab or window."}
              </p>
              <p className="font-semibold text-destructive">
                Warning {violations} of 3
              </p>
              <p>
                {3 - violations} more violation{3 - violations !== 1 ? "s" : ""}{" "}
                will result in automatic exam termination.
              </p>
              <p className="text-xs text-muted-foreground">
                Please remain in fullscreen mode and keep this tab active
                throughout the exam.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleWarningClose}>
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Termination Dialog */}
      <AlertDialog open={showTermination} onOpenChange={setShowTermination}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🚫 Exam Terminated</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Your exam has been automatically terminated due to multiple
                security violations.
              </p>
              <p className="font-semibold text-destructive">
                Total Violations: {violations}
              </p>
              <p>
                You either exited fullscreen mode or switched tabs/windows more
                than 3 times during the exam.
              </p>
              <p className="text-xs text-muted-foreground">
                Please contact your instructor if you believe this was an error.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleTerminationClose}>
              Exit to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
