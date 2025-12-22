import { relations } from "drizzle-orm/relations";
import { account, session, user } from "./auth";
import { dailyProblems as dailyProblemsSchema } from "./daily-problems";
import { examSessions, exams, sessionProblems } from "./exams";
import { groups, usersToGroups } from "./groups";
import { collections, problems, testCases } from "./problems";
import { jobLogs, submissions } from "./submissions";

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  usersToGroups: many(usersToGroups),
  examSessions: many(examSessions),
  accounts: many(account),
}));

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  user: one(user, {
    fields: [usersToGroups.userId],
    references: [user.id],
  }),
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.id],
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  usersToGroups: many(usersToGroups),
  createdBy: one(user, {
    fields: [groups.createdBy],
    references: [user.id],
  }),
}));

export const problemsRelations = relations(problems, ({ one, many }) => ({
  collection: one(collections, {
    fields: [problems.collectionId],
    references: [collections.id],
  }),
  testCases: many(testCases),
  submissions: many(submissions),
  sessionProblems: many(sessionProblems),
  createdBy: one(user, {
    fields: [problems.createdBy],
    references: [user.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  problems: many(problems),
  createdBy: one(user, {
    fields: [collections.createdBy],
    references: [user.id],
  }),
}));

export const testCasesRelations = relations(testCases, ({ one }) => ({
  problem: one(problems, {
    fields: [testCases.problemId],
    references: [problems.id],
  }),
}));

export const examSessionsRelations = relations(
  examSessions,
  ({ one, many }) => ({
    exam: one(exams, {
      fields: [examSessions.examId],
      references: [exams.id],
    }),
    user: one(user, {
      fields: [examSessions.userId],
      references: [user.id],
    }),
    submissions: many(submissions),
    sessionProblems: many(sessionProblems),
  }),
);

export const examsRelations = relations(exams, ({ one, many }) => ({
  examSessions: many(examSessions),
  createdBy: one(user, {
    fields: [exams.createdBy],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  examSession: one(examSessions, {
    fields: [submissions.sessionId],
    references: [examSessions.id],
  }),
  problem: one(problems, {
    fields: [submissions.problemId],
    references: [problems.id],
  }),
  jobLogs: many(jobLogs),
}));

export const jobLogsRelations = relations(jobLogs, ({ one }) => ({
  submission: one(submissions, {
    fields: [jobLogs.submissionId],
    references: [submissions.id],
  }),
}));

export const sessionProblemsRelations = relations(
  sessionProblems,
  ({ one }) => ({
    examSession: one(examSessions, {
      fields: [sessionProblems.sessionId],
      references: [examSessions.id],
    }),
  }),
);

export const dailyProblemsRelations = relations(
  dailyProblemsSchema,
  ({ one }) => ({
    problem: one(problems, {
      fields: [dailyProblemsSchema.problemId],
      references: [problems.id],
    }),
  }),
);
