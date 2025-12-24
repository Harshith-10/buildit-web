"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import type { Runtime } from "@/actions/code-execution";
import type { Problem } from "@/types/problem";
import ExamHeader from "@/components/layouts/exams/exam-header";
import ExamPanes from "@/components/layouts/exams/exam-panes";
import { ExamSidebar } from "@/components/layouts/exams/exam-sidebar";
import { SecurityMonitor } from "@/components/layouts/exams/security-monitor";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ExamPageClientProps {
  sessionId: string;
  sessionData: {
    examTitle: string;
    expiresAt: Date;
    status: string;
  };
  problems: Problem[];
  languages: Runtime[];
}

export default function ExamPageClient({
  sessionId,
  sessionData,
  problems,
  languages,
}: ExamPageClientProps) {
  const router = useRouter();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [codeStorage, setCodeStorage] = useState<Map<string, string>>(new Map());
  const [attemptedProblems, setAttemptedProblems] = useState<Set<string>>(new Set());
  const [showEndDialog, setShowEndDialog] = useState(false);

  const currentProblem = problems[currentProblemIndex];

  // Load code from storage
  useEffect(() => {
    const saved = localStorage.getItem(`exam-${sessionId}-codes`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCodeStorage(new Map(Object.entries(parsed)));
      } catch (e) {
        console.error("Failed to load saved code:", e);
      }
    }

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

  // Save code to storage
  const handleCodeChange = (code: string) => {
    const newStorage = new Map(codeStorage);
    newStorage.set(currentProblem.id, code);
    setCodeStorage(newStorage);

    // Mark as attempted
    if (code.trim().length > 0) {
      const newAttempted = new Set(attemptedProblems);
      newAttempted.add(currentProblem.id);
      setAttemptedProblems(newAttempted);
      localStorage.setItem(
        `exam-${sessionId}-attempted`,
        JSON.stringify([...newAttempted]),
      );
    }

    // Save to localStorage
    const storageObj = Object.fromEntries(newStorage);
    localStorage.setItem(`exam-${sessionId}-codes`, JSON.stringify(storageObj));
  };

  const handleProblemSelect = (problemId: string) => {
    const index = problems.findIndex((p) => p.id === problemId);
    if (index !== -1) {
      setCurrentProblemIndex(index);
    }
  };

  const handleNext = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    }
  };

  const handleViolation = (count: number) => {
    console.log(`Violation detected. Count: ${count}`);
  };

  const handleEndExamClick = () => {
    setShowEndDialog(true);
  };

  if (!currentProblem) {
    return notFound();
  }

  return (
    <>
      <SecurityMonitor sessionId={sessionId} onViolation={handleViolation} />
      <SidebarProvider>
        <main className="flex h-screen w-full">
          <ExamSidebar
            problems={problems.map((p, idx) => ({
              id: p.id,
              title: p.title,
              difficulty: p.difficulty,
              slug: `problem-${idx + 1}`,
            }))}
            activeProblemId={currentProblem.id}
            onProblemSelect={handleProblemSelect}
            attemptedProblems={attemptedProblems}
            onEndExam={handleEndExamClick}
          />
          <div className="h-screen w-full flex flex-col overflow-hidden">
            <ExamHeader
              sessionId={sessionId}
              examTitle={sessionData.examTitle}
              expiresAt={sessionData.expiresAt}
              status={sessionData.status}
              onEndExam={handleEndExamClick}
            />
            <ExamPanes
              problem={currentProblem}
              languages={languages}
              onCodeChange={handleCodeChange}
              initialCode={codeStorage.get(currentProblem.id)}
              onNext={handleNext}
              onPrevious={handlePrevious}
              hasNext={currentProblemIndex < problems.length - 1}
              hasPrevious={currentProblemIndex > 0}
            />
          </div>
        </main>
      </SidebarProvider>
    </>
  );
}
