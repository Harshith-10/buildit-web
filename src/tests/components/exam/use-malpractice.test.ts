import { renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as serverActions from "@/actions/exam-session";
import { useMalpractice } from "@/hooks/exam/use-malpractice";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/actions/exam-session", () => ({
  recordViolation: vi.fn(),
}));

describe("useMalpractice", () => {
  const sessionId = "test-session-id";
  const onViolation = vi.fn();
  const onTerminate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should trigger violation on tab switch (visibility change)", async () => {
    vi.mocked(serverActions.recordViolation).mockResolvedValue({
      terminated: false,
      count: 1,
    });

    renderHook(() => useMalpractice({ sessionId, onViolation, onTerminate }));

    // Simulate visibility change
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    // Wait for async call? No, it's called immediately in effect
    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining("Warning"),
    );
    expect(serverActions.recordViolation).toHaveBeenCalledWith(
      sessionId,
      "tab_switch",
    );
  });

  it("should debounce rapid violations", async () => {
    vi.mocked(serverActions.recordViolation).mockResolvedValue({
      terminated: false,
      count: 1,
    });

    renderHook(() => useMalpractice({ sessionId, onViolation, onTerminate }));

    // First trigger
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    // Immediate second trigger
    window.dispatchEvent(new Event("blur"));

    expect(serverActions.recordViolation).toHaveBeenCalledTimes(1);
  });

  it("should handle termination correctly", async () => {
    vi.mocked(serverActions.recordViolation).mockResolvedValue({
      terminated: true,
    });

    // Mock window.location.reload
    Object.defineProperty(window, "location", {
      value: { reload: vi.fn() },
    });

    renderHook(() => useMalpractice({ sessionId, onViolation, onTerminate }));

    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    // Must wait for promise resolution in hook
    await vi.waitFor(() => {
      expect(onTerminate).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
      expect(window.location.reload).toHaveBeenCalled();
    });
  });
});
