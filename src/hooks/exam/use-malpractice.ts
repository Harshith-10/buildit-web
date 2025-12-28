"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { recordViolation } from "@/actions/exam-session";

interface UseMalpracticeProps {
  sessionId: string;
  enabled?: boolean;
  onViolation?: (count: number) => void;
  onTerminate?: () => void;
}

export function useMalpractice({
  sessionId,
  enabled = true,
  onViolation,
  onTerminate,
}: UseMalpracticeProps) {
  // Simple lock to prevent concurrent violation processing
  const isLocked = useRef(false);
  const lastViolationTime = useRef<number>(0);
  const isReenteringFullscreen = useRef(false);
  
  // State for violation dialog
  const [violationDialog, setViolationDialog] = useState<{
    open: boolean;
    type: string;
    count: number;
  }>({ open: false, type: "", count: 0 });

  const triggerViolation = useCallback(
    async (type: string) => {
      if (!enabled) {
        console.log("[Violation] Blocked - system disabled");
        return;
      }

      if (isLocked.current) {
        console.log("[Violation] Blocked - already processing a violation");
        return;
      }

      const now = Date.now();
      // Debounce rapid events (within 800ms)
      if (now - lastViolationTime.current < 800) {
        console.log("[Violation] Debounced - too rapid:", type);
        return;
      }
      
      // Lock the system
      isLocked.current = true;
      lastViolationTime.current = now;

      console.log("[Violation] Processing:", type);

      try {
        const result = await recordViolation(sessionId, type);
        console.log("[Violation] Server response:", result);

        if (result.terminated) {
          // Exam terminated - unlock and redirect
          isLocked.current = false;
          if (onTerminate) onTerminate();
          toast.error("Exam terminated due to multiple violations.", {
            duration: 10000,
          });
          setTimeout(() => {
            window.location.href = "/exams?status=terminated";
          }, 2000);
        } else if (typeof result.count === "number") {
          // Show violation dialog
          console.log("[Violation] Showing dialog");
          setViolationDialog({
            open: true,
            type,
            count: result.count,
          });
          
          if (onViolation) {
            onViolation(result.count);
          }
          // Keep locked until dialog is fully resolved
        } else {
          // Ignored by server (debounced)
          console.log("[Violation] Ignored by server");
          isLocked.current = false;
        }
      } catch (e) {
        console.error("[Violation] Error:", e);
        isLocked.current = false;
      }
    },
    [sessionId, enabled, onViolation, onTerminate],
  );

  const unlockSystem = useCallback(() => {
    console.log("[Violation] Unlocking system");
    isLocked.current = false;
    isReenteringFullscreen.current = false;
  }, []);

  const closeViolationDialog = useCallback(() => {
    console.log("[Violation] Closing dialog");
    setViolationDialog({ open: false, type: "", count: 0 });
  }, []);

  const prepareForFullscreenReentry = useCallback(() => {
    console.log("[Violation] Preparing for fullscreen re-entry");
    isReenteringFullscreen.current = true;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Tab switch detection (visibility API)
    const handleVisibilityChange = () => {
      if (document.hidden && !isLocked.current) {
        console.log("[Detection] Tab hidden detected");
        triggerViolation("tab_switch");
      }
    };

    // Window blur detection (user clicks outside browser)
    const handleWindowBlur = () => {
      if (!isLocked.current) {
        console.log("[Detection] Window blur detected");
        triggerViolation("window_blur");
      }
    };

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      console.log("[Detection] Fullscreen change:", {
        isFullscreen,
        isLocked: isLocked.current,
        isReentering: isReenteringFullscreen.current,
      });
      
      if (isFullscreen && isReenteringFullscreen.current) {
        // Successfully re-entered fullscreen after a violation
        console.log("[Detection] Fullscreen re-entry successful, unlocking after delay");
        setTimeout(() => {
          unlockSystem();
        }, 500);
      } else if (!isFullscreen && !isLocked.current) {
        // User exited fullscreen
        console.log("[Detection] Fullscreen exit detected");
        triggerViolation("fullscreen_exit");
      }
    };

    // Add all event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, [enabled, triggerViolation, unlockSystem]);

  return {
    triggerViolation,
    violationDialog,
    closeViolationDialog,
    prepareForFullscreenReentry,
    unlockSystem,
  };
}
