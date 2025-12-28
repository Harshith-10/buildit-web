"use server";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import db from "@/db";
import { user } from "@/db/schema/auth";
import { exams, examSessions, sessionProblems } from "@/db/schema/exams";
import { submissions } from "@/db/schema/submissions";
import { auth } from "@/lib/auth";

interface GetSubmissionsParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sort?: string;
  examId?: string;
}

export const getSubmissions = async ({
  page = 1,
  perPage = 10,
  search,
  status,
  sort = "created-desc",
  examId,
}: GetSubmissionsParams = {}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized", data: [], total: 0 };
  }

  // Check if user is admin or instructor
  if (session.user.role !== "admin" && session.user.role !== "instructor") {
    return { error: "Forbidden - Admin/Instructor access only", data: [], total: 0 };
  }

  try {
    const offset = (page - 1) * perPage;

    // Build where conditions
    const conditions = [];

    // Filter by exam if provided
    if (examId) {
      conditions.push(eq(examSessions.examId, examId));
    }

    // Filter by status (submitted/terminated)
    if (status && status !== "all") {
      conditions.push(eq(examSessions.status, status as "submitted" | "terminated"));
    } else {
      // By default, only show submitted and terminated sessions
      conditions.push(
        or(
          eq(examSessions.status, "submitted"),
          eq(examSessions.status, "terminated")
        )
      );
    }

    // Search by user name or email
    if (search) {
      conditions.push(
        or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`)
        )
      );
    }

    const whereClause = and(...conditions);

    // Get submissions grouped by session
    const sessionsQuery = db
      .select({
        sessionId: examSessions.id,
        examId: examSessions.examId,
        examTitle: exams.title,
        userId: examSessions.userId,
        userName: user.name,
        userEmail: user.email,
        status: examSessions.status,
        startedAt: examSessions.startedAt,
        terminationReason: examSessions.terminationReason,
        submissionCount: sql<number>`count(distinct ${submissions.id})`,
      })
      .from(examSessions)
      .leftJoin(exams, eq(examSessions.examId, exams.id))
      .leftJoin(user, eq(examSessions.userId, user.id))
      .leftJoin(submissions, eq(submissions.sessionId, examSessions.id))
      .where(whereClause)
      .groupBy(
        examSessions.id,
        examSessions.examId,
        exams.title,
        examSessions.userId,
        user.name,
        user.email,
        examSessions.status,
        examSessions.startedAt,
        examSessions.terminationReason
      );

    // Apply sorting
    let orderedQuery = sessionsQuery.orderBy(desc(examSessions.startedAt));
    
    if (sort === "name-asc") {
      orderedQuery = sessionsQuery.orderBy(user.name);
    } else if (sort === "name-desc") {
      orderedQuery = sessionsQuery.orderBy(desc(user.name));
    } else if (sort === "created-asc") {
      orderedQuery = sessionsQuery.orderBy(examSessions.startedAt);
    }

    const data = await orderedQuery.limit(perPage).offset(offset);

    // Get total count
    const countQuery = await db
      .select({ count: sql<number>`count(distinct ${examSessions.id})` })
      .from(examSessions)
      .leftJoin(exams, eq(examSessions.examId, exams.id))
      .leftJoin(user, eq(examSessions.userId, user.id))
      .leftJoin(submissions, eq(submissions.sessionId, examSessions.id))
      .where(whereClause);

    const total = Number(countQuery[0]?.count || 0);

    return {
      data: data.map((item) => ({
        id: item.sessionId,
        sessionId: item.sessionId,
        examId: item.examId,
        examTitle: item.examTitle || "Unknown Exam",
        userId: item.userId,
        userName: item.userName || "Unknown User",
        userEmail: item.userEmail || "",
        status: item.status,
        startedAt: item.startedAt,
        terminationReason: item.terminationReason,
        submissionCount: Number(item.submissionCount || 0),
      })),
      total,
    };
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return { error: "Failed to fetch submissions", data: [], total: 0 };
  }
};

export const deleteSubmission = async (sessionId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Check if user is admin or instructor
  if (session.user.role !== "admin" && session.user.role !== "instructor") {
    return { error: "Forbidden - Admin/Instructor access only" };
  }

  try {
    await db.transaction(async (tx) => {
      // Delete all submissions for this session first
      await tx.delete(submissions).where(eq(submissions.sessionId, sessionId));

      // Delete session problems
      await tx.delete(sessionProblems).where(eq(sessionProblems.sessionId, sessionId));

      // Finally delete the exam session itself
      await tx.delete(examSessions).where(eq(examSessions.id, sessionId));
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting submission:", error);
    return { error: "Failed to delete submission" };
  }
};
