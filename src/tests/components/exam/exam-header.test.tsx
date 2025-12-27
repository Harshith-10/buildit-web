import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import ExamHeader from "@/components/layouts/exam/exam_header";

describe("ExamHeader", () => {
  const defaultProps = {
    title: "Test Exam",
    timeLeft: 3605, // 1h 0m 5s
    onFinish: vi.fn(),
    isSubmitting: false,
  };

  it("should render title and formatted time", () => {
    render(<ExamHeader {...defaultProps} />);
    expect(screen.getByText("Test Exam")).toBeInTheDocument();
    expect(screen.getByText("1:00:05")).toBeInTheDocument();
  });

  it("should format time correctly for low minutes", () => {
    render(<ExamHeader {...defaultProps} timeLeft={65} />);
    expect(screen.getByText("01:05")).toBeInTheDocument(); // Adjusted expectation logic if needed, my component logic was h:mm:ss if h>0 else mm:ss logic?
    // Let's check code:
    // const h = Math.floor(seconds / 3600);
    // const m = Math.floor((seconds % 3600) / 60);
    // const s = seconds % 60;
    // return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    // So 65s -> h=0 -> "01:05"
  });

  it("should show red warning style when time is low", () => {
    const { container } = render(
      <ExamHeader {...defaultProps} timeLeft={200} />,
    );
    const timer = screen.getByText("03:20").closest("div");
    expect(timer).toHaveClass("text-red-700"); // or similar class check
  });

  it("should call onFinish when button clicked", () => {
    render(<ExamHeader {...defaultProps} />);
    fireEvent.click(screen.getByText("Finish Exam"));
    expect(defaultProps.onFinish).toHaveBeenCalled();
  });

  it("should disable button when submitting", () => {
    render(<ExamHeader {...defaultProps} isSubmitting={true} />);
    const btn = screen.getByText("Submitting...");
    expect(btn).toBeDisabled();
  });
});
