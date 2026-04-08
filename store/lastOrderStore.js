import { create } from "zustand";
import { persist } from "zustand/middleware";

const lastOrderStore = create(
  persist(
    (set) => ({
      lastOrder: null,
      setLastOrder: (lastOrder) => set({ lastOrder }),
      clearLastOrder: () => set({ lastOrder: null }),
    }),
    {
      name: "lastOrder-storage",
    },
  ),
);

export default lastOrderStore;
