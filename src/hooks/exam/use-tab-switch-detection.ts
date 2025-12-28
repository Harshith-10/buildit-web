import { useEffect, useRef } from "react";
import { useViolationStore } from "@/stores/violation-store";

interface UseTabSwitchDetectionOptions {
  enabled: boolean;
  onViolation?: () => void;
}

/**
 * Detects when user switches tabs or minimizes window using Visibility API.
 * 
 * Triggers violation when:
 * - Tab becomes hidden (user switched to another tab)
 * - Window is minimized
 * - User switches to another application
 */
export function useTabSwitchDetection({
  enabled,
  onViolation,
}: UseTabSwitchDetectionOptions) {
  const { triggerViolation, examActive } = useViolationStore();
  const lastVisibleTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled || !examActive) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const now = Date.now();
        const timeSinceLastVisible = now - lastVisibleTime.current;
        
        // Ignore very rapid visibility changes (< 500ms)
        // This prevents false positives from quick tab switches
        if (timeSinceLastVisible < 500) {
          console.log("[TabSwitch] Ignored rapid visibility change");
          return;
        }

        console.log("[TabSwitch] ❌ VIOLATION - Tab switched or window hidden");
        triggerViolation("tab");
        onViolation?.();
      } else if (document.visibilityState === "visible") {
        lastVisibleTime.current = Date.now();
        console.log("[TabSwitch] ✅ Tab visible again");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    console.log("[TabSwitch] Detection active");

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      console.log("[TabSwitch] Detection deactivated");
    };
  }, [enabled, examActive, triggerViolation, onViolation]);

  return {
    isVisible: document.visibilityState === "visible",
  };
}
