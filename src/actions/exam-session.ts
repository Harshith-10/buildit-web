"use server";

import { and, eq } from "drizzle-orm";
import { cache } from "react";
import db from "@/db";
import { examSessions, exams, problems, sessionProblems, testCases } from "@/db/schema";

export const getExamSession = cache(async (sessionId: string) => {
  const [session] = await db
    .select()
    .from(examSessions)
    .where(eq(examSessions.id, sessionId));
  return session;
});

export const getExamSessionWithDetails = cache(async (sessionId: string) => {
  const [session] = await db
    .select({
      session: examSessions,
      exam: exams,
    })
    .from(examSessions)
    .innerJoin(exams, eq(examSessions.examId, exams.id))
    .where(eq(examSessions.id, sessionId));

  return session;
});

export const getSessionProblems = cache(async (sessionId: string) => {
  const problemsList = await db
    .select({
      problem: problems,
      orderIndex: sessionProblems.orderIndex,
    })
    .from(sessionProblems)
    .innerJoin(problems, eq(sessionProblems.problemId, problems.id))
    .where(eq(sessionProblems.sessionId, sessionId))
    .orderBy(sessionProblems.orderIndex);

  // Fetch test cases for each problem and format to match Problem type
  const problemsWithTestCases = await Promise.all(
    problemsList.map(async (p) => {
      const problemTestCases = await db
        .select()
        .from(testCases)
        .where(eq(testCases.problemId, p.problem.id));

      return {
        ...p.problem,
        difficulty: p.problem.difficulty as "easy" | "medium" | "hard",
        content: p.problem.content as any,
        driverCode: p.problem.driverCode as Record<string, string>,
        testCases: problemTestCases.filter((tc) => !tc.isHidden),
        collection: undefined,
      };
    }),
  );

  return problemsWithTestCases;
});

// Store violations in memory for now (in production, use a violations table)
const sessionViolations = new Map<string, number>();

export async function recordViolation(sessionId: string, violationType: string) {
  const session = await getExamSession(sessionId);
  
  if (!session) {
    throw new Error("Session not found");
  }

  if (session.status !== "in_progress") {
    return { violations: 0, terminated: true };
  }

  // Get current violations count
  const currentViolations = sessionViolations.get(sessionId) || 0;
  const newViolationCount = currentViolations + 1;
  
  // Store the updated count
  sessionViolations.set(sessionId, newViolationCount);

  // If violations >= 3, terminate the exam
  if (newViolationCount >= 3) {
    await db
      .update(examSessions)
      .set({ status: "terminated" })
      .where(eq(examSessions.id, sessionId));
    
    return { violations: newViolationCount, terminated: true };
  }

  return { violations: newViolationCount, terminated: false };
}

export async function getViolationCount(sessionId: string) {
  return sessionViolations.get(sessionId) || 0;
}

export async function endExamSession(sessionId: string) {
  await db
    .update(examSessions)
    .set({ status: "submitted" })
    .where(eq(examSessions.id, sessionId));
}

export async function checkSessionValidity(sessionId: string, userId: string) {
  const session = await getExamSession(sessionId);

  if (!session) {
    return { valid: false, reason: "Session not found" };
  }

  if (session.userId !== userId) {
    return { valid: false, reason: "Unauthorized access" };
  }

  if (session.status === "submitted") {
    return { valid: false, reason: "Exam already submitted" };
  }

  if (session.status === "terminated") {
    return { valid: false, reason: "Exam was terminated" };
  }

  const now = new Date();
  if (now > session.expiresAt) {
    // Auto-submit expired sessions
    await db
      .update(examSessions)
      .set({ status: "submitted" })
      .where(eq(examSessions.id, sessionId));
    
    return { valid: false, reason: "Exam time expired" };
  }

  return { valid: true };
}
