"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import User from "@/components/common/user-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { endExamSession } from "@/actions/exam-session";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UserInfo from "../exam/user-info";

interface ExamHeaderProps {
  sessionId: string;
  examTitle: string;
  expiresAt: Date;
  status: string;
  onEndExam?: () => void;
}

export default function ExamHeader({
  sessionId,
  examTitle,
  expiresAt,
  status,
  onEndExam,
}: ExamHeaderProps) {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining("Time's Up!");
        // Auto-submit exam
        handleAutoSubmit();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleAutoSubmit = async () => {
    try {
      await endExamSession(sessionId);
      toast.success("Exam submitted successfully!");
      router.push("/exams");
    } catch (error) {
      toast.error("Failed to submit exam");
    }
  };

  const handleEndExam = async () => {
    setIsEnding(true);
    try {
      await endExamSession(sessionId);
      toast.success("Exam ended successfully!");
      if (onEndExam) {
        onEndExam();
      } else {
        router.push("/exams");
      }
    } catch (error) {
      toast.error("Failed to end exam");
    } finally {
      setIsEnding(false);
      setShowEndDialog(false);
    }
  };

  return (
    <>
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
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeRemaining.includes("Time's Up")
              ? "border-red-500 bg-red-50"
              : ""
          }`}>
            <div className={`text-2xl font-mono font-bold ${
              timeRemaining.includes("Time's Up")
                ? "text-red-600"
                : "text-white/70"
            }`}>
              {timeRemaining}
            </div>
          </div>
          <UserInfo />
        </div>
      </header>

      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this exam? This action cannot be
              undone and your current progress will be submitted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEnding}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndExam} disabled={isEnding}>
              {isEnding ? "Ending..." : "End Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
