"use client";

import { AlertTriangle, MonitorOff, RefreshCcw, Focus } from "lucide-react";
import { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ViolationDialogProps {
  open: boolean;
  violationType: string;
  violationCount: number;
  onClose: () => void;
  onFullscreenReenter?: () => Promise<void>;
  onPrepareReentry?: () => void;
  onUnlock?: () => void;
}

export function ViolationDialog({
  open,
  violationType,
  violationCount,
  onClose,
  onFullscreenReenter,
  onPrepareReentry,
  onUnlock,
}: ViolationDialogProps) {
  const isFullscreenViolation = violationType === "fullscreen_exit";
  const isTabSwitch = violationType === "tab_switch";
  const isWindowBlur = violationType === "window_blur";

  console.log("[Dialog] Render:", { open, violationType, violationCount });

  const handleUnderstand = async () => {
    console.log("[Dialog] User acknowledged violation");
    
    // Close the dialog immediately
    onClose();
    
    // If fullscreen violation, re-enter fullscreen
    if (isFullscreenViolation && onFullscreenReenter && onPrepareReentry) {
      // Small delay to let dialog close animation start
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Prepare for re-entry (sets flag)
      onPrepareReentry();
      
      // Attempt fullscreen re-entry
      try {
        await onFullscreenReenter();
        console.log("[Dialog] Fullscreen re-entry initiated");
      } catch (error) {
        console.error("[Dialog] Failed to re-enter fullscreen:", error);
        // Unlock system if fullscreen fails
        if (onUnlock) onUnlock();
      }
    } else {
      // For non-fullscreen violations, unlock immediately after dialog closes
      await new Promise(resolve => setTimeout(resolve, 300));
      if (onUnlock) onUnlock();
    }
  };

  // Prevent ESC key from closing the dialog
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open]);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent 
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="z-[9999]"
      >
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              {isFullscreenViolation ? (
                <MonitorOff className="h-12 w-12 text-destructive" />
              ) : isWindowBlur ? (
                <Focus className="h-12 w-12 text-destructive" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-destructive" />
              )}
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            {isFullscreenViolation
              ? "Fullscreen Mode Required"
              : isTabSwitch
                ? "Tab Switching Detected"
                : isWindowBlur
                  ? "Window Focus Lost"
                  : "Violation Detected"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p className="text-base font-medium text-foreground">
              {isFullscreenViolation
                ? "You have exited fullscreen mode. This is a violation of exam rules."
                : isTabSwitch
                  ? "You have switched tabs or windows. This is a violation of exam rules."
                  : isWindowBlur
                    ? "You have clicked outside the exam window. This is a violation of exam rules."
                    : "A violation of exam rules has been detected."}
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-semibold text-destructive">
                Violation Count: {violationCount} / 3
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {violationCount >= 3
                  ? "Your exam will be terminated."
                  : `${3 - violationCount} violations remaining before termination.`}
              </p>
            </div>
            {isFullscreenViolation && (
              <p className="text-sm text-muted-foreground">
                You must return to fullscreen mode to continue the exam.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleUnderstand}
            className="w-full sm:w-auto"
          >
            {isFullscreenViolation ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2" />
                I Understand - Return to Fullscreen
              </>
            ) : (
              "I Understand"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
