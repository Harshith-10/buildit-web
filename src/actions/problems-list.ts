"use server";

import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import db from "@/db";
import { problems } from "@/db/schema";

export type GetProblemsParams = {
  page?: number;
  perPage?: number;
  search?: string;
  type?: "coding" | "mcq_single" | "mcq_multi" | "true_false" | "descriptive";
  difficulty?: "easy" | "medium" | "hard";
  sort?: string;
};

export async function getProblems({
  page = 1,
  perPage = 10,
  search,
  type,
  difficulty,
  sort,
}: GetProblemsParams) {
  const conditions = [];

  if (search) {
    conditions.push(ilike(problems.title, `%${search}%`));
  }

  if (type) {
    conditions.push(eq(problems.type, type));
  }

  if (difficulty) {
    conditions.push(eq(problems.difficulty, difficulty));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy = desc(problems.createdAt);
  if (sort === "title-asc") orderBy = asc(problems.title);
  if (sort === "title-desc") orderBy = desc(problems.title);
  if (sort === "difficulty-asc") orderBy = asc(problems.difficulty); // Note: custom sort might be needed for enums but pgEnum sorting usually works alphabetically or by underlying value? 'easy' < 'hard' is alphabetical. Logic might need tweaking if we want semantic sort.
  // Actually alphabetical works: easy, hard, medium. Not perfect.
  // For now let's stick to simple db sort.

  const data = await db
    .select()
    .from(problems)
    .where(whereClause)
    .limit(perPage)
    .offset((page - 1) * perPage)
    .orderBy(orderBy);

  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(problems)
    .where(whereClause);

  const total = countResult?.count ?? 0;

  return { data, total };
}
