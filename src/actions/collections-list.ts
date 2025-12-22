"use server";

import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import db from "@/db";
import { collections } from "@/db/schema";

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
