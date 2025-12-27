"use server";

import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import db from "@/db";
import { collections, problems as problemsSchema } from "@/db/schema";

export type GetCollectionsParams = {
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  visibility?: "public" | "private";
};

export async function getCollections({
  page = 1,
  perPage = 10,
  search,
  sort,
  visibility,
}: GetCollectionsParams) {
  // Base conditions
  const conditions = [];

  // Search
  if (search) {
    conditions.push(ilike(collections.name, `%${search}%`));
  }

  // Visibility
  if (visibility === "public") {
    conditions.push(eq(collections.public, true));
  } else if (visibility === "private") {
    conditions.push(eq(collections.public, false));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Sorting
  let orderBy = desc(collections.createdAt);
  if (sort === "name-asc") orderBy = asc(collections.name);
  if (sort === "name-desc") orderBy = desc(collections.name);
  if (sort === "created-asc") orderBy = asc(collections.createdAt);
  if (sort === "created-desc") orderBy = desc(collections.createdAt);

  const data = await db
    .select()
    .from(collections)
    .where(whereClause)
    .limit(perPage)
    .offset((page - 1) * perPage)
    .orderBy(orderBy);

  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(collections)
    .where(whereClause);

  const total = countResult?.count ?? 0;

  return { data, total };
}

export async function getCollection(
  id: string,
  problemParams: {
    page?: number;
    search?: string;
    type?: string;
    difficulty?: string;
    sort?: string;
  } = {},
) {
  const { page = 1, search, type, difficulty, sort } = problemParams;
  const perPage = 10;

  // Problem filters
  const problemConditions = [eq(problemsSchema.collectionId, id)];

  if (search) {
    problemConditions.push(ilike(problemsSchema.title, `%${search}%`));
  }
  if (type) {
    problemConditions.push(eq(problemsSchema.type, type as any));
  }
  if (difficulty) {
    problemConditions.push(eq(problemsSchema.difficulty, difficulty as any));
  }

  const problemWhere = and(...problemConditions);

  // Sorting
  let problemOrderBy = desc(problemsSchema.createdAt);
  if (sort === "title-asc") problemOrderBy = asc(problemsSchema.title);
  if (sort === "title-desc") problemOrderBy = desc(problemsSchema.title);
  if (sort === "difficulty-asc") problemOrderBy = asc(problemsSchema.difficulty);

  const collection = await db.query.collections.findFirst({
    where: eq(collections.id, id),
  });

  if (!collection) return null;

  const collectionProblems = await db
    .select()
    .from(problemsSchema)
    .where(problemWhere)
    .limit(perPage)
    .offset((page - 1) * perPage)
    .orderBy(problemOrderBy);

  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(problemsSchema)
    .where(problemWhere);

  const total = countResult?.count ?? 0;

  return {
    ...collection,
    problems: collectionProblems,
    totalProblems: total,
  };
}
