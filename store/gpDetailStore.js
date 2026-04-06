import { create } from "zustand";
import { persist } from "zustand/middleware";

const useGpDetailsStore = create(
  persist(
    (set) => ({
      gpdetails: null,
      setGpDetails: (gpdetails) => set({ gpdetails }),
      clearGpDetails: () => set({ gpdetails: null }),
    }),
    {
      name: "gpdetails-storage",
    }
  )
);

export default useGpDetailsStore;
