import { create } from "zustand";
import { persist } from "zustand/middleware";

const useReorderBackProcessStore = create(
  persist(
    (set) => ({
      reorderBackProcess: false,
      setReorderBackProcess: (value) => set({ reorderBackProcess: value }),
      clearReorderBackProcess: () => set({ reorderBackProcess: false }),
    }),
    {
      name: "reorder-back-process",
    }
  )
);

export default useReorderBackProcessStore;
