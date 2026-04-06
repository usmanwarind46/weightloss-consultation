import { create } from "zustand";
import { persist } from "zustand/middleware";

const useMedicalQuestionsStore = create(
  persist(
    (set) => ({
      medicalQuestions: [],
      setMedicalQuestions: (medicalQuestions) => set({ medicalQuestions }),
      clearMedicalQuestions: () => set({ medicalQuestions: [] }),
    }),
    {
      name: "medical-questions-storage",
    }
  )
);

export default useMedicalQuestionsStore;
