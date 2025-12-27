"use client";

import { useCallback, useEffect, useRef } from "react";
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
  // Use refs to track state without triggering re-renders of listeners
  const lastViolationTime = useRef<number>(0);

  const triggerViolation = useCallback(
    async (type: string) => {
      if (!enabled) return;

      const now = Date.now();
      // Client-side debounce (backup to server-side check)
      if (now - lastViolationTime.current < 2000) {
        return;
      }
      lastViolationTime.current = now;

      toast.warning("Warning: Focus lost! This has been recorded.");

      try {
        const result = await recordViolation(sessionId, type);

        if (result.terminated) {
          if (onTerminate) onTerminate();
          toast.error("Exam terminated due to malpractice.");
          window.location.reload(); // Force refresh to show termination screen
        } else if (onViolation && typeof result.count === "number") {
          onViolation(result.count);
        }
      } catch (e) {
        console.error("Failed to record violation", e);
      }
    },
    [sessionId, enabled, onViolation, onTerminate],
  );

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation("tab_switch");
      }
    };

    const handleBlur = () => {
      triggerViolation("window_blur");
    };

    // We can also check for devtools open or other things if needed,
    // but standard blur/visibility is usually what people mean by tab switch.

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, triggerViolation]);

  return {
    triggerViolation, // Expose for manual triggers (e.g., from components tracking cursor exit)
  };
}
