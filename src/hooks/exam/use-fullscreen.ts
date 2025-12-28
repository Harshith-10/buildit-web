"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface UseFullscreenProps {
  enabled?: boolean;
  onEnter?: () => void;
  onExit?: () => void;
}

export function useFullscreen({
  enabled = true,
  onEnter,
  onExit,
}: UseFullscreenProps = {}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    if (!enabled) return;

    try {
      // Check if fullscreen is supported
      if (!document.fullscreenEnabled && !(document as any).webkitFullscreenEnabled) {
        console.warn("Fullscreen is not supported in this browser");
        return;
      }

      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen().catch((err) => {
          // Handle specific permission errors silently
          if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
            console.warn("Fullscreen permission denied or requires user interaction");
          } else {
            throw err;
          }
        });
      } else if ((elem as any).webkitRequestFullscreen) {
        /* Safari */
        await (elem as any).webkitRequestFullscreen().catch((err: any) => {
          if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
            console.warn("Fullscreen permission denied or requires user interaction");
          } else {
            throw err;
          }
        });
      } else if ((elem as any).msRequestFullscreen) {
        /* IE11 */
        await (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
      if (onEnter) onEnter();
    } catch (error: any) {
      console.error("Failed to enter fullscreen:", error);
      // Only show toast for non-permission errors
      if (error.name !== 'NotAllowedError' && !error.message?.includes('permission')) {
        toast.error("Failed to enter fullscreen mode");
      }
    }
  }, [enabled, onEnter]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          /* Safari */
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          /* IE11 */
          await (document as any).msExitFullscreen();
        }
      }
      setIsFullscreen(false);
      if (onExit) onExit();
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
    }
  }, [onExit]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
