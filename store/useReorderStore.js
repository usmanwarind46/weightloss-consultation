import { create } from "zustand";
import { persist } from "zustand/middleware";

const useReorder = create(
  persist(
    (set) => ({
      reorder: false,
      reorderStatus: false,

      setReorder: (status) => set({ reorder: status }),
      setReorderStatus: (status) => set({ reorderStatus: status }),

      resetReorder: () => set({ reorder: false }),
      resetReorderStatus: () => set({ reorder: false }),
    }),
    {
      name: "reorder-status",
    }
  )
);

export default useReorder;
