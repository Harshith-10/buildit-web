import {
  foreignKey,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { submissionStatus } from "./enums";
import { examSessions } from "./exams";
import { problems } from "./problems";

export const submissions = pgTable(
  "submissions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    sessionId: uuid("session_id").notNull(),
    problemId: uuid("problem_id").notNull(),
    answerData: jsonb("answer_data").notNull(),
    status: submissionStatus().default("pending").notNull(),
    score: integer().default(0),
    runtimeMs: integer("runtime_ms"),
    memoryKb: integer("memory_kb"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [examSessions.id],
      name: "submissions_session_id_exam_sessions_id_fk",
    }),
    foreignKey({
      columns: [table.problemId],
      foreignColumns: [problems.id],
      name: "submissions_problem_id_problems_id_fk",
    }),
  ],
);

export const jobLogs = pgTable(
  "job_logs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    submissionId: uuid("submission_id").notNull(),
    workerNodeId: text("worker_node_id").notNull(),
    consensusHash: text("consensus_hash"),
    outputLog: text("output_log"),
    executedAt: timestamp("executed_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.submissionId],
      foreignColumns: [submissions.id],
      name: "job_logs_submission_id_submissions_id_fk",
    }),
  ],
);
