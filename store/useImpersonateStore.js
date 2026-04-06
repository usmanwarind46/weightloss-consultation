import { create } from "zustand";
import { persist } from "zustand/middleware";

const useImpersonate = create(
  persist(
    (set) => ({
      impersonate: false,
      setImpersonate: (impersonate) => set({ impersonate }),
      clearImpersonate: () => set({ impersonate: false }),
    }),
    {
      name: "impersonate-user",
    }
  )
);

export default useImpersonate;
