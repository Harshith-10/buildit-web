import { relations } from "drizzle-orm/relations";
import {
  assignmentSubmissions,
  examAssignments,
  malpracticeEvents,
} from "./assignments";
import { account, session, user } from "./auth";
import { dailyProblems as dailyProblemsSchema } from "./daily-problems";
import { examGroups, exams } from "./exams";
import {
  groups,
  userGroupMembers,
  userGroups,
  usersToGroups,
} from "./groups";
import {
  collections,
  problems,
  questionTestCases,
  questions,
  testCases,
} from "./problems";
import {
  collectionQuestions,
  examCollections,
  questionCollections,
} from "./question-collections";

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  usersToGroups: many(usersToGroups),
  accounts: many(account),
  examAssignments: many(examAssignments),
  userGroupMembers: many(userGroupMembers),
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

export const examsRelations = relations(exams, ({ one, many }) => ({
  examGroups: many(examGroups),
  examCollections: many(examCollections),
  examAssignments: many(examAssignments),
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

export const dailyProblemsRelations = relations(
  dailyProblemsSchema,
  ({ one }) => ({
    problem: one(problems, {
      fields: [dailyProblemsSchema.problemId],
      references: [problems.id],
    }),
  }),
);

// New relations for temp-transfer tables
export const examAssignmentsRelations = relations(
  examAssignments,
  ({ one, many }) => ({
    user: one(user, {
      fields: [examAssignments.userId],
      references: [user.id],
    }),
    exam: one(exams, {
      fields: [examAssignments.examId],
      references: [exams.id],
    }),
    submissions: many(assignmentSubmissions),
    malpracticeEvents: many(malpracticeEvents),
  }),
);

export const assignmentSubmissionsRelations = relations(
  assignmentSubmissions,
  ({ one }) => ({
    assignment: one(examAssignments, {
      fields: [assignmentSubmissions.assignmentId],
      references: [examAssignments.id],
    }),
    question: one(questions, {
      fields: [assignmentSubmissions.questionId],
      references: [questions.id],
    }),
  }),
);

export const malpracticeEventsRelations = relations(
  malpracticeEvents,
  ({ one }) => ({
    assignment: one(examAssignments, {
      fields: [malpracticeEvents.assignmentId],
      references: [examAssignments.id],
    }),
  }),
);

export const userGroupsRelations = relations(userGroups, ({ many }) => ({
  members: many(userGroupMembers),
  examGroups: many(examGroups),
}));

export const userGroupMembersRelations = relations(
  userGroupMembers,
  ({ one }) => ({
    group: one(userGroups, {
      fields: [userGroupMembers.groupId],
      references: [userGroups.id],
    }),
    user: one(user, {
      fields: [userGroupMembers.userId],
      references: [user.id],
    }),
  }),
);

export const examGroupsRelations = relations(examGroups, ({ one }) => ({
  exam: one(exams, {
    fields: [examGroups.examId],
    references: [exams.id],
  }),
  group: one(userGroups, {
    fields: [examGroups.groupId],
    references: [userGroups.id],
  }),
}));

export const questionCollectionsRelations = relations(
  questionCollections,
  ({ many }) => ({
    questions: many(collectionQuestions),
    exams: many(examCollections),
  }),
);

export const collectionQuestionsRelations = relations(
  collectionQuestions,
  ({ one }) => ({
    collection: one(questionCollections, {
      fields: [collectionQuestions.collectionId],
      references: [questionCollections.id],
    }),
    question: one(questions, {
      fields: [collectionQuestions.questionId],
      references: [questions.id],
    }),
  }),
);

export const examCollectionsRelations = relations(
  examCollections,
  ({ one }) => ({
    exam: one(exams, {
      fields: [examCollections.examId],
      references: [exams.id],
    }),
    collection: one(questionCollections, {
      fields: [examCollections.collectionId],
      references: [questionCollections.id],
    }),
  }),
);

export const questionsRelations = relations(questions, ({ many }) => ({
  testCases: many(questionTestCases),
  assignmentSubmissions: many(assignmentSubmissions),
  collectionQuestions: many(collectionQuestions),
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
