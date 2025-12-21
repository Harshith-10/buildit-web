import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      open: true,
      setOpen: (open) => set({ open }),
      openMobile: false,
      setOpenMobile: (openMobile) => set({ openMobile }),
    }),
    {
      name: "sidebar-state",
    },
  ),
);
