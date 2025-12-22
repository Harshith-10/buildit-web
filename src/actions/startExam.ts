"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import db from "@/db";
import { examSessions, exams, sessionProblems } from "@/db/schema";
import { generateQuestionSet } from "@/lib/exam-engine";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import type { ExamConfig } from "@/types/exam-config";

export async function startExamAction(examId: string, userId: string) {
  // 1. Validations
  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
  });

  if (!exam) throw new Error("Exam not found");

  // Time Window Check
  const now = new Date();
  if (now < exam.startTime || now > exam.endTime) {
    throw new Error("Exam is not currently active");
  }

  // 2. Security: Device Fingerprinting
  // Simple version: Hash of IP + User-Agent
  // const headersList = await headers(); // Next.js headers
  // const ip = headersList.get("x-forwarded-for") || "unknown";
  // const ua = headersList.get("user-agent") || "unknown";
  // const currentFingerprint = Buffer.from(`${ip}-${ua}`).toString("base64");

  // New Version: Use FingerprintJS
  const currentFingerprint = await getDeviceFingerprint();

  // 3. Check for Existing Active Sessions
  const existingSession = await db.query.examSessions.findFirst({
    where: and(
      eq(examSessions.userId, userId),
      eq(examSessions.examId, examId),
      eq(examSessions.status, "in_progress"),
    ),
  });

  if (existingSession) {
    // SECURITY CHECK: Is it the same device?
    if (existingSession.deviceFingerprint !== currentFingerprint) {
      // Aggressive: Block access if device changed mid-exam
      throw new Error("Multi-device access detected. Exam locked.");

      // OR Permissive: Terminate old session and start new (depending on policy)
    }

    // If same device, just resume
    return redirect(`/exam/${existingSession.id}`);
  }

  // 4. Generate the Questions (The "Engine" runs here)
  // We cast the JSON column to our type
  const config = exam.config as unknown as ExamConfig;
  const selectedProblemIds = await generateQuestionSet(config);

  if (selectedProblemIds.length === 0) {
    throw new Error("Configuration Error: No questions generated.");
  }

  // 5. Create Session Transaction (Atomic)
  const newSessionId = await db.transaction(async (tx) => {
    // A. Create the Session Record
    const [session] = await tx
      .insert(examSessions)
      .values({
        examId,
        userId,
        status: "in_progress",
        deviceFingerprint: currentFingerprint,
        startedAt: new Date(),
        expiresAt: new Date(now.getTime() + exam.durationMinutes * 60000),
      })
      .returning({ id: examSessions.id });

    // B. Insert the Frozen Questions
    // We map the IDs to rows with an 'orderIndex'
    const problemRows = selectedProblemIds.map((pId, index) => ({
      sessionId: session.id,
      problemId: pId,
      orderIndex: index + 1, // Store the randomized order
    }));

    await tx.insert(sessionProblems).values(problemRows);

    return session.id;
  });

  // 6. Redirect to the exam interface
  redirect(`/exam/${newSessionId}`);
}
