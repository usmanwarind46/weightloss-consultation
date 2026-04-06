import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePatientInfoStore = create(
  persist(
    (set) => ({
      patientInfo: null,
      setPatientInfo: (patientInfo) => set({ patientInfo }),
      clearPatientInfo: () => set({ patientInfo: null }),
    }),
    {
      name: "patient-info-storage",
    }
  )
);

export default usePatientInfoStore;
