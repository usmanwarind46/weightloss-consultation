import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePasswordReset = create(
  persist(
    (set) => ({
      isPasswordReset: true,
      showResetPassword: true,

      setIsPasswordReset: (isPasswordReset) => set({ isPasswordReset }),
      setShowResetPassword: (showResetPassword) => set({ showResetPassword }),

      clearIsPasswordReset: () => set({ isPasswordReset: false }),
      clearShowResetPassword: () => set({ showResetPassword: false }),
    }),
    {
      name: "user-password-reset",
    }
  )
);

export default usePasswordReset;
