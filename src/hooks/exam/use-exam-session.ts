"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { endExamSession, syncHeartbeat } from "@/actions/exam-session";

interface UseExamSessionProps {
  sessionId: string;
  initialTimeLeft: number; // Server-side calculated
}

export function useExamSession({
  sessionId,
  initialTimeLeft,
}: UseExamSessionProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [isEnded, setIsEnded] = useState(false);

  // Timer Logic
  useEffect(() => {
    if (isEnded) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEnded]);

  // Sync Logic (Heartbeat) - every 30s
  useEffect(() => {
    if (isEnded) return;

    const interval = setInterval(async () => {
      try {
        const serverTime = await syncHeartbeat(sessionId);
        if (serverTime <= 0) {
          handleEndExam(true);
        } else {
          // Drift correction: if client lags behind server significantly or vice versa
          // Actually, we should trust server.
          setTimeLeft(serverTime);
        }
      } catch (e) {
        console.error("Heartbeat failed", e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionId, isEnded]);

  const handleEndExam = useCallback(
    async (auto = false) => {
      try {
        setIsEnded(true);
        await endExamSession(sessionId);
        toast.success(
          auto ? "Time's up! Exam submitted." : "Exam submitted successfully.",
        );
        router.push("/exams?status=completed");
      } catch (e) {
        console.error("Failed to submit exam", e);
        toast.error("Failed to submit exam. Please try again.");
        setIsEnded(false); // Allow retry?
      }
    },
    [sessionId, router],
  );

  return {
    timeLeft,
    isEnded,
    endExam: () => handleEndExam(false),
  };
}
