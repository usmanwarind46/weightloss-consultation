import { create } from "zustand";
import { persist } from "zustand/middleware";

const useConfirmationInfoStore = create(
  persist(
    (set) => ({
      confirmationInfo: [],
      setConfirmationInfo: (confirmationInfo) => set({ confirmationInfo }),
      clearConfirmationInfo: () => set({ confirmationInfo: [] }),
    }),
    {
      name: "confirmation-info-storage",
    }
  )
);

export default useConfirmationInfoStore;
