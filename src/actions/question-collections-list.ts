"use server";

import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import db from "@/db";
import { collectionQuestions, questionCollections, questions } from "@/db/schema";

export type GetQuestionCollectionsParams = {
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
};

export async function getQuestionCollections({
  page = 1,
  perPage = 10,
  search,
  sort,
}: GetQuestionCollectionsParams = {}) {
  const conditions = [];

  if (search) {
    conditions.push(ilike(questionCollections.title, `%${search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy = desc(questionCollections.createdAt);
  if (sort === "title-asc") orderBy = asc(questionCollections.title);
  if (sort === "title-desc") orderBy = desc(questionCollections.title);
  if (sort === "created-asc") orderBy = asc(questionCollections.createdAt);
  if (sort === "created-desc") orderBy = desc(questionCollections.createdAt);

  const data = await db
    .select()
    .from(questionCollections)
    .where(whereClause)
    .limit(perPage)
    .offset((page - 1) * perPage)
    .orderBy(orderBy);

  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(questionCollections)
    .where(whereClause);

  const total = countResult?.count ?? 0;

  return { data, total };
}

export async function getQuestionsInCollection(collectionId: string) {
  const questionsInCollection = await db
    .select({
      id: questions.id,
      title: questions.title,
      problemStatement: questions.problemStatement,
      difficulty: questions.difficulty,
      allowedLanguages: questions.allowedLanguages,
    })
    .from(collectionQuestions)
    .innerJoin(questions, eq(collectionQuestions.questionId, questions.id))
    .where(eq(collectionQuestions.collectionId, collectionId));

  return questionsInCollection;
}
