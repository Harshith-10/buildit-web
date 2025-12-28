import { useEffect, useRef } from "react";
import { useViolationStore } from "@/stores/violation-store";

interface UseFullscreenEnforcementOptions {
  enabled: boolean;
  onViolation?: () => void;
}

/**
 * Enforces fullscreen mode during exam with strict re-entry requirements.
 * 
 * Features:
 * - Blocks exam start until fullscreen is entered
 * - Detects fullscreen exit immediately
 * - Auto-triggers violation dialog
 * - Dialog cannot be dismissed without re-entering fullscreen
 * - Handles ESC spam protection
 */
export function useFullscreenEnforcement({
  enabled,
  onViolation,
}: UseFullscreenEnforcementOptions) {
  const { triggerViolation, resolveViolation, examActive } = useViolationStore();
  const isFullscreen = useRef(false);
  const violationActiveRef = useRef(false);

  // Check if currently in fullscreen
  const checkFullscreen = () => {
    return document.fullscreenElement !== null;
  };

  // Request fullscreen entry
  const enterFullscreen = async () => {
    try {
      console.log("[Fullscreen] Requesting fullscreen...");
      await document.documentElement.requestFullscreen();
      console.log("[Fullscreen] Successfully entered fullscreen");
      return true;
    } catch (error) {
      console.error("[Fullscreen] Failed to enter fullscreen:", error);
      return false;
    }
  };

  // Exit fullscreen (for cleanup)
  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        console.log("[Fullscreen] Exited fullscreen");
      }
    } catch (error) {
      console.error("[Fullscreen] Failed to exit fullscreen:", error);
    }
  };

  useEffect(() => {
    if (!enabled || !examActive) {
      // Clean up when disabled
      if (isFullscreen.current) {
        exitFullscreen();
      }
      return;
    }

    // Handler for fullscreen changes
    const handleFullscreenChange = () => {
      const nowFullscreen = checkFullscreen();
      const wasFullscreen = isFullscreen.current;
      
      console.log("[Fullscreen] State change:", { wasFullscreen, nowFullscreen });

      isFullscreen.current = nowFullscreen;

      if (wasFullscreen && !nowFullscreen) {
        // User exited fullscreen - VIOLATION
        console.log("[Fullscreen] ❌ VIOLATION - User exited fullscreen");
        violationActiveRef.current = true;
        triggerViolation("fullscreen");
        onViolation?.();
      } else if (!wasFullscreen && nowFullscreen) {
        // User entered fullscreen
        console.log("[Fullscreen] ✅ User entered fullscreen");
        
        // If there was a violation active, resolve it
        if (violationActiveRef.current) {
          console.log("[Fullscreen] Resolving previous violation");
          violationActiveRef.current = false;
          resolveViolation();
        }
      }
    };

    // Monitor fullscreen state continuously
    const monitorFullscreen = setInterval(() => {
      const nowFullscreen = checkFullscreen();
      
      // If not in fullscreen and exam is active, trigger violation
      if (!nowFullscreen && examActive && !violationActiveRef.current) {
        console.log("[Fullscreen] ⚠️ Detected out of fullscreen during exam");
        violationActiveRef.current = true;
        triggerViolation("fullscreen");
        onViolation?.();
      }
      
      // If fullscreen and violation was active, resolve it
      if (nowFullscreen && violationActiveRef.current) {
        console.log("[Fullscreen] ✅ Back in fullscreen, resolving violation");
        violationActiveRef.current = false;
        resolveViolation();
      }
    }, 100); // Check every 100ms

    // Listen for fullscreen changes
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Initial check - if not in fullscreen, trigger violation immediately
    if (!checkFullscreen() && examActive) {
      console.log("[Fullscreen] Initial check: not in fullscreen, triggering violation");
      violationActiveRef.current = true;
      triggerViolation("fullscreen");
      onViolation?.();
    }

    console.log("[Fullscreen] Enforcement active");

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearInterval(monitorFullscreen);
      console.log("[Fullscreen] Enforcement deactivated");
    };
  }, [enabled, examActive, triggerViolation, resolveViolation, onViolation]);

  return {
    isFullscreen: isFullscreen.current,
    enterFullscreen,
    exitFullscreen,
    checkFullscreen,
  };
}
