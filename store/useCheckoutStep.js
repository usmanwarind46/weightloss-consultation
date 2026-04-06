// store/useCheckoutStep.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCheckoutStep = create(
  persist(
    (set) => ({
      step: 1,
      setStep: (step) => set({ step }),
      resetStep: () => set({ step: 1 }), 
    }),
    {
      name: "checkout-step-storage",
    }
  )
);

export default useCheckoutStep;
