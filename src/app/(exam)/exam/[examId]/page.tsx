import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getLanguages } from "@/actions/code-execution";
import {
  getExamForEntry,
  getSessionProblems,
  startExam,
  validateSession,
} from "@/actions/exam-session";
import { ExamEntry } from "@/components/layouts/exam/exam_entry";
import ExamPage from "@/components/layouts/exam/exam_page";
import SessionNotFound from "@/components/layouts/exam/session_not_found";
import { auth } from "@/lib/auth";

interface PageProps {
  params: Promise<{
    examId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { examId } = await params;

  // Get current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/auth");
  }

  // Strategy:
  // 1. Check if 'examId' is actually a SESSION ID (from resume/redirect)
  // 2. OR if it is an EXAM ID (new start)

  // A. Try validating as session
  const validation = await validateSession(examId, session.user.id);

  if (validation.success) {
    // It is a valid session!
    const { session: examSession, timeLeft } = validation;

    const [problems, languages, exam] = await Promise.all([
      getSessionProblems(examSession.id),
      getLanguages(),
      getExamForEntry(examSession.examId),
    ]);

    if (!problems || problems.length === 0) {
      // Data issue
      return <SessionNotFound />;
    }

    return (
      <ExamPage
        sessionId={examSession.id}
        examTitle={exam ? exam.title : "Exam"}
        initialTimeLeft={timeLeft}
        problems={problems}
        languages={languages}
      />
    );
  } else {
    // If validation failed...
    if (validation.error === "not_found") {
      // It might be an EXAM ID (Onboarding)
      const exam = await getExamForEntry(examId);

      if (exam) {
        // It is an Exam ID. Show Entry/Onboarding page.
        // Note: Check if active session exists already?
        // startExam inside ExamEntry will handle resume logic,
        // or we can pre-check here to auto-redirect.
        // Let's rely on ExamEntry to be the landing page.
        return (
          <ExamEntry
            examId={exam.id}
            examTitle={exam.title}
            durationMinutes={exam.durationMinutes}
          />
        );
      }
    } else if (validation.error === "expired") {
      return redirect("/exams?status=expired");
    } else if (validation.error === "submitted") {
      return redirect("/exams?status=completed");
    } else if (validation.error === "terminated") {
      return redirect("/exams?status=terminated");
    }

    // Default error or truly not found
    return <SessionNotFound />;
  }
}
