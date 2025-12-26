"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { endExamSession, recordViolation } from "@/actions/exam-session";
import type { Problem } from "@/types/problem";

interface UseExamSessionProps {
  sessionId: string;
  problems: Problem[];
  expiresAt: Date;
  onViolation?: (count: number) => void;
}

export function useExamSession({
  sessionId,
  problems,
  expiresAt,
  onViolation,
}: UseExamSessionProps) {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [codeStorage, setCodeStorage] = useState<Map<string, string>>(
    new Map(),
  );
  const [attemptedProblems, setAttemptedProblems] = useState<Set<string>>(
    new Set(),
  );
  const [isEnded, setIsEnded] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);

  // Initialize state from local storage
  useEffect(() => {
    // Code
    const savedCode = localStorage.getItem(`exam-${sessionId}-codes`);
    if (savedCode) {
      try {
        const parsed = JSON.parse(savedCode);
        setCodeStorage(new Map(Object.entries(parsed)));
      } catch (e) {
        console.error("Failed to load saved code:", e);
      }
    }

    // Attempted
    const savedAttempted = localStorage.getItem(`exam-${sessionId}-attempted`);
    if (savedAttempted) {
      try {
        const parsed = JSON.parse(savedAttempted);
        setAttemptedProblems(new Set(parsed));
      } catch (e) {
        console.error("Failed to load attempted problems:", e);
      }
    }
  }, [sessionId]);

  // Timer Logic
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));

      setTimeLeft(diff);

      if (diff === 0 && !isEnded) {
        // Time expired
        handleEndExam(true);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isEnded]);

  const handleCodeChange = useCallback(
    (code: string) => {
      const problemId = problems[currentProblemIndex].id;

      setCodeStorage((prev) => {
        const newStorage = new Map(prev);
        newStorage.set(problemId, code);
        // Persist
        localStorage.setItem(
          `exam-${sessionId}-codes`,
          JSON.stringify(Object.fromEntries(newStorage)),
        );
        return newStorage;
      });

      if (code.trim().length > 0) {
        setAttemptedProblems((prev) => {
          const newSet = new Set(prev);
          newSet.add(problemId);
          localStorage.setItem(
            `exam-${sessionId}-attempted`,
            JSON.stringify([...newSet]),
          );
          return newSet;
        });
      }
    },
    [currentProblemIndex, problems, sessionId],
  );

  const navigateTo = (index: number) => {
    if (index >= 0 && index < problems.length) {
      setCurrentProblemIndex(index);
    }
  };

  const handleViolation = useCallback(
    async (type: string) => {
      try {
        const result = await recordViolation(sessionId, type);
        if (onViolation) onViolation(result.violations);

        if (result.terminated) {
          toast.error("Exam terminated due to multiple violations.");
          setIsEnded(true);
          // Clean up local storage potentially? Or keep for review.
          window.location.reload(); // Force reload to show termination state
        }
      } catch (e) {
        console.error("Failed to record violation:", e);
      }
    },
    [sessionId, onViolation],
  );

  const handleEndExam = async (auto = false) => {
    try {
      await endExamSession(sessionId);
      setIsEnded(true);
      toast.success(
        auto ? "Time's up! Exam submitted." : "Exam submitted successfully.",
      );

      // Clear localStorage logic could go here if we want to prevent re-entering with stale data,
      // but usually better to keep it until confirmed clean.

      // Redirect or show summary
      window.location.href = `/exams?status=completed`;
    } catch (e) {
      toast.error("Failed to submit exam.");
    }
  };

  return {
    currentProblem: problems[currentProblemIndex],
    currentProblemIndex,
    codeStorage,
    attemptedProblems,
    timeLeft,
    isEnded,
    handleCodeChange,
    navigateTo,
    handleViolation,
    handleEndExam,
  };
}
