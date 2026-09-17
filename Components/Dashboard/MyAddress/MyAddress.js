import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreditCard, MapPin } from "lucide-react";

import Shipping from "./Shipping";
import Billing from "./Billing";
import { getProfileData } from "@/api/myProfileApi";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import { PageHeader } from "@/Components/Dashboard/MyAccount/MyAccount";

export const AddressFormSkeleton = ({ icon: Icon, title, subtitle }) => (
  <section className="relative mt-5 overflow-hidden rounded-[22px] border border-[#4565BF]/10 bg-white p-4 sm:p-5 lg:p-6">
    <div className="flex items-start gap-3.5 border-b border-[#4565BF]/[0.07] pb-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#4565BF]/[0.08] text-[#4565BF]">
        <Icon size={19} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <h2 className="inter-bold-font text-[20px] leading-7 text-slate-950 sm:text-[23px]">{title}</h2>
        <p className="inter-reg-font mt-1.5 text-[12.5px] text-slate-500 sm:text-[13px]">{subtitle}</p>
      </div>
    </div>
    <div className="mt-6 space-y-5">
      <div className="h-[52px] w-full animate-pulse rounded-[14px] bg-slate-100" />
      <div className="flex gap-2">
        <div className="h-[52px] flex-1 animate-pulse rounded-[14px] bg-slate-100" />
        <div className="h-[52px] w-24 animate-pulse rounded-md bg-[#4565BF]/[0.07]" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="h-[52px] animate-pulse rounded-[14px] bg-slate-100" />
        <div className="h-[52px] animate-pulse rounded-[14px] bg-slate-100" />
      </div>
      <div className="h-[52px] w-full animate-pulse rounded-[14px] bg-slate-100" />
      <div className="!mt-9 border-t border-[#4565BF]/[0.07] pt-5">
        <div className="h-[46px] w-[160px] animate-pulse rounded-xl bg-[#4565BF]/[0.07]" />
      </div>
    </div>
  </section>
);

export default function MyAddress() {
  const [billingCountries, setBillingCountries] = useState([]);
  const [shipmentCountries, setShipmentCountries] = useState([]);

  const { authUserDetail } = useAuthUserDetailStore();

  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: (data) => {
      setBillingCountries(data?.data?.profile?.billing_countries || []);
      setShipmentCountries(data?.data?.profile?.shippment_countries || []);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    },
  });

  useEffect(() => { getProfileDataMutation.mutate(); }, []);

  const countriesLoading = getProfileDataMutation.isLoading;

  return (
    <main className="inter-reg-font min-w-0 flex-1 bg-[#EEF2FA]">
      <div className="mx-auto flex w-full flex-col gap-6 p-4 sm:p-5 lg:p-6">

        <PageHeader
          label="Address Book"
          title="My Address Book"
          subtitle="Manage shipping and billing address for your orders."
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section>
            {countriesLoading
              ? <AddressFormSkeleton icon={MapPin} title="Shipping information" subtitle="Update your shipping details — changes will apply to future orders only." />
              : <Shipping shipmentCountries={shipmentCountries} />
            }
          </section>
          <section>
            {countriesLoading
              ? <AddressFormSkeleton icon={CreditCard} title="Billing information" subtitle="Update your billing details — changes will apply to future orders only." />
              : <Billing billingCountries={billingCountries} />
            }
          </section>
        </div>

      </div>
    </main>
  );
}
