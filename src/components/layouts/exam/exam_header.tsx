"use client";

import { Clock, Loader2 } from "lucide-react";
import User from "@/components/common/user-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import UserInfo from "@/components/common/user-info";

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
    <header className="flex justify-between p-2 w-full border-b bg-background">
      <div className="flex items-center">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4 mx-2" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2 px-2">
        <Badge
          variant="outline"
          className={cn(
            "h-8 gap-2 font-mono text-sm",
            isLowTime
              ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-950/20"
              : "",
          )}
        >
          <Clock className="h-4 w-4" />
          {formatTime(timeLeft)}
        </Badge>

        <Separator orientation="vertical" className="h-4 mx-2" />

        <Button
          size="sm"
          variant="destructive"
          onClick={onFinish}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Finish Exam"
          )}
        </Button>

        <Separator orientation="vertical" className="h-4 mx-2" />

        <UserInfo />
      </div>
    </header>
  );
}
