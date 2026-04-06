import { create } from "zustand";
import { persist } from "zustand/middleware";

const useVariationStore = create(
  persist(
    (set) => ({
      variation: [],
      setVariation: (variation) => set({ variation }),
      clearVariation: () => set({ variation: [] }),
    }),
    {
      name: "variation-storage",
    }
  )
);

export default useVariationStore;
