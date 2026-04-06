import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStatusStore = create()(
  persist(
    (set) => ({
      status: "all",
      setStatus: (newStatus) => set({ status: newStatus }),
      clearStatus: () => set({ status: "all" }),
    }),
    {
      name: "status-storage",
    }
  )
);
