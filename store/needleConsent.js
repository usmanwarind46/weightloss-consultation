import { create } from "zustand";
import { persist } from "zustand/middleware";

const useNeedleConsent = create(
  persist(
    (set) => ({
      needleMessage: "", // default is empty
      setNeedleMessage: (message) => set({ needleMessage: message }),
      clearNeedleMessage: () => set({ needleMessage: "" }),
    }),
    {
      name: "needle-consent", // key in localStorage
    }
  )
);

export default useNeedleConsent;
