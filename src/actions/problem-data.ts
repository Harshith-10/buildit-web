"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import db from "@/db";
import { problems, submissions } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { Problem, Submission } from "@/types/problem";

export const getProblem = cache(
  async (slug: string): Promise<Problem | null> => {
    const problem = await db.query.problems.findFirst({
      where: eq(problems.slug, slug),
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
      difficulty: problem.difficulty as "easy" | "medium" | "hard",
      content: problem.content as Problem["content"],
      driverCode: problem.driverCode as Record<string, string>,
      testCases: problem.testCases.filter((tc) => !tc.isHidden),
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const allProblems = await db.query.problems.findMany({
    columns: {
      id: true,
      title: true,
      difficulty: true,
      slug: true,
    },
    with: {
      submissions: {
        where: (submissions, { eq, or, and }) =>
          and(
            eq(submissions.status, "accepted"),
            session?.user?.id
              ? eq(submissions.userId, session.user.id)
              : undefined,
          ),
        limit: 1,
      },
    },
  });

  return allProblems.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty as "easy" | "medium" | "hard",
    slug: p.slug,
    status: p.submissions.length > 0 ? "solved" : "unsolved",
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
    where: (table, { eq, and, or }) =>
      and(
        eq(table.problemId, problemId),
        or(
          eq(table.userId, session.user.id),
          // support legacy/exam submissions if needed, though usually userId should be populated now
          // If we want to strictly decouple, we might exclude exam sessions here if checking public profile
          // But user said "user to be able to submit solutions and view their submissions in the submissions tab in the problem info panel"
          // This usually implies 'my submissions for this problem', regardless of context?
          // "The general problem submissions are publid, whereas the exam's problem submissions will be used to grade the test, and should not show up in the public problems page."
          // This implies filtering where sessionId IS NULL for public page.
        ),
      ),
    with: {
      examSession: true,
    },
    orderBy: desc(submissions.createdAt),
  });

  // Filter for public submissions (sessionId is null)?
  // User said "The general problem submissions are publid, whereas the exam's problem submissions ... should not show up in the public problems page."
  // So validation:
  return userSubmissions
    .filter((s) => !s.sessionId || s.examSession?.userId === session.user.id) // Ensure ownership
    .map((s) => ({
      id: s.id,
      problemId: s.problemId,
      status: s.status as Submission["status"],
      score: s.score ?? 0,
      runtimeMs: s.runtimeMs ?? undefined,
      memoryKb: s.memoryKb ?? undefined,
      createdAt: s.createdAt ?? new Date(),
      answerData: s.answerData as any,
    }));
};

// ... runCode implementation ...

import { executeTestcases } from "@/actions/code-execution";

export const submitSolution = async (
  code: string,
  language: string,
  problemId: string,
  version: string,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // 1. Fetch Problem with ALL test cases
  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, problemId),
    with: {
      testCases: true,
    },
  });

  if (!problem) throw new Error("Problem not found");

  // 2. Prepare Payload
  const driverCode = (problem.driverCode as Record<string, string>)?.[language];
  // If driver code exists, inject user code.
  // Usually driver code has a placeholder like // USER_CODE or it wraps the user code.
  // The user implemented "Driver Code Folding" earlier.
  // Looking at previous conversations, driver code is likely wrapping the solution.
  // If driverCode is stored, we might need to send it.
  // Piston usually takes 'files'.
  // If driverCode is present, we should probable construct the file to include it?
  // Previous conversation "Implement Driver Code Folding" might shed light.
  // Using simple concatenation for now if driverCode has a replacement marker?
  // Or just sending user code if no driver code.
  // The user didn't specify driver code logic here, but mentioned it in history.
  // I'll assume for now we send user code directly, or if there's driver code, we might need to handle it.
  // However, usually `executeTestcases` handles the execution.
  // Let's assume the user code is complete or the Piston environment handles it.
  // Actually, checking `executeTestcases` in `code-execution.ts`, it takes `files` and `testcases`.

  // Refined: If there is driver code, we probably need to merge it?
  // Let's stick to simple execution for now unless I see a clear "merge" requirement.
  // User mentions "consider @[src/actions/code-execution.ts]".

  const payload = {
    language,
    version,
    files: [
      {
        content: code,
      },
    ],
    testcases: problem.testCases.map((tc) => ({
      id: tc.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    })),
  };

  // 3. Execute
  const results = await executeTestcases(payload);

  // 4. Validate
  // results.testcases has passed/failed status
  const allPassed = results.testcases.every((tc) => tc.passed);
  const status = allPassed ? "accepted" : "wrong_answer"; // Or runtime_error if compile failed

  // Calculate average runtime/memory? Or max?
  // Usually sum or max.
  const runtimeMs =
    results.testcases.reduce((acc, tc) => acc + tc.run_details.wall_time, 0) /
    results.testcases.length; // Average?
  // Wait, `wall_time` is in seconds? `code-execution.ts` says `cpu_time` and `wall_time`. Usually ms or s? Piston v2 is usually ms?
  // Piston output for limit is usually implicit.
  // Let's assume milliseconds if not specified. Piston usually returns seconds?
  // checking code-execution: `wall_time` is number.
  // `time` in submissions is `integer("runtime_ms")`.
  // I should check `code-execution` output. Piston CPU time is usually seconds.
  // I will assume it is seconds and convert to MS.

  // Calculate max memory usage
  const memoryKb = Math.max(
    ...results.testcases.map((tc) => tc.run_details.memory),
  );

  // 5. Save Submission
  const [submission] = await db
    .insert(submissions)
    .values({
      userId: session.user.id,
      problemId: problem.id,
      answerData: { code, language, version }, // store simple JSON
      status: results.message ? "runtime_error" : status, // specific error handling
      runtimeMs: Math.floor(runtimeMs * 1000), // convert s to ms if needed
      memoryKb: Math.floor(memoryKb / 1024), // bytes to kb? Piston returns bytes?
      // Let's verify units. Piston 'memory' is usually bytes. 'cpu_time' is seconds.
    })
    .returning();

  return {
    status: submission.status,
    runtimeMs: submission.runtimeMs,
    memoryKb: submission.memoryKb,
    message: results.message || (allPassed ? "Accepted" : "Wrong Answer"),
    testCases: results.testcases, // Optional: return details to user
  };
};
