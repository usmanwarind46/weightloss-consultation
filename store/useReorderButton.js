import { create } from "zustand";
import { persist } from "zustand/middleware";

const useReorderButtonStore = create(
  persist(
    (set) => ({
      isFromReorder: false,
      setIsFromReorder: (value) => set({ isFromReorder: value }),
      clearFromReorder: () => set({ isFromReorder: false }),
    }),
    {
      name: "isFromReorder",
    }
  )
);

export default useReorderButtonStore;
