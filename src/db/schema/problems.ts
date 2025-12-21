import {
  boolean,
  foreignKey,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { difficulty, problemType } from "./enums";

export const problemBanks = pgTable("problem_banks", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  description: text(),
  public: boolean().default(false),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const problems = pgTable(
  "problems",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    bankId: uuid("bank_id"),
    type: problemType().notNull(),
    difficulty: difficulty().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    content: jsonb().notNull(),
    gradingMetadata: jsonb("grading_metadata"),
    public: boolean().default(false),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.bankId],
      foreignColumns: [problemBanks.id],
      name: "problems_bank_id_problem_banks_id_fk",
    }),
  ],
);

export const testCases = pgTable(
  "test_cases",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    problemId: uuid("problem_id").notNull(),
    input: text().notNull(),
    expectedOutput: text("expected_output").notNull(),
    isHidden: boolean("is_hidden").default(true),
  },
  (table) => [
    foreignKey({
      columns: [table.problemId],
      foreignColumns: [problems.id],
      name: "test_cases_problem_id_problems_id_fk",
    }),
  ],
);
