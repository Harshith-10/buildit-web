import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  json,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { difficulty, problemType } from "./enums";

export const collections = pgTable(
  "collections",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    public: boolean().default(false),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "collections_created_by_user_id_fk",
    }),
  ],
);

export const problems = pgTable(
  "problems",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    collectionId: uuid("collection_id"),
    type: problemType().notNull(),
    difficulty: difficulty().notNull(),
    title: text().notNull(),
    slug: text().notNull().unique(),
    description: text().notNull(),
    content: jsonb().notNull(),
    driverCode: jsonb("driver_code"),
    gradingMetadata: jsonb("grading_metadata"),
    public: boolean().default(false),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.collectionId],
      foreignColumns: [collections.id],
      name: "problems_collection_id_collections_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "problems_created_by_user_id_fk",
    }),
    index("problems_collection_id_idx").on(table.collectionId),
    index("problems_created_by_idx").on(table.createdBy),
    index("problems_slug_idx").on(table.slug),
  ],
);

export const testCases = pgTable(
  "test_cases",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    problemId: uuid("problem_id").notNull(),
    input: text().notNull(),
    expectedOutput: text("expected_output").notNull(),
    isHidden: boolean("is_hidden").default(true).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.problemId],
      foreignColumns: [problems.id],
      name: "test_cases_problem_id_problems_id_fk",
    }).onDelete("cascade"),
    index("test_cases_problem_id_idx").on(table.problemId),
  ],
);

// Alternative naming for temp-transfer compatibility
export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    problemStatement: text("problem_statement").notNull(),
    difficulty: difficulty("difficulty").notNull(),
    allowedLanguages: json("allowed_languages").default(["java"]),
    driverCode: json("driver_code")
      .$type<Record<string, string>>()
      .default({ java: "" }),
  },
);

export const questionTestCases = pgTable("question_test_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  input: text("input").notNull(),
  expectedOutput: text("expected_output").notNull(),
  isHidden: boolean("is_hidden").default(true).notNull(),
});

// Relations
export const collectionsRelations = relations(collections, ({ one, many }) => ({
  problems: many(problems),
  createdBy: one(user, {
    fields: [collections.createdBy],
    references: [user.id],
  }),
}));

export const problemsRelations = relations(problems, ({ one, many }) => ({
  collection: one(collections, {
    fields: [problems.collectionId],
    references: [collections.id],
  }),
  testCases: many(testCases),
  createdBy: one(user, {
    fields: [problems.createdBy],
    references: [user.id],
  }),
}));

export const testCasesRelations = relations(testCases, ({ one }) => ({
  problem: one(problems, {
    fields: [testCases.problemId],
    references: [problems.id],
  }),
}));

export const questionsRelations = relations(questions, ({ many }) => ({
  testCases: many(questionTestCases),
}));

export const questionTestCasesRelations = relations(
  questionTestCases,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionTestCases.questionId],
      references: [questions.id],
    }),
  }),
);
