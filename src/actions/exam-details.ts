"use server";

import { and, eq } from "drizzle-orm";
import { cache } from "react";
import db from "@/db";
import { examAssignments, exams, user } from "@/db/schema";

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
    const [assignment] = await db
      .select()
      .from(examAssignments)
      .where(
        and(
          eq(examAssignments.examId, examId),
          eq(examAssignments.userId, userId),
          eq(examAssignments.status, "completed"),
        ),
      );
    return !!assignment;
  },
);

export const hasUserBeenTerminated = cache(
  async (examId: string, userId: string) => {
    const [assignment] = await db
      .select()
      .from(examAssignments)
      .where(
        and(
          eq(examAssignments.examId, examId),
          eq(examAssignments.userId, userId),
          eq(examAssignments.isTerminated, true),
        ),
      );
    return !!assignment;
  },
);
