import { create } from "zustand";
import { persist } from "zustand/middleware";

const useLastBmi = create(
  persist(
    (set) => ({
      lastBmi: null,
      setLastBmi: (lastBmi) => set({ lastBmi }),
      clearLastBmi: () => set({ lastBmi: null }),
    }),
    {
      name: "last-bmi",
    }
  )
);

export default useLastBmi;
