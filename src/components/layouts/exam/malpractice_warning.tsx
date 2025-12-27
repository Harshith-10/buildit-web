"use client";

import { toast } from "sonner";

// This is mostly handled by the hook via toasts, but if we need a persistent visual indicator:
export function showMalpracticeWarning(message: string) {
  toast.warning(message, {
    duration: 5000,
    style: {
      border: "1px solid #f59e0b",
      color: "#b45309",
    },
  });
}
