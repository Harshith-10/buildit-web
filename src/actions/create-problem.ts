"use server";

import { headers } from "next/headers";
import db from "@/db";
import { problems, testCases } from "@/db/schema";
import { auth } from "@/lib/auth";

export type CreateProblemData = {
  collectionId?: string;
  type: "coding" | "mcq_single" | "mcq_multi" | "true_false" | "descriptive";
  difficulty: "easy" | "medium" | "hard";
  title: string;
  slug: string;
  description: string;
  content: Record<string, unknown>;
  driverCode?: Record<string, unknown>;
  gradingMetadata?: Record<string, unknown>;
  public: boolean;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
};

export async function createProblem(data: CreateProblemData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    // Create the problem
    const [problem] = await db
      .insert(problems)
      .values({
        collectionId: data.collectionId || null,
        type: data.type,
        difficulty: data.difficulty,
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        driverCode: data.driverCode || null,
        gradingMetadata: data.gradingMetadata || null,
        public: data.public,
        createdBy: session.user.id,
      })
      .returning();

    // Create test cases if provided
    if (data.testCases && data.testCases.length > 0) {
      await db.insert(testCases).values(
        data.testCases.map((tc) => ({
          problemId: problem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
        })),
      );
    }

    return { success: true, problemId: problem.id, slug: problem.slug };
  } catch (error) {
    console.error("Error creating problem:", error);
    return { error: "Failed to create problem" };
  }
}
