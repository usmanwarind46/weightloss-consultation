import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { Client } from "getaddress-api";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import TextField from "@/Components/TextField/TextField";
import PageLoader from "@/Components/PageLoader/PageLoader";
import NextButton from "@/Components/NextButton/NextButton";
import MUISelectField from "@/Components/SelectField/SelectField";
import SectionWrapper from "@/Components/checkout/SectionWrapper";
import { getProfileData, sendProfileData } from "@/api/myProfileApi";

// const api = new Client("aYssNMkdXEGsdfGVZjiY0Q26381");

export default function Billing({ billingCountries }) {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [billingIndex, setBillingIndex] = useState("");
  const [billing, setBilling] = useState("");
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [countryChangedManually, setCountryChangedManually] = useState(false);

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
      state: "",
      billingCountry: "",
    },
  });

  const postalCodeValue = watch("postalcode");
  const selectedBillingCountry = watch("billingCountry");
  const selectedCountryObj = (billingCountries || []).find(
    (c) => c.id.toString() === selectedBillingCountry,
  );
  const allowedCountryNames = [
    "United Kingdom (Mainland)",
    "Channel Islands",
    "Northern Ireland",
  ];
  const isSearchAllowed =
    selectedCountryObj && allowedCountryNames.includes(selectedCountryObj.name);

  // 🟢 Get billing data from profile
  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: (res) => {
      const billingData = res?.data?.profile?.billing;
      if (!billingData) return;
      setBilling(billingData);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to load profile data.",
      );
    },
  });

  // 🟢 Call API once countries are ready
  useEffect(() => {
    if (billingCountries?.length) {
      getProfileDataMutation.mutate();
    }
  }, [billingCountries]);

  // 🟢 Prefill billing form if not manually changed
  useEffect(() => {
    if (!billing || !billingCountries?.length || countryChangedManually) return;

    setValue("postalcode", billing.postalcode || "");
    setValue("addressone", billing.addressone || "");
    setValue("addresstwo", billing.addresstwo || "");
    setValue("city", billing.city || "");
    setValue("state", billing.state || "");

    const country = billingCountries.find(
      (c) => c.name === billing.country_name || c.name === billing.country,
    );
    if (country) {
      setValue("billingCountry", country.id.toString(), {
        shouldValidate: true,
      });
      setBillingIndex(country.id.toString());
    }
  }, [billing, billingCountries]);

  // 🟢 Handle postcode search
  const handleSearch = async () => {
    setAddressSearchLoading(true);

    if (!postalCodeValue?.trim()) {
      setAddressSearchLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(
          postalCodeValue.trim(),
        )}?api_key=${process.env.NEXT_PUBLIC_IDEAL_POSTCODES_KEY}`,
      );

      const data = await res.json();

      if (data && Array.isArray(data.result) && data.result.length) {
        setAddressOptions(data.result);
        setManual(true);
      } else {
        setAddressSearchLoading(false);
        toast.error("Invalid Post code");
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong while fetching addresses.");
    } finally {
      setAddressSearchLoading(false);
    }
  };

  // 🟢 Submit billing info
  const sendProfileDataMutation = useMutation(sendProfileData, {
    onSuccess: () => {
      setShowLoader(false);
      toast.success("Billing updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    },
  });

  const onSubmit = (data) => {
    setShowLoader(true);
    const selectedCountry = billingCountries.find(
      (c) => c.id.toString() === billingIndex,
    );

    const formData = {
      billing: true,
      country_name: selectedCountry?.name || "",
      postalcode: data.postalcode,
      addressone: data.addressone,
      addresstwo: data.addresstwo,
      city: data.city,
      state: data.state,
    };

    sendProfileDataMutation.mutate(formData);
  };

  return (
    <SectionWrapper>
      <header className="pb-4">
        <h1 className="md:text-3xl text-lg mb-2 headingDashBoard bold-font text-black">
          Billing Information
        </h1>
        <p className="reg-font paragraph  text-left text-sm xl:w-3/4 mt-2">
          Update your billing details — changes will apply to future orders
          only.
        </p>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5">
        <Controller
          name="billingCountry"
          control={control}
          rules={{ required: "Country is required" }}
          render={({ field }) => (
            <MUISelectField
              label="Select Country"
              name="billingCountry"
              value={field.value}
              required
              onChange={(e) => {
                const id = e.target.value;
                field.onChange(id);
                setBillingIndex(id);
                setCountryChangedManually(true); // ✅ user manually changed

                // ✅ Clear fields on manual country change
                setValue("postalcode", "");
                setValue("addressone", "");
                setValue("addresstwo", "");
                setValue("city", "");
                setValue("state", "");
              }}
              options={(billingCountries || []).map((addr) => ({
                value: addr.id.toString(),
                label: addr.name,
              }))}
            />
          )}
        />

        <div className="relative">
          <TextField
            label="Post code"
            name="postalcode"
            register={register}
            required
            errors={errors}
          />
          {isSearchAllowed && (
            <button
              type="button"
              onClick={handleSearch}
              className={`absolute right-3 transform -translate-y-1/2 text-white bg-primary px-3 py-1 rounded cursor-pointer w-32 flex items-center justify-center ${
                errors.postalcode ? "top-2/4" : "top-2/3"
              }`}
              disabled={addressSearchLoading}
            >
              {addressSearchLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear",
                  }}
                  className="w-6 h-6 border-4 border-t-transparent rounded-full text-white"
                />
              ) : (
                <span className="flex items-center">
                  <FaSearch className="inline-block me-2" />
                  Search
                </span>
              )}
            </button>
          )}
        </div>

        {isSearchAllowed &&
          postalCodeValue?.trim() &&
          !addressSearchLoading &&
          addressOptions.length > 0 && (
            <MUISelectField
              label="Select Your Address"
              name="addressSelect"
              value={selectedIndex}
              required
              onChange={(e) => {
                const idx = e.target.value;
                const selected = addressOptions[idx];
                setSelectedIndex(idx);

                setValue("addressone", selected.line_1 || "", {
                  shouldValidate: true,
                });
                setValue("addresstwo", selected.line_2 || "", {
                  shouldValidate: true,
                });
                setValue("city", selected.post_town || "", {
                  shouldValidate: true,
                });
                setValue("state", selected.county || "", {
                  shouldValidate: true,
                });
              }}
              options={addressOptions.map((addr, idx) => ({
                value: idx,
                label: [
                  addr.line_1,
                  addr.line_2,
                  addr.line_3,
                  addr.post_town,
                  addr.postcode,
                ]
                  .filter(Boolean)
                  .join(", "),
              }))}
            />
          )}

        <TextField
          label="Address"
          name="addressone"
          register={register}
          required
          errors={errors}
        />
        <TextField
          label="Address 2"
          name="addresstwo"
          register={register}
          errors={errors}
        />
        <TextField
          label="Town / City"
          name="city"
          register={register}
          required
          errors={errors}
        />
        <TextField
          label="State / County"
          name="state"
          register={register}
          errors={errors}
        />
        <div className="max-w-24">
          <NextButton label="Continue" disabled={!isValid} />
        </div>
      </form>

      {showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded">
          <PageLoader />
        </div>
      )}
    </SectionWrapper>
  );
}
