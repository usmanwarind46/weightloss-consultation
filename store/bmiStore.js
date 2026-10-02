import { create } from "zustand";
import { persist } from "zustand/middleware";

const useBmiStore = create(
  persist(
    (set) => ({
      bmi: "",
      clinicChangeConsent: "",
      setBmi: (bmi) => set({ bmi }),
      setClinicChangeConsent: (clinicChangeConsent) =>
        set({ clinicChangeConsent }),
      clearBmi: () => set({ bmi: null, clinicChangeConsent: "" }),
    }),
    {
      name: "bmi-storage",
    }
  )
);

export default useBmiStore;
