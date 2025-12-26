import { and, eq, sql } from "drizzle-orm";
import db from "@/db";
import { problems } from "@/db/schema/problems";
import type { ExamConfig } from "@/types/exam-config";

export async function generateQuestionSet(
  config: ExamConfig,
): Promise<string[]> {
  switch (config.strategy) {
    case "fixed":
      return config.problemIds;

    case "predefined_sets": {
      // Randomly pick one array from the sets
      const randomIndex = Math.floor(Math.random() * config.sets.length);
      return config.sets[randomIndex];
    }

    case "random_pool": {
      // Get N random IDs from a collection
      const results = await db
        .select({ id: problems.id })
        .from(problems)
        .where(eq(problems.collectionId, config.collectionId))
        .orderBy(sql`RANDOM()`) // Postgres random sort
        .limit(config.count);

      return results.map((r) => r.id);
    }

    case "distribution": {
      // Complex: Iterate through rules and merge results
      let allIds: string[] = [];

      for (const rule of config.rules) {
        const conditions = [eq(problems.difficulty, rule.difficulty)];

        if (rule.collectionId) {
          conditions.push(eq(problems.collectionId, rule.collectionId));
        }

        const ruleIds = await db
          .select({ id: problems.id })
          .from(problems)
          .where(and(...conditions))
          .orderBy(sql`RANDOM()`)
          .limit(rule.count);

        allIds = [...allIds, ...ruleIds.map((r) => r.id)];
      }

      // Shuffle the final merged list so "Hard" questions aren't always last
      return allIds.sort(() => Math.random() - 0.5);
    }

    default:
      throw new Error("Invalid Exam Strategy");
  }
}
