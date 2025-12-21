import { pgEnum } from "drizzle-orm/pg-core";

export const difficulty = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const problemType = pgEnum("problem_type", [
  "coding",
  "mcq_single",
  "mcq_multi",
  "true_false",
  "descriptive",
]);
export const sessionStatus = pgEnum("session_status", [
  "in_progress",
  "submitted",
  "terminated",
]);
export const submissionStatus = pgEnum("submission_status", [
  "pending",
  "accepted",
  "wrong_answer",
  "time_limit_exceeded",
  "runtime_error",
  "manual_review",
]);
export const userRole = pgEnum("user_role", ["student", "instructor", "admin"]);
