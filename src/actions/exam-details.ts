"use server";

import { eq } from "drizzle-orm";
import { cache } from "react";
import db from "@/db";
import { exams, user } from "@/db/schema";

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
