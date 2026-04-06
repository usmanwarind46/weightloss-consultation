import React, { useEffect, useState } from "react";
import Shipping from "./Shipping";
import Billing from "./Billing";
import { getProfileData } from "@/api/myProfileApi";
import { useMutation } from "@tanstack/react-query";

export default function MyAddress() {
  const [tabActive, setTabActive] = useState("shipping");
  const [billingCountries, setBillingCountries] = useState([]);
  const [shipmentCountries, setShipmentCountries] = useState([]);

  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: (data) => {
      console.log(data, "data");
      setBillingCountries(data?.data?.profile?.billing_countries);
      setShipmentCountries(data?.data?.profile?.shippment_countries);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    },
  });

  useEffect(() => {
    getProfileDataMutation.mutate();
  }, []);

  return (
    <div className="p-6 sm:bg-[#F9FAFB] sm:min-h-screen sm:rounded-md sm:shadow-md my-5 sm:me-5">
      <div className="flex sm:gap-4 justify-around lg:justify-normal md:justify-normal mb-6 relative">
        {/* Shipping Tab */}
        <button
          onClick={() => setTabActive("shipping")}
          className={`sm:font-bold reg-font sm:px-4 py-2 relative ${
            tabActive === "shipping" && "text-primary"
          } tab-text-shipping text-black cursor-pointer`}
        >
          Shipping Address
          {tabActive === "shipping" && <span className={`tab-shipping absolute left-0 bottom-0 h-[4px] bg-primary w-full`} />}
        </button>

        {/* Billing Tab */}
        <button
          onClick={() => setTabActive("billing")}
          className={`sm:font-bold reg-font sm:px-4 py-2 relative ${
            tabActive === "billing" && "text-primary"
          } tab-text-billing text-black cursor-pointer`}
        >
          Billing Address
          {tabActive === "billing" && <span className={`tab-billing absolute left-0 bottom-0 h-[4px] bg-primary w-full`} />}
        </button>
      </div>

      <div>{tabActive == "shipping" ? <Shipping shipmentCountries={shipmentCountries} /> : <Billing billingCountries={billingCountries} />}</div>
    </div>
  );
}
