import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      hasHydrated: false,
      isImpersonationLogout: false,

      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      setHasHydrated: () => set({ hasHydrated: true }),
      setIsImpersonationLogout: (isImpersonationLogout) => set({ isImpersonationLogout }),
    }),
    {
      name: "auth-storage",
      // ✅ Trigger setHasHydrated AFTER rehydration completes
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated();
      },
    }
  )
);

export default useAuthStore;
