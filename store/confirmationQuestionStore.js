import { create } from "zustand";
import { persist } from "zustand/middleware";

const useConfirmationQuestionsStore = create(
  persist(
    (set) => ({
      confirmationQuestions: [],
      setConfirmationQuestions: (confirmationQuestions) => set({ confirmationQuestions }),
      clearConfirmationQuestions: () => set({ confirmationQuestions: [] }),
    }),
    {
      name: "confirmation-questions-storage",
    }
  )
);

export default useConfirmationQuestionsStore;
