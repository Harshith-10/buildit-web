"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExamHeaderProps {
  title: string;
  timeLeft: number;
  onFinish: () => void;
  isSubmitting?: boolean;
}

export default function ExamHeader({
  title,
  timeLeft,
  onFinish,
  isSubmitting = false,
}: ExamHeaderProps) {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeLeft < 300; // 5 mins

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-1.5 font-mono text-sm font-medium transition-colors",
            isLowTime
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Clock className="h-4 w-4" />
          <span>{formatTime(timeLeft)}</span>
        </div>

        <Button
          variant="destructive"
          onClick={onFinish}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Finish Exam"}
        </Button>
      </div>
    </header>
  );
}
