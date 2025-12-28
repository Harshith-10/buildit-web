import { useEffect } from "react";

/**
 * Globally intercepts ESC key during exam to prevent:
 * - Exiting fullscreen
 * - Closing dialogs
 * - Any other ESC-based actions
 */
export function useEscInterceptor(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("[ESC Interceptor] Blocked ESC key press");
      }
    };

    // Use capture phase to intercept before any other handlers
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    console.log("[ESC Interceptor] Active");

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      console.log("[ESC Interceptor] Deactivated");
    };
  }, [enabled]);
}
