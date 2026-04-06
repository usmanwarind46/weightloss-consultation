import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthUserDetailStore = create(
  persist(
    (set) => ({
      authUserDetail: null,
      setAuthUserDetail: (authUserDetail) => set({ authUserDetail }),
      clearAuthUserDetail: () => set({ authUserDetail: null }),
      setIsReturning: (isReturning) =>
        set((state) => ({
          authUserDetail: {
            ...state.authUserDetail,
            isReturning,
          },
        })),
    }),
    {
      name: "auth-user-storage", // localStorage key
    }
  )
);

export default useAuthUserDetailStore;
