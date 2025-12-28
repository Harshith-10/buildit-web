import { useEffect, useRef } from "react";
import { useViolationStore } from "@/stores/violation-store";

interface UseDevToolsDetectionOptions {
  enabled: boolean;
  onViolation?: () => void;
}

/**
 * Best-effort detection of Developer Tools opening.
 * 
 * Uses heuristics:
 * - Window resize anomalies (DevTools docking)
 * - Debugger statement timing
 * - Console detection tricks
 * 
 * Note: This is NOT foolproof and can produce false positives.
 * Treat as a deterrent, not a guarantee.
 */
export function useDevToolsDetection({
  enabled,
  onViolation,
}: UseDevToolsDetectionOptions) {
  const { triggerViolation, examActive } = useViolationStore();
  const lastWindowSize = useRef({ width: window.innerWidth, height: window.innerHeight });
  const detectionCount = useRef(0);
  const violationTriggered = useRef(false);

  useEffect(() => {
    if (!enabled || !examActive) return;

    let debuggerCheckInterval: NodeJS.Timeout;
    let resizeCheckTimeout: NodeJS.Timeout;

    // Method 1: Debugger statement timing detection
    const checkDebugger = () => {
      const start = performance.now();
      
      // This will pause if debugger is open
      // eslint-disable-next-line no-debugger
      debugger;
      
      const end = performance.now();
      const elapsed = end - start;

      // If elapsed time is > 100ms, debugger was likely open
      if (elapsed > 100) {
        console.log("[DevTools] Debugger timing anomaly detected");
        handleSuspiciousActivity();
      }
    };

    // Method 2: Window resize detection (DevTools docking)
    const checkWindowResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const prevWidth = lastWindowSize.current.width;
      const prevHeight = lastWindowSize.current.height;

      const widthDiff = Math.abs(currentWidth - prevWidth);
      const heightDiff = Math.abs(currentHeight - prevHeight);

      // Significant resize that's not fullscreen toggle
      if ((widthDiff > 100 || heightDiff > 100) && document.fullscreenElement) {
        console.log("[DevTools] Suspicious window resize while in fullscreen");
        handleSuspiciousActivity();
      }

      lastWindowSize.current = { width: currentWidth, height: currentHeight };
    };

    // Method 3: Console detection
    const checkConsole = () => {
      const element = new Image();
      let consoleOpen = false;

      Object.defineProperty(element, "id", {
        get: function () {
          consoleOpen = true;
          return "";
        },
      });

      // This will trigger the getter if console is open
      console.log("%c", element);

      if (consoleOpen) {
        console.log("[DevTools] Console detected as open");
        handleSuspiciousActivity();
      }
    };

    const handleSuspiciousActivity = () => {
      detectionCount.current++;

      // Require multiple detections to reduce false positives
      if (detectionCount.current >= 2 && !violationTriggered.current) {
        console.log("[DevTools] ❌ VIOLATION - DevTools likely open");
        violationTriggered.current = true;
        triggerViolation("devtools");
        onViolation?.();

        // Reset after 10 seconds to allow re-detection
        setTimeout(() => {
          detectionCount.current = 0;
          violationTriggered.current = false;
        }, 10000);
      }
    };

    // Run checks periodically
    debuggerCheckInterval = setInterval(() => {
      try {
        checkDebugger();
        checkConsole();
      } catch (error) {
        // Ignore errors in detection methods
        console.log("[DevTools] Detection check error:", error);
      }
    }, 3000); // Check every 3 seconds

    // Monitor window resize
    const handleResize = () => {
      clearTimeout(resizeCheckTimeout);
      resizeCheckTimeout = setTimeout(checkWindowResize, 500);
    };

    window.addEventListener("resize", handleResize);

    console.log("[DevTools] Detection active (best-effort)");

    return () => {
      clearInterval(debuggerCheckInterval);
      clearTimeout(resizeCheckTimeout);
      window.removeEventListener("resize", handleResize);
      console.log("[DevTools] Detection deactivated");
    };
  }, [enabled, examActive, triggerViolation, onViolation]);

  return {
    detectionActive: enabled && examActive,
  };
}
