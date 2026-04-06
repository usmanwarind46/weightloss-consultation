import { create } from "zustand";
import { persist } from "zustand/middleware";
const useShippingOrBillingStore = create(
  persist(
    (set) => ({
      shipping: null,
      billing: null,
      billingSameAsShipping: false, // :white_check_mark: NEW STATE added
      checkShippingForAccordion: null,
      checkBillingForAccordion: null,
      setShipping: (info) => set({ shipping: info }),
      setBilling: (info) => set({ billing: info }),
      setBillingSameAsShipping: (status) =>
        set({ billingSameAsShipping: status }),
      setCheckShippingForAccordion: (status) =>
        set({ checkShippingForAccordion: status }),
      setCheckBillingForAccordion: (state) =>
        set({ checkBillingForAccordion: state }),
      clearShipping: () => set({ shipping: null }),
      clearBilling: () => set({ billing: null }),
    }),
    {
      name: "shipping-billing-storage",
    }
  )
);
export default useShippingOrBillingStore;