import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCheckoutStore = create(
  persist(
    (set) => ({
      checkout: null,
      setCheckout: (checkout) => set({ checkout }),
      clearCheckout: () => set({ checkout: null }),
    }),
    {
      name: "checkout-storage",
    }
  )
);

export default useCheckoutStore;
