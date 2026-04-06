import { create } from "zustand";
import { persist } from "zustand/middleware";

const useOrderId = create(
  persist(
    (set) => ({
      orderId: null,
      setOrderId: (orderId) => set({ orderId }),
      clearOrderId: () => set({ orderId: null }),
    }),
    {
      name: "orderId-storage",
    }
  )
);

export default useOrderId;
