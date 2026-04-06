import { create } from "zustand";
import { persist } from "zustand/middleware";

const useBmiStore = create(
  persist(
    (set) => ({
      bmi: "",
      setBmi: (bmi) => set({ bmi }),
      clearBmi: () => set({ bmi: null }),
    }),
    {
      name: "bmi-storage",
    }
  )
);

export default useBmiStore;
