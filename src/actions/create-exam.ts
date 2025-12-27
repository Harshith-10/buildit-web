"use server";

import { headers } from "next/headers";
import db from "@/db";
import { exams } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { ExamConfig } from "@/types/exam-config";

export type CreateExamData = {
  title: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  config: ExamConfig;
};

export async function createExam(data: CreateExamData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const [exam] = await db
      .insert(exams)
      .values({
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
        config: data.config,
        createdBy: session.user.id,
      })
      .returning();

    return { success: true, examId: exam.id };
  } catch (error) {
    console.error("Error creating exam:", error);
    return { error: "Failed to create exam" };
  }
}
