import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePaginationStore = create(
  persist(
    (set) => ({
      currentPage: 1, // default to page 1
      setCurrentPage: (page) => set({ currentPage: page }),
      clearCurrentPage: () => set({ currentPage: 1 }),
    }),
    {
      name: "pagination-storage", // localStorage key
    }
  )
);

export default usePaginationStore;
