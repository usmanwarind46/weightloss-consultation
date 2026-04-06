import { create } from "zustand";
import { persist } from "zustand/middleware";

const useShipmentCountries = create(
  persist(
    (set) => ({
      shipmentCountries: null,
      setShipmentCountries: (shipmentCountries) => set({ shipmentCountries }),
      clearShipmentCountries: () => set({ shipmentCountries: null }),
    }),
    {
      name: "shipment-countries",
    }
  )
);

export default useShipmentCountries;
