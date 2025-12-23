"use server";

import db from "@/db";
import { problems, submissions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { cache } from "react";
import type { Problem, Submission } from "@/types/problem";

export const getProblem = cache(
  async (problemId: string): Promise<Problem | null> => {
    const problem = await db.query.problems.findFirst({
      where: eq(problems.id, problemId),
      with: {
        testCases: true,
        collection: true,
      },
    });

    if (!problem) return null;

    // Transform to match strict Problem interface
    return {
      ...problem,
      // Ensure strict type compatibility for enums if needed, or cast if schema matches
      difficulty: problem.difficulty as "Easy" | "Medium" | "Hard",
      content: problem.content as Problem["content"],
      testCases: problem.testCases.map((tc) => ({
        ...tc,
        isHidden: tc.isHidden ?? false, // Handle nullable default
      })),
      collection: problem.collection
        ? {
            id: problem.collection.id,
            name: problem.collection.name,
          }
        : undefined,
    };
  },
);

export const getProblems = cache(async () => {
  const allProblems = await db.query.problems.findMany({
    columns: {
      id: true,
      title: true,
      difficulty: true,
    },
    with: {
      submissions: {
        where: (submissions, { eq }) => eq(submissions.status, "accepted"),
        limit: 1,
        // We only fetch one accepted submission to check if it exists for status
        with: {
          examSession: {
            columns: {
              userId: true,
            },
          },
        },
      },
    },
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return allProblems.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
    status: p.submissions.some(
      (s) => s.examSession?.userId === session?.user?.id,
    )
      ? "solved"
      : "unsolved",
  }));
});

export const getUserSubmissions = async (
  problemId: string,
): Promise<Submission[]> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return [];
  }

  const userSubmissions = await db.query.submissions.findMany({
    where: eq(submissions.problemId, problemId),
    with: {
      examSession: true,
    },
    orderBy: desc(submissions.createdAt),
  });

  return userSubmissions
    .filter((s) => s.examSession.userId === session.user.id)
    .map((s) => ({
      id: s.id,
      problemId: s.problemId,
      status: s.status as Submission["status"],
      score: s.score ?? 0,
      runtimeMs: s.runtimeMs ?? undefined,
      memoryKb: s.memoryKb ?? undefined,
      createdAt: s.createdAt ?? new Date(),
      answerData: s.answerData,
    }));
};

export const runCode = async (
  _code: string,
  _language: string,
  _problemId: string,
) => {
  // Mock run implementation
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Randomly succeed or fail for demo
  const success = Math.random() > 0.3;

  return {
    success,
    output: success
      ? "All test cases passed!"
      : "Syntax Error: Unexpected token...",
    logs: ["Running test case 1...", "Running test case 2..."],
    runtime: success ? 45 : undefined,
  };
};

export const submitSolution = async (
  _code: string,
  _language: string,
  _problemId: string,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // In a real app, this would create a submission record and trigger a job
  // For now, we'll just mock a response
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    status: "accepted" as const,
    runtimeMs: 52,
    memoryKb: 14200,
    message: "Accepted",
  };
};
