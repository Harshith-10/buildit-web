"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import db from "@/db";
import { examSessions } from "@/db/schema/exams";
import { submissions } from "@/db/schema/submissions";
import { auth } from "@/lib/auth";
import type { ExamSubmission } from "@/stores/exam-store";

interface BulkSubmissionPayload {
  sessionId: string;
  submissions: Record<string, ExamSubmission>;
  terminated?: boolean;
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

  if (
    currentSession.status === "submitted" ||
    currentSession.status === "terminated"
  ) {
    // Already submitted? Maybe just return success to clear local store.
    return { success: true, message: "Exam already submitted" };
  }

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

        // Mark exam as completed or terminated
        await tx
          .update(examSessions)
          .set({ status: terminated ? "terminated" : "submitted" })
          .where(eq(examSessions.id, sessionId));
      });
    } catch (error) {
      console.error("Bulk submission failed:", error);
      return { error: "Failed to save submissions" };
    }
  } else {
    // No submissions, still close the exam
    await db
      .update(examSessions)
      .set({ status: terminated ? "terminated" : "submitted" })
      .where(eq(examSessions.id, sessionId));
  }

  return { success: true };
};
