import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSignupStore = create(
  persist(
    (set) => ({
      firstName: "",
      lastName: "",
      email: "",
      confirmationEmail: "",

      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setEmail: (email) => set({ email }),
      setConfirmationEmail: (confirmationEmail) => set({ confirmationEmail }),

      clearFirstName: () => set({ firstName: null }),
      clearLastName: () => set({ lastName: null }),
      clearEmail: () => set({ email: null }),
      clearConfirmationEmail: () => set({ confirmationEmail: null }),
    }),
    {
      name: "signup-storage", // Storage key
    }
  )
);

export default useSignupStore;
