"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import db from "@/db";
import { examSessions, exams, sessionProblems } from "@/db/schema/exams";
import { submissions } from "@/db/schema/submissions";
import { auth } from "@/lib/auth";
import type { ExamSubmission } from "@/stores/exam-store";

interface BulkSubmissionPayload {
  sessionId: string;
  submissions: Record<string, ExamSubmission>;
  terminated?: boolean;
}

export interface ExamSubmissionData {
  status: "submitted" | "terminated";
  examTitle: string;
  submittedAt: Date;
  problemsAttempted: number;
  totalProblems: number;
  violationCount: number;
}

/**
 * Fetches exam submission data for the result page.
 * Uses sessionId to get all relevant information from the database.
 */
export async function getExamSubmissionData(
  sessionId: string
): Promise<ExamSubmissionData | null> {
  // Get the session with exam details
  const session = await db.query.examSessions.findFirst({
    where: eq(examSessions.id, sessionId),
  });

  if (!session) {
    return null;
  }

  // Get exam details
  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, session.examId),
  });

  if (!exam) {
    return null;
  }

  // Count total problems in the session
  const sessionProblemsList = await db
    .select()
    .from(sessionProblems)
    .where(eq(sessionProblems.sessionId, sessionId));

  const totalProblems = sessionProblemsList.length;

  // Count problems attempted (have at least one submission)
  const submissionsList = await db
    .select({ problemId: submissions.problemId })
    .from(submissions)
    .where(eq(submissions.sessionId, sessionId));

  const attemptedProblemIds = new Set(submissionsList.map((s) => s.problemId));
  const problemsAttempted = attemptedProblemIds.size;

  // Get violation count from termination details
  const terminationDetails = session.terminationDetails as {
    violationCount?: number;
    events?: any[];
  } | null;
  const violationCount = terminationDetails?.violationCount || 0;

  return {
    status: session.status as "submitted" | "terminated",
    examTitle: exam.title,
    submittedAt: session.startedAt || new Date(),
    problemsAttempted,
    totalProblems,
    violationCount,
  };
}

export const bulkSubmitExam = async ({
  sessionId,
  submissions: examSubmissions,
  terminated = false,
}: BulkSubmissionPayload) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Verify session belongs to user
  const currentSession = await db.query.examSessions.findFirst({
    where: eq(examSessions.id, sessionId),
  });

  if (!currentSession || currentSession.userId !== session.user.id) {
    return { error: "Invalid session" };
  }

  // Check if session is already complete
  const isAlreadyComplete = currentSession.status === "submitted" || currentSession.status === "terminated";

  if (isAlreadyComplete && !terminated) {
    return { success: true, message: "Exam already submitted" };
  }

  // For terminated sessions, we still want to save any pending submissions
  // but we won't change the status again

  // Iterate and save submissions
  const entries = Object.entries(examSubmissions);

  if (entries.length > 0) {
    try {
      await db.transaction(async (tx) => {
        for (const [problemId, sub] of entries) {
          // We only save "accepted" or valid attempts that the user manually submitted.
          // Or should we save the *latest* code even if not submitted run?
          // The prompt says: "submit the data from the store to the DB".
          // Typically we want to save the final answer.
          // If the user ran a test and got 'accepted', we save that status.
          // If they just typed code but didn't run, we might want to save it as 'pending' or just save the code.
          // The `submissions` table expects a status.

          // Note: The `submissions` table in schema usually tracks *runs*.
          // If we want to save the final state of the exam, we might need to insert a final record.

          // Let's rely on the store's `submissions` record which holds the result of the last "Run/Submit" click.
          // If the user modified code AFTER that run, the store has `code` separately.
          // Ideally we should run the code one last time or just save it.
          // But running everything is expensive/slow.

          // Current strategy: Save the last known *Submission* result.
          // If no submission exists for a problem but code exists, we could save it as "pending"?
          // Let's stick to explicitly saving what is in `submissions` map as that represents "Submitted" answers.

          // We can also update `answerData` with the code from the `code` map to ensure latest edits are captured
          // even if they forgot to click submit.

          if (!sub) continue;

          await tx.insert(submissions).values({
            userId: session.user.id,
            problemId: problemId,
            sessionId: sessionId,
            answerData: {
              code: sub.code,
              language: sub.language,
              version: sub.version,
            },
            status: sub.status,
            runtimeMs: 0, // We might not have this from store if simplified, or we do.
            memoryKb: 0,
            createdAt: new Date(sub.timestamp),
          } as any);
        }

        // Mark exam as completed or terminated (only if not already terminated)
        if (!isAlreadyComplete) {
          await tx
            .update(examSessions)
            .set({ status: terminated ? "terminated" : "submitted" })
            .where(eq(examSessions.id, sessionId));
        }
      });
    } catch (error) {
      console.error("Bulk submission failed:", error);
      return { error: "Failed to save submissions" };
    }
  } else if (!isAlreadyComplete) {
    // No submissions, still close the exam (only if not already complete)
    await db
      .update(examSessions)
      .set({ status: terminated ? "terminated" : "submitted" })
      .where(eq(examSessions.id, sessionId));
  }

  return { success: true };
};
