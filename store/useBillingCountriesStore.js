import { create } from "zustand";
import { persist } from "zustand/middleware";

const useBillingCountries = create(
  persist(
    (set) => ({
      billingCountries: null,
      setBillingCountries: (billingCountries) => set({ billingCountries }),
      clearBillingCountries: () => set({ billingCountries: null }),
    }),
    {
      name: "billing-countries",
    }
  )
);

export default useBillingCountries;
