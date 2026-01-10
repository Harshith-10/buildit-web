"use server";

import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import db from "@/db";
import { assignmentSubmissions } from "@/db/schema";
import { auth } from "@/lib/auth";

export interface SubmissionHistoryItem {
  id: string;
  language: string;
  code: string;
  verdict: "passed" | "failed" | "compile_error" | "runtime_error";
  testCasesPassed: number | null;
  createdAt: Date;
}

export async function getSubmissions(
  assignmentId: string,
  questionId: string,
): Promise<{
  success: boolean;
  submissions?: SubmissionHistoryItem[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const history = await db.query.assignmentSubmissions.findMany({
      where: and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.questionId, questionId),
      ),
      orderBy: [desc(assignmentSubmissions.createdAt)],
      columns: {
        id: true,
        code: true,
        language: true,
        verdict: true,
        testCasesPassed: true,
        createdAt: true,
      },
    });

    return { success: true, submissions: history };
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return { success: false, error: "Failed to load history" };
  }
}
