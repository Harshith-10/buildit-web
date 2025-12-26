"use client";

import User from "@/components/common/user-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ExamHeaderProps {
  examTitle: string;
  timeLeft: number; // in seconds
  status: string;
}

export default function ExamHeader({
  examTitle,
  timeLeft,
  status,
}: ExamHeaderProps) {
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Time's Up!";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timeString = formatTime(timeLeft);
  const isUrgent = timeLeft < 300; // Less than 5 mins

  return (
    <header className="flex justify-between p-2 w-full border-b">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-2" />
        <h1 className="text-lg font-semibold">{examTitle}</h1>
        <Separator orientation="vertical" className="mx-2" />
        <Badge
          className={`text-white ${
            status === "in_progress"
              ? "bg-blue-500"
              : status === "submitted"
                ? "bg-green-500"
                : "bg-red-600"
          }`}
        >
          {status === "in_progress"
            ? "In Progress"
            : status === "submitted"
              ? "Submitted"
              : "Terminated"}
        </Badge>
      </div>
      <div className="flex gap-3 items-center px-2">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isUrgent ? "border-red-500 bg-red-50" : ""
          }`}
        >
          <div
            className={`text-2xl font-mono font-bold ${
              isUrgent ? "text-red-600" : "text-foreground" // Use foreground instead of hardcoded white/70 for better theme support, or keep consistent if dark mode forced
            }`}
          >
            {timeString}
          </div>
        </div>
        <User size="small" />
      </div>
    </header>
  );
}
