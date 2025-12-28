"use client";

import { toast } from "sonner";

// This is mostly handled by the hook via toasts, but if we need a persistent visual indicator:
export function showMalpracticeWarning(message: string) {
  toast.warning(message, {
    duration: 8000,
    style: {
      border: "2px solid #f59e0b",
      color: "#b45309",
      fontWeight: "600",
    },
  });
}
