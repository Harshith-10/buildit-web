import { useEffect, useRef } from "react";
import { useViolationStore } from "@/stores/violation-store";

interface UseWindowBlurDetectionOptions {
  enabled: boolean;
  onViolation?: () => void;
}

/**
 * Detects when exam window loses focus.
 * 
 * Triggers violation when:
 * - User clicks outside the browser window
 * - User ALT+TABs to another application
 * - Window becomes inactive
 */
export function useWindowBlurDetection({
  enabled,
  onViolation,
}: UseWindowBlurDetectionOptions) {
  const { triggerViolation, examActive } = useViolationStore();
  const lastFocusTime = useRef(Date.now());
  const isBlurred = useRef(false);

  useEffect(() => {
    if (!enabled || !examActive) return;

    const handleBlur = () => {
      const now = Date.now();
      const timeSinceFocus = now - lastFocusTime.current;
      
      // Ignore very rapid blur/focus cycles (< 300ms)
      // This prevents false positives from quick window switches
      if (timeSinceFocus < 300) {
        console.log("[WindowBlur] Ignored rapid blur");
        return;
      }

      // Ignore if already blurred (prevent duplicate violations)
      if (isBlurred.current) {
        return;
      }

      isBlurred.current = true;
      console.log("[WindowBlur] ❌ VIOLATION - Window lost focus");
      triggerViolation("blur");
      onViolation?.();
    };

    const handleFocus = () => {
      if (isBlurred.current) {
        console.log("[WindowBlur] ✅ Window regained focus");
        isBlurred.current = false;
      }
      lastFocusTime.current = Date.now();
    };

    // Listen to both window blur/focus
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    console.log("[WindowBlur] Detection active");

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      console.log("[WindowBlur] Detection deactivated");
    };
  }, [enabled, examActive, triggerViolation, onViolation]);

  return {
    hasFocus: !isBlurred.current,
  };
}
