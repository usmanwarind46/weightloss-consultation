import { create } from "zustand";
import { persist } from "zustand/middleware";

const useConfirmationInfoStore = create(
  persist(
    (set) => ({
      confirmationInfo: [],
      consentResetProductId: null,
      setConfirmationInfo: (confirmationInfo) => set({ confirmationInfo }),
      clearConfirmationInfo: () => set({ confirmationInfo: [] }),
      setConsentResetProductId: (productId) =>
        set({ consentResetProductId: productId }),
      clearConsentResetProductId: () => set({ consentResetProductId: null }),
    }),
    {
      name: "confirmation-info-storage",
    }
  )
);

export default useConfirmationInfoStore;
