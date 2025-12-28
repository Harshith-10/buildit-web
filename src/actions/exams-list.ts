"use server";

import { and, asc, desc, eq, gt, gte, ilike, inArray, lt, lte, sql } from "drizzle-orm";
import db from "@/db";
import { examSessions, exams } from "@/db/schema";

export type GetExamsParams = {
  page?: number;
  perPage?: number;
  search?: string;
  status?: "upcoming" | "ongoing" | "completed";
  sort?: string;
  userId?: string;
};

export async function getExams({
  page = 1,
  perPage = 10,
  search,
  status,
  sort,
  userId,
}: GetExamsParams) {
  const currentTimestamp = new Date();

  // Base conditions
  const conditions = [];

  // Search
  if (search) {
    conditions.push(ilike(exams.title, `%${search}%`));
  }

  // Status Filter
  if (status === "upcoming") {
    conditions.push(gt(exams.startTime, currentTimestamp));
  } else if (status === "ongoing") {
    conditions.push(
      and(
        lte(exams.startTime, currentTimestamp),
        gte(exams.endTime, currentTimestamp),
      ),
    );
  } else if (status === "completed") {
    conditions.push(lt(exams.endTime, currentTimestamp));
  }
  // If no status is specified, we might want to return all, or default to something.
  // The user requirement says "I want to filter exams by status", so explicit filter is handled above.
  // If they don't provide it, we show all.

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Sorting
  const statusOrder = sql`
    CASE 
      WHEN ${exams.startTime} <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AND ${exams.endTime} >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') THEN 1
      WHEN ${exams.startTime} > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') THEN 2
      ELSE 3
    END
  `;

  let orderBy: any[] = [asc(statusOrder), desc(exams.createdAt)]; // Default sort

  if (sort === "title-asc") orderBy = [asc(exams.title)];
  if (sort === "title-desc") orderBy = [desc(exams.title)];
  if (sort === "date-asc") orderBy = [asc(exams.startTime)];
  if (sort === "date-desc") orderBy = [desc(exams.startTime)];

  // Data Query
  const data = await db
    .select()
    .from(exams)
    .where(whereClause)
    .limit(perPage)
    .offset((page - 1) * perPage)
    .orderBy(...orderBy);

  // Count Query
  // Note: Drizzle optimized count is better, but simple sql count is fine for now.
  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(exams)
    .where(whereClause);

  const total = countResult?.count ?? 0;

  // If userId is provided, fetch user's session status for each exam
  let userSessions: Record<string, { status: string }> = {};
  if (userId && data.length > 0) {
    const examIds = data.map((exam) => exam.id);
    const sessions = await db
      .select({
        examId: examSessions.examId,
        status: examSessions.status,
      })
      .from(examSessions)
      .where(
        and(
          eq(examSessions.userId, userId),
          inArray(examSessions.examId, examIds),
        ),
      );

    userSessions = Object.fromEntries(
      sessions.map((s) => [s.examId, { status: s.status }]),
    );
  }

  // Attach user session status to each exam
  const dataWithStatus = data.map((exam) => ({
    ...exam,
    userSessionStatus: userSessions[exam.id]?.status || null,
  }));

  return { data: dataWithStatus, total };
}

// Helper to check lt
