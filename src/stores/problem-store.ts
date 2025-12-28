import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProblemState {
  // Map<problemId, Map<language, code>>
  code: Record<string, Record<string, string>>;
  // Map<problemId, lastUsedTimestamp>
  lastUpdated: Record<string, number>;

  preferences: {
    panelLayout: number[];
  };

  lastLanguage: string | null;
  lastLanguageVersion: string | null;

  setCode: (problemId: string, language: string, code: string) => void;
  setPreferences: (prefs: { panelLayout: number[] }) => void;
  setLastLanguage: (language: string, version: string) => void;

  // Clean up old entries
  hydrate: () => void;
}

const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useProblemStore = create<ProblemState>()(
  persist(
    (set, get) => ({
      code: {},
      lastUpdated: {},
      preferences: {
        panelLayout: [50, 50],
      },
      lastLanguage: null,
      lastLanguageVersion: null,

      setCode: (problemId, language, code) =>
        set((state) => ({
          code: {
            ...state.code,
            [problemId]: {
              ...(state.code[problemId] || {}),
              [language]: code,
            },
          },
          lastUpdated: {
            ...state.lastUpdated,
            [problemId]: Date.now(),
          },
        })),

      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      setLastLanguage: (language, version) =>
        set({ lastLanguage: language, lastLanguageVersion: version }),

      hydrate: () => {
        const state = get();
        const now = Date.now();
        const newCode = { ...state.code };
        const newLastUpdated = { ...state.lastUpdated };
        let hasChanges = false;

        Object.keys(newLastUpdated).forEach((problemId) => {
          if (now - newLastUpdated[problemId] > EXPIRY_MS) {
            delete newCode[problemId];
            delete newLastUpdated[problemId];
            hasChanges = true;
          }
        });

        if (hasChanges) {
          set({ code: newCode, lastUpdated: newLastUpdated });
        }
      },
    }),
    {
      name: "problem-storage",
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
      },
    },
  ),
);
