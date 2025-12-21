import { create } from "zustand";

interface PageNameState {
  // Map of pathname to custom page name
  pageNames: Record<string, string>;
  // Set a custom name for a specific pathname
  setPageName: (pathname: string, name: string) => void;
  // Clear a page name
  clearPageName: (pathname: string) => void;
  // Get a page name
  getPageName: (pathname: string) => string | undefined;
}

export const usePageNameStore = create<PageNameState>()((set, get) => ({
  pageNames: {},
  setPageName: (pathname, name) =>
    set((state) => ({
      pageNames: { ...state.pageNames, [pathname]: name },
    })),
  clearPageName: (pathname) =>
    set((state) => {
      const { [pathname]: _, ...rest } = state.pageNames;
      return { pageNames: rest };
    }),
  getPageName: (pathname) => get().pageNames[pathname],
}));
