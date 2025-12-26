import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getLanguages } from "@/actions/code-execution";
import { getExam } from "@/actions/exam-details";
import {
  checkSessionValidity,
  getActiveExamSession,
  getExamSessionWithDetails,
  getSessionProblems,
} from "@/actions/exam-session";
import { ExamEntryView } from "@/components/layouts/exam/exam-entry-view";
import ExamPageClient from "@/components/layouts/exam/exam-page-client";
import { auth } from "@/lib/auth";

interface PageProps {
  params: Promise<{
    examId: string;
  }>;
}

export default async function ExamPage({ params }: PageProps) {
  const { examId } = await params;
  const sessionId = examId;

  // Get current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/auth");
  }

  // 1. Attempt to resolve the URL parameter as an Exam Session ID
  const sessionData = await getExamSessionWithDetails(sessionId);

  // 2. If no session found, assume the parameter is an Exam ID (Onboarding View)
  if (!sessionData) {
    const examData = await getExam(sessionId);

    if (!examData) {
      notFound();
    }

    // Check if the user already has an active session for this exam
    const activeSession = await getActiveExamSession(
      examData.id,
      session.user.id,
    );

    if (activeSession) {
      // User has an active session -> Redirect them to it
      redirect(`/exam/${activeSession.id}`);
    }

    // User has no active session -> Show Onboarding
    return (
      <ExamEntryView
        examId={examData.id}
        examTitle={examData.title}
        durationMinutes={examData.durationMinutes}
      />
    );
  }

  // 3. We have a session, validate it
  const validation = await checkSessionValidity(sessionId, session.user.id);
  if (!validation.valid) {
    redirect(`/exams?error=${validation.reason || "invalid_session"}`);
  }

  // 4. Fetch problems and languages
  const [problems, languages] = await Promise.all([
    getSessionProblems(sessionId),
    getLanguages(),
  ]);

  if (problems.length === 0) {
    // This implies a data integrity issue or empty exam
    notFound();
  }

  return (
    <ExamPageClient
      sessionId={sessionId}
      sessionData={{
        examTitle: sessionData.exam.title,
        expiresAt: sessionData.session.expiresAt,
        status: sessionData.session.status,
      }}
      problems={problems}
      languages={languages}
    />
  );
}
