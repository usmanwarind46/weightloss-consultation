import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Info, Loader2, MapPin, Search } from "lucide-react";

import TextField from "@/Components/TextField/TextField";
import PageLoader from "@/Components/PageLoader/PageLoader";
import NextButton from "@/Components/NextButton/NextButton";
import MUISelectField from "@/Components/SelectField/SelectField";
import { getProfileData, sendProfileData } from "@/api/myProfileApi";
import { AddressFormSkeleton } from "@/Components/Dashboard/MyAddress/MyAddress";

const UPDATE_BUTTON_CLASS = [
  "inter-medium-font !min-h-[46px] !rounded-xl",
  "!border-[#4565BF] !bg-[#4565BF] !px-6 !py-3",
  "!text-[12px] !text-white hover:!bg-[#3550a0]",
].join(" ");

export default function Shipping({ shipmentCountries = [] }) {
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [shippingIndex, setShippingIndex] = useState("");
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      postalcode: "",
      addressone: "",
      addresstwo: "",
      city: "",
      shippingCountry: "",
    },
  });

  const postalCodeValue = watch("postalcode");

  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: (response) => {
      const shippingData = response?.data?.profile?.shipping;
      if (shippingData) {
        setValue("postalcode", shippingData?.postalcode || "");
        setValue("addressone", shippingData?.addressone || "");
        setValue("addresstwo", shippingData?.addresstwo || "");
        setValue("city", shippingData?.city || "");
        const country = shipmentCountries.find((item) => item?.name === shippingData?.country);
        if (country) {
          const countryId = country.id.toString();
          setValue("shippingCountry", countryId, { shouldValidate: true });
          setShippingIndex(countryId);
        }
      }
      setIsDataLoading(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to load profile data.");
      setIsDataLoading(false);
    },
  });

  useEffect(() => {
    if (shipmentCountries.length > 0) {
      getProfileDataMutation.mutate();
    }
  }, [shipmentCountries]);

  const handleSearch = async () => {
    const postcode = postalCodeValue?.trim();
    if (!postcode) {
      toast.error("Please enter a post code.");
      return;
    }

    setAddressSearchLoading(true);

    try {
      const response = await fetch(
        `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(
          postcode,
        )}?api_key=${process.env.NEXT_PUBLIC_IDEAL_POSTCODES_KEY}`,
      );

      const result = await response.json();

      if (Array.isArray(result?.result) && result.result.length > 0) {
        setAddressOptions(result.result);
        setSelectedIndex("");
      } else {
        setAddressOptions([]);
        toast.error("Invalid post code.");
      }
    } catch (error) {
      toast.error("Something went wrong while fetching address.");
    } finally {
      setAddressSearchLoading(false);
    }
  };

  const sendProfileDataMutation = useMutation(sendProfileData, {
    onSuccess: () => {
      setShowLoader(false);
      toast.success("Shipping updated successfully!");
    },
    onError: (error) => {
      setShowLoader(false);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    },
  });

  const onSubmit = (formValues) => {
    setShowLoader(true);

    const selectedCountry = shipmentCountries.find(
      (country) => country?.id?.toString() === shippingIndex,
    );

    const formData = {
      shipping: true,
      country_name: selectedCountry?.name || "",
      postalcode: formValues.postalcode,
      addressone: formValues.addressone,
      addresstwo: formValues.addresstwo,
      city: formValues.city,
      state: "",
    };

    sendProfileDataMutation.mutate(formData);
  };

  if (isDataLoading) {
    return <AddressFormSkeleton icon={MapPin} title="Shipping information" subtitle="Update your shipping details — changes will apply to future orders only." />;
  }

  return (
    <section className="relative mt-5 overflow-hidden rounded-[22px] border border-[#4565BF]/10 bg-[#ffff] p-4 sm:p-5 lg:p-6">
      <div className="flex items-start gap-3.5 border-b border-[#4565BF]/[0.07] pb-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#4565BF]/[0.08] text-[#4565BF]">
          <MapPin size={19} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="inter-bold-font text-[20px] leading-7 text-slate-950 sm:text-[23px]">
            Shipping information
          </h2>
          <p className="inter-reg-font mt-1.5 max-w-2xl text-[12.5px] leading-[1.7] text-slate-500 sm:text-[13px]">
            Update your shipping details — changes will apply to future orders only.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="address-form mt-6 space-y-5">
        <Controller
          name="shippingCountry"
          control={control}
          rules={{ required: "Country is required" }}
          render={({ field }) => (
            <MUISelectField
              label="Select Country"
              variant="underline"
              name="shippingCountry"
              value={field.value}
              required
              onChange={(event) => {
                const id = event.target.value;
                field.onChange(id);
                setShippingIndex(id);
                setValue("postalcode", "");
                setValue("addressone", "");
                setValue("addresstwo", "");
                setValue("city", "");
                setAddressOptions([]);
                setSelectedIndex("");
              }}
              options={shipmentCountries.map((country) => ({
                value: country.id.toString(),
                label: country.name,
              }))}
            />
          )}
        />

        <div className="relative">
          <TextField
            label="Post code"
            name="postalcode"
            placeholder="e.g. SW1A 1AA"
            register={register}
            required
            errors={errors}
            className="pr-32"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={addressSearchLoading}
            className="absolute right-2 top-12.5 -translate-y-1/2 bg-[#4565BF] hover:bg-[#4565BF] text-white text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-1.5 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {addressSearchLoading ? (
              <>
                <Loader2 size={15} strokeWidth={2.3} className="animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Search size={15} strokeWidth={2.3} />
                Search
              </>
            )}
          </button>
        </div>

        {postalCodeValue?.trim() &&
          !addressSearchLoading &&
          addressOptions.length > 0 && (
            <MUISelectField
              label="Select Your Address"
              variant="underline"
              name="addressSelect"
              value={selectedIndex}
              required
              onChange={(event) => {
                const index = event.target.value;
                const selected = addressOptions[index];
                setSelectedIndex(index);
                if (!selected) return;

                setValue("addressone", selected?.line_1 || "", { shouldValidate: true });
                setValue("addresstwo", selected?.line_2 || "", { shouldValidate: true });
                setValue("city", selected?.post_town || "", { shouldValidate: true });
              }}
              options={addressOptions.map((address, index) => ({
                value: index,
                label: [
                  address?.line_1,
                  address?.line_2,
                  address?.line_3,
                  address?.post_town,
                  address?.postcode,
                ]
                  .filter(Boolean)
                  .join(", "),
              }))}
            />
          )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <TextField label="Address" name="addressone" placeholder="e.g. 10 Downing Street" register={register} required errors={errors} />
          <TextField label="Address 2" name="addresstwo" placeholder="Apartment, suite or unit (optional)" register={register} errors={errors} />
        </div>

        <TextField label="Town / City" name="city" placeholder="e.g. London" register={register} required errors={errors} />

        <div className="!mt-9 flex justify-start border-t border-[#4565BF]/[0.07] pt-5">
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <NextButton label="Update shipping" disabled={!isValid} className={UPDATE_BUTTON_CLASS} />
          </div>
        </div>
      </form>

      {showLoader && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[22px] bg-white/75 backdrop-blur-[2px]">
          <PageLoader />
        </div>
      )}

      <style jsx global>{`
        .address-form .MuiFormControl-root { width: 100%; }
        .address-form .MuiInputLabel-root { font-family: var(--inter-medium) !important; font-size: 13px !important; color: #64748b; }
        .address-form input, .address-form select, .address-form textarea { font-family: var(--inter-reg) !important; font-size: 13px !important; color: #0f172a !important; }
        .address-form label { font-family: var(--inter-medium) !important; }
      `}</style>
    </section>
  );
}
