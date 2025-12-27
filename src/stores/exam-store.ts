import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Runtime, TestcaseResult } from "@/actions/code-execution";
import type { Problem } from "@/types/problem";

export interface ExamSubmission {
  code: string;
  language: string;
  version: string;
  status: "accepted" | "rejected" | "pending" | "error";
  testCaseResults: TestcaseResult[];
  timestamp: number;
}

interface ExamState {
  // problemId -> language -> code
  code: Record<string, Record<string, string>>;

  // problemId -> Submission details
  submissions: Record<string, ExamSubmission>;

  // Set of visited problem IDs
  visitedProblems: Record<string, boolean>;

  // Sync status for offline handling (optional for now, but good for tracking)
  hasUnsyncedChanges: boolean;

  // Actions
  initialize: (problems: Problem[], supportedLanguages: Runtime[]) => void;
  setCode: (problemId: string, language: string, code: string) => void;
  getCode: (problemId: string, language: string) => string;

  saveSubmission: (
    problemId: string,
    submission: Omit<ExamSubmission, "timestamp">,
  ) => void;
  getSubmission: (problemId: string) => ExamSubmission | null;

  markProblemVisited: (problemId: string) => void;
  isProblemVisited: (problemId: string) => boolean;

  reset: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      code: {},
      submissions: {},
      visitedProblems: {},
      hasUnsyncedChanges: false,

      initialize: (problems, supportedLanguages) => {
        set((state) => {
          const newCode = { ...state.code };
          const newVisited = { ...state.visitedProblems };
          let hasChanges = false;

          problems.forEach((problem) => {
            // 1. Initialize Code
            if (!newCode[problem.id]) {
              newCode[problem.id] = {};
            }

            const uniqueLangs = Array.from(
              new Set(supportedLanguages.map((l) => l.language)),
            );

            uniqueLangs.forEach((lang) => {
              if (newCode[problem.id][lang] === undefined) {
                const driver = problem.driverCode?.[lang] || "";
                newCode[problem.id][lang] = driver;
                hasChanges = true;
              }
            });

            // 2. Initialize Visited (optional, maybe we only track what user actively visits)
            // If we want to preload "false" for everything:
            // if (newVisited[problem.id] === undefined) {
            //   newVisited[problem.id] = false;
            // }
            // But 'undefined' is effectively 'false'.
          });

          return hasChanges ? { code: newCode } : state;
        });
      },

      setCode: (problemId, language, code) => {
        set((state) => ({
          code: {
            ...state.code,
            [problemId]: {
              ...(state.code[problemId] || {}),
              [language]: code,
            },
          },
          hasUnsyncedChanges: true,
        }));
      },

      getCode: (problemId, language) => {
        const state = get();
        return state.code[problemId]?.[language] || "";
      },

      saveSubmission: (problemId, submission) => {
        set((state) => ({
          submissions: {
            ...state.submissions,
            [problemId]: {
              ...submission,
              timestamp: Date.now(),
            },
          },
          hasUnsyncedChanges: true,
        }));
      },

      getSubmission: (problemId) => {
        return get().submissions[problemId] || null;
      },

      markProblemVisited: (problemId) => {
        set((state) => ({
          visitedProblems: {
            ...state.visitedProblems,
            [problemId]: true,
          },
        }));
      },

      isProblemVisited: (problemId) => {
        return !!get().visitedProblems[problemId];
      },

      reset: () => {
        set({
          code: {},
          submissions: {},
          visitedProblems: {},
          hasUnsyncedChanges: false,
        });
      },
    }),
    {
      name: "exam-storage",
      // Optional: partialize to exclude large objects if needed,
      // but requirement says persist EVERYTHING.
    },
  ),
);
