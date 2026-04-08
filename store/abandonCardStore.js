import { se } from "date-fns/locale";
import { create } from "zustand";
import { persist } from "zustand/middleware";
const useAbandonCardStore = create(
  persist(
    (set) => ({
      abandonCard: null,
      extra: null,

      setAbandonCard: (data) =>
        set((state) => ({
          abandonCard: {
            ...state.abandonCard,
            ...data,
          },
        })),
      setExtra: (data) =>
        set((state) => ({
          extra: { ...state.extra, ...data },
        })),

      clearAbandonCard: () => set({ abandonCard: null, extra: null }),
    }),
    {
      name: "abandon-card-storage",
    },
  ),
);

export default useAbandonCardStore;
