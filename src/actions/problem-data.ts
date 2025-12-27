"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import db from "@/db";
import { problems, submissions, testCases } from "@/db/schema";
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
    const visibleTestCases = problem.testCases.filter((tc) => !tc.isHidden);
    const testCasesToShow =
      visibleTestCases.length > 0
        ? visibleTestCases
        : problem.testCases.slice(0, 3); // Show first 3 if all are hidden

    return {
      ...problem,
      // Ensure strict type compatibility for enums if needed, or cast if schema matches
      difficulty: problem.difficulty as "easy" | "medium" | "hard",
      content: problem.content as Problem["content"],
      driverCode: problem.driverCode as Record<string, string>,
      testCases: testCasesToShow,
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

import { z } from "zod";
import { executeTestcases } from "@/actions/code-execution";

const submitSolutionSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  language: z.string().min(1, "Language is required"),
  problemId: z.string().uuid("Invalid problem ID"),
  version: z.string().optional().default("*"),
});

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

  // Validate inputs
  const validatedInput = submitSolutionSchema.parse({
    code,
    language,
    problemId,
    version,
  });

  // 1. Fetch Problem with ALL test cases
  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, validatedInput.problemId),
    with: {
      testCases: true,
    },
  });

  if (!problem) throw new Error("Problem not found");

  // 2. Prepare Payload
  // const driverCode = (problem.driverCode as Record<string, string>)?.[validatedInput.language];
  // Note: Driver code logic kept as is (commented out/simple) per original implementation for now,
  // until explicit requirement to merge it is clarified or implemented.

  const payload = {
    language: validatedInput.language,
    version: validatedInput.version,
    files: [
      {
        content: validatedInput.code,
      },
    ],
    testcases: problem.testCases.map((tc) => ({
      id: tc.id.toString(), // ensure ID is string for Piston
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    })),
  };

  // 3. Execute
  const results = await executeTestcases(payload);

  if (results.message && !results.testcases) {
    // Compilation error or API error
    return {
      status: "runtime_error",
      runtimeMs: 0,
      memoryKb: 0,
      message: results.message,
      testCases: [],
    };
  }

  // 4. Validate & Filter Results
  // Map execution results back to problem test cases to check isHidden
  const testCaseResults = results.testcases.map((tcResult) => {
    const originalTestCase = problem.testCases.find(
      (ptc) => ptc.id.toString() === tcResult.id,
    );
    return {
      ...tcResult,
      isHidden: originalTestCase?.isHidden ?? false,
    };
  });

  const allPassed = testCaseResults.every((tc) => tc.passed);
  const status = allPassed ? "accepted" : "wrong_answer";

  // Logic: Show all Public test cases + First Failed test case (if any)
  const publicTestCases = testCaseResults.filter((tc) => !tc.isHidden);
  const firstFailedTestCase = testCaseResults.find((tc) => !tc.passed);

  const clientTestCases = [...publicTestCases];

  // If there is a failure, and it's NOT already in the public list (i.e. it's hidden), add it.
  if (firstFailedTestCase?.isHidden) {
    // REDACT info for hidden failure
    const redactedFailure = {
      ...firstFailedTestCase,
      input: "[Hidden]",
      expectedOutput: "[Hidden]",
      actualOutput: "[Hidden]",
      // We keep run_details (stdout/stderr) but maybe we should be careful there too?
      // Usually stderr might leak info, but standard runner output is often needed for debugging errors (like exceptions).
      // For now, only hiding input/output as per plan.
    };
    clientTestCases.push(redactedFailure);
  }

  // Sort by ID or order to keep consistent? Piston doesn't guarantee order, but we mapped by ID.
  // We can sort if needed, but append is fine for "Public... then Failure".

  // Calculate stats based on ALL run testcases (accurate performance metrics)
  const runtimeMs =
    results.testcases.reduce(
      (acc, tc) => acc + (tc.run_details.wall_time || 0),
      0,
    ) / (results.testcases.length || 1);

  const memoryKb = Math.max(
    ...results.testcases.map((tc) => tc.run_details.memory || 0),
  );

  // 5. Save Submission
  const [submission] = await db
    .insert(submissions)
    .values({
      userId: session.user.id,
      problemId: problem.id,
      answerData: {
        code: validatedInput.code,
        language: validatedInput.language,
        version: validatedInput.version,
      },
      status: status,
      runtimeMs: Math.floor(runtimeMs * 1000),
      memoryKb: Math.floor(memoryKb / 1024),
    })
    .returning();

  return {
    status: submission.status,
    runtimeMs: submission.runtimeMs,
    memoryKb: submission.memoryKb,
    message: results.message || (allPassed ? "Accepted" : "Wrong Answer"),
    testCases: clientTestCases,
  };
};

const createProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z
    .enum(["coding", "mcq_single", "mcq_multi", "true_false", "descriptive"])
    .default("coding"),
  driverCode: z.record(z.string()),
  testCases: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
      isHidden: z.boolean(),
    }),
  ),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional().default(false),
  content: z.object({
    examples: z.array(
      z.object({
        input: z.string(),
        output: z.string(),
        explanation: z.string().optional(),
      }),
    ),
    constraints: z.array(z.string()).optional(),
  }),
});

export const createProblem = async (
  data: z.infer<typeof createProblemSchema>,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validatedData = createProblemSchema.parse(data);

  // Generate a slug from title
  const slug = validatedData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // Insert Problem
  const [newProblem] = await db
    .insert(problems)
    .values({
      title: validatedData.title,
      slug: slug + "-" + Math.random().toString(36).substring(2, 7), // Ensure uniqueness
      description: validatedData.description,
      difficulty: validatedData.difficulty,
      type: validatedData.type,
      content: validatedData.content,
      driverCode: validatedData.driverCode,
      public: validatedData.isPublic,
      createdBy: session.user.id,
    })
    .returning();

  // Insert Test Cases
  if (validatedData.testCases.length > 0) {
    await db.insert(testCases).values(
      validatedData.testCases.map((tc) => ({
        problemId: newProblem.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      })),
    );
  }

  return newProblem;
};
