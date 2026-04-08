import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      hasHydrated: false,
      isImpersonationLogout: false,
      review: null,

      setToken: (token) => set({ token }),
      setReview: (review) => set({ review }),
      clearToken: () => set({ token: null }),
      clearReview: () => set({ review: null }),
      setHasHydrated: () => set({ hasHydrated: true }),
      setIsImpersonationLogout: (isImpersonationLogout) =>
        set({ isImpersonationLogout }),
    }),
    {
      name: "auth-storage",
      // ✅ Trigger setHasHydrated AFTER rehydration completes
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated();
      },
    },
  ),
);

export default useAuthStore;
