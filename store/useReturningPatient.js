import { create } from "zustand";
import { persist } from "zustand/middleware";

const useReturning = create(
  persist(
    (set) => ({
      isReturningPatient: false,

      setIsReturningPatient: (status) => set({ isReturningPatient: status }),

      resetIsReturningPatient: () => set({ isReturningPatient: false }),
    }),
    {
      name: "is-returning-patient",
    }
  )
);

export default useReturning;
