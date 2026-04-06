import { create } from "zustand";
import { persist } from "zustand/middleware";

const useProductId = create(
  persist(
    (set) => ({
      productId: null,
      setProductId: (productId) => set({ productId }),
      clearProductId: () => set({ productId: null }),
    }),
    {
      name: "product-id", // localStorage key
    }
  )
);

export default useProductId;
