import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserDataStore = create(
  persist(
    (set) => ({
      userData: null,
      setUserData: (userData) => set({ userData }),
      clearUserData: () => set({ userData: null }),
    }),
    {
      name: "user-data-storage", // localStorage key
    }
  )
);

export default useUserDataStore;
