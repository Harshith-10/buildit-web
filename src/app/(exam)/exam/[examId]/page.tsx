import { notFound, redirect } from "next/navigation";
import { getLanguages } from "@/actions/code-execution";
import {
  checkSessionValidity,
  getExamSessionWithDetails,
  getSessionProblems,
} from "@/actions/exam-session";
import { auth } from "@/lib/auth";
import ExamPageClient from "@/components/layouts/exams/exam-page-client";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{
    examId: string;
  }>;
}

export default async function ExamPage({ params }: PageProps) {
  const { examId: sessionId } = await params;

  // Get current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    redirect("/auth");
  }

  // Fetch exam session with details
  const sessionData = await getExamSessionWithDetails(sessionId);

  if (!sessionData) {
    notFound();
  }

  // Validate session
  const validation = await checkSessionValidity(sessionId, session.user.id);
  if (!validation.valid) {
    // Redirect with error message
    redirect(`/exams?error=${encodeURIComponent(validation.reason || "Invalid session")}`);
  }

  // Fetch problems and languages
  const [problems, languages] = await Promise.all([
    getSessionProblems(sessionId),
    getLanguages(),
  ]);

  if (problems.length === 0) {
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
