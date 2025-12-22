import {
  date,
  foreignKey,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { problems } from "./problems";

export const dailyProblems = pgTable(
  "daily_problems",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    problemId: uuid("problem_id").notNull(),
    date: date("date").notNull().unique(), // One problem per day
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.problemId],
      foreignColumns: [problems.id],
      name: "daily_problems_problem_id_problems_id_fk",
    }),
  ],
);
