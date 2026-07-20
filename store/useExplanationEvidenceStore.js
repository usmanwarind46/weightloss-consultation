import { create } from "zustand";
import { persist } from "zustand/middleware";

const useExplanationEvidenceStore = create(
  persist(
    (set) => ({
      explainenationEvidence: false,
      explainenationEvidenceDetails: null,

      setExplainenationEvidence: (status) =>
        set({ explainenationEvidence: status }),
      setExplainenationEvidenceDetails: (details) =>
        set({ explainenationEvidenceDetails: details }),
    }),
    {
      name: "explainenation-evidence-storage",
      partialize: (state) => ({
        explainenationEvidence: state.explainenationEvidence,
        explainenationEvidenceDetails: state.explainenationEvidenceDetails,
      }),
    },
  ),
);

export default useExplanationEvidenceStore;
