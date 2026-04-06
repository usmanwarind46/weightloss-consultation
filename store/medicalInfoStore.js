import { create } from "zustand";
import { persist } from "zustand/middleware";

const useMedicalInfoStore = create(
  persist(
    (set) => ({
      medicalInfo: [],
      setMedicalInfo: (medicalInfo) => set({ medicalInfo }),
      clearMedicalInfo: () => set({ medicalInfo: [] }),
    }),
    {
      name: "medical-info-storage",
    }
  )
);

export default useMedicalInfoStore;
