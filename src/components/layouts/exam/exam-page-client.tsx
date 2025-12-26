"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import type { Runtime } from "@/actions/code-execution";
import ExamHeader from "@/components/layouts/exam/exam-header";
import ExamPanes from "@/components/layouts/exam/exam-panes";
import { ExamSidebar } from "@/components/layouts/exam/exam-sidebar";
import { SecurityMonitor } from "@/components/layouts/exam/security-monitor";
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
import { SidebarProvider } from "@/components/ui/sidebar";
import { useExamSession } from "@/hooks/use-exam-session";
import type { Problem } from "@/types/problem";

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
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isMalpracticeEnabled, setIsMalpracticeEnabled] = useState(true);

  const {
    currentProblem,
    currentProblemIndex,
    codeStorage,
    attemptedProblems,
    timeLeft,
    handleCodeChange,
    navigateTo,
    handleViolation,
    handleEndExam,
  } = useExamSession({
    sessionId,
    problems,
    expiresAt: sessionData.expiresAt,
    onViolation: (count) => console.log(`Violation count: ${count}`),
  });

  if (!currentProblem) {
    return notFound();
  }

  const onConfirmEndExam = async () => {
    setIsEnding(true);
    await handleEndExam();
    setIsEnding(false);
    setShowEndDialog(false);
  };

  return (
    <>
      {isMalpracticeEnabled && (
        <SecurityMonitor
          sessionId={sessionId}
          onViolation={() => handleViolation("focus_lost")}
        />
      )}
      <main className="flex h-screen w-full">
        <ExamSidebar
          problems={problems.map((p, idx) => ({
            id: p.id,
            title: p.title,
            difficulty: p.difficulty,
            slug: `problem-${idx + 1}`,
          }))}
          activeProblemId={currentProblem.id}
          onProblemSelect={(id) => {
            const idx = problems.findIndex((p) => p.id === id);
            if (idx !== -1) navigateTo(idx);
          }}
          attemptedProblems={attemptedProblems}
          onEndExam={() => setShowEndDialog(true)}
        />
        <div className="h-screen w-full flex flex-col overflow-hidden">
          <ExamHeader
            examTitle={sessionData.examTitle}
            timeLeft={timeLeft}
            status={sessionData.status}
            malpracticeEnabled={isMalpracticeEnabled}
            onToggleMalpractice={setIsMalpracticeEnabled}
          />
          <ExamPanes
            problem={currentProblem}
            languages={languages}
            onCodeChange={handleCodeChange}
            initialCode={codeStorage.get(currentProblem.id)}
            onNext={() => navigateTo(currentProblemIndex + 1)}
            onPrevious={() => navigateTo(currentProblemIndex - 1)}
            hasNext={currentProblemIndex < problems.length - 1}
            hasPrevious={currentProblemIndex > 0}
          />
        </div>
      </main>

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
            <AlertDialogAction onClick={onConfirmEndExam} disabled={isEnding}>
              {isEnding ? "Ending..." : "End Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
