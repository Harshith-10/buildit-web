"use server";

import { and, eq } from "drizzle-orm";
import { cache } from "react";
import db from "@/db";
import { examSessions, exams, user } from "@/db/schema";

export const getExam = cache(async (examId: string) => {
  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  return exam;
});

export const getExamCreatedBy = cache(async (examId: string) => {
  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  const [creator] = await db
    .select()
    .from(user)
    .where(eq(user.id, exam.createdBy));
  return creator.name;
});

export const hasUserCompletedExam = cache(
  async (examId: string, userId: string) => {
    const [session] = await db
      .select()
      .from(examSessions)
      .where(
        and(
          eq(examSessions.examId, examId),
          eq(examSessions.userId, userId),
          eq(examSessions.status, "submitted"),
        ),
      );
    return !!session;
  },
);

export const hasUserBeenTerminated = cache(
  async (examId: string, userId: string) => {
    const [session] = await db
      .select()
      .from(examSessions)
      .where(
        and(
          eq(examSessions.examId, examId),
          eq(examSessions.userId, userId),
          eq(examSessions.status, "terminated"),
        ),
      );
    return !!session;
  },
);
