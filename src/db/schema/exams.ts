import {
  foreignKey,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { sessionStatus } from "./enums";
import { problems } from "./problems";

export const exams = pgTable(
  "exams",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: text().notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    config: jsonb().notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "exams_created_by_user_id_fk",
    }),
  ],
);

export const examSessions = pgTable(
  "exam_sessions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    examId: uuid("exam_id").notNull(),
    userId: text("user_id").notNull(),
    status: sessionStatus().default("in_progress").notNull(),
    deviceFingerprint: text("device_fingerprint"),
    lockedIp: text("locked_ip"),
    startedAt: timestamp("started_at").defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.examId],
      foreignColumns: [exams.id],
      name: "exam_sessions_exam_id_exams_id_fk",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "exam_sessions_user_id_user_id_fk",
    }),
  ],
);

export const sessionProblems = pgTable(
  "session_problems",
  {
    sessionId: uuid("session_id").notNull(),
    problemId: uuid("problem_id").notNull(),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [examSessions.id],
      name: "session_problems_session_id_exam_sessions_id_fk",
    }),
    foreignKey({
      columns: [table.problemId],
      foreignColumns: [problems.id],
      name: "session_problems_problem_id_problems_id_fk",
    }),
    primaryKey({
      columns: [table.sessionId, table.problemId],
      name: "session_problems_session_id_problem_id_pk",
    }),
  ],
);
