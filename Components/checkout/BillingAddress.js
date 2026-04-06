import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { FaSearch } from "react-icons/fa";
import SectionWrapper from "./SectionWrapper";
import SectionHeader from "./SectionHeader";
import TextField from "@/Components/TextField/TextField";
import PageLoader from "@/Components/PageLoader/PageLoader";
import MUISelectField from "@/Components/SelectField/SelectField";
import { Client } from "getaddress-api";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useBillingCountries from "@/store/useBillingCountriesStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { SlNote } from "react-icons/sl";
import NextButton from "../NextButton/NextButton";

// const api = new Client("aYssNMkdXEGsdfGVZjiY0Q26381");

export default function BillingAddress({
  isCompleted,
  onComplete,
  sameAsShipping,
  setIsBillingCheck,
  setCloseBilling,
}) {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [billingIndex, setBillingIndex] = useState("");
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

  const {
    billing,
    setBilling,
    shipping,
    clearBilling,
    checkBillingForAccordion,
  } = useShippingOrBillingStore();
  const { billingCountries } = useBillingCountries();
  const prevBillingRef = useRef({});

  const allowedSearchCountryIds = ["1", "2", "3"];

  const isDisabled = sameAsShipping;

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

  // Watch all required fields
  const watchedFields = watch([
    "billingCountry",
    "postalcode",
    "addressone",
    "city",
    // add "state" if you want it to be required for the check
  ]);

  // Check if all required fields are filled
  useEffect(() => {
    const allFilled = watchedFields.every((field) => field && field !== "");
    setIsBillingCheck(allFilled);
  }, [watchedFields, setIsBillingCheck]);

  // useEffect(() => {
  //   if (checkBillingForAccordion != null) {
  //     console.log("All required fields are filled.");
  //     setCloseBilling(true);
  //   } else {
  //     console.log("Not all required fields are filled.");
  //   }
  // }, [checkBillingForAccordion]);

  const postalCodeValue = watch("postalcode");

  const selectedBillingCountry = watch("billingCountry"); // get current selected billing country ID
  // Get selected country object
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

  useEffect(() => {
    const selectedCountryObj = (billingCountries || []).find(
      (c) => c.id.toString() === selectedBillingCountry,
    );

    const allowedCountryNames = [
      "United Kingdom (Mainland)",
      "Channel Islands",
      "Northern Ireland",
    ];
    const isAllowed =
      selectedCountryObj &&
      allowedCountryNames.includes(selectedCountryObj.name);

    if (!isAllowed && selectedCountryObj) {
      // If country is selected BUT not allowed → clear billing
      clearBilling();

      setValue("postalcode", "");
      setValue("addressone", "");
      setValue("addresstwo", "");
      setValue("city", "");
      setValue("state", "");
    }
  }, [selectedBillingCountry, billingCountries]);

  // Prefill form fields
  useEffect(() => {
    if (shipping?.same_as_shipping) {
      setValue("postalcode", shipping.postalcode || "");
      setValue("addressone", shipping.addressone || "");
      setValue("addresstwo", shipping.addresstwo || "");
      setValue("city", shipping.city || "");
      setValue("state", shipping.state || "");

      const country = billingCountries?.find(
        (c) => c?.name === shipping?.country_name,
      ); // ✅ FIND BY NAME NOT ID
      if (country) {
        setValue("billingCountry", country.id.toString(), {
          shouldValidate: true,
        });
        setBillingIndex(country?.id?.toString());
      }

      setValue("same_as_shipping", true);
    } else if (billing) {
      // ✅ Prefill from billing if available
      setValue("postalcode", billing.postalcode || "");
      setValue("addressone", billing.addressone || "");
      setValue("addresstwo", billing.addresstwo || "");
      setValue("city", billing.city || "");
      setValue("state", billing.state || "");

      const country = billingCountries?.find(
        (c) => c.name === billing.country_name,
      );
      if (country) {
        setValue("billingCountry", country?.id?.toString(), {
          shouldValidate: true,
        });
        setBillingIndex(country?.id?.toString());
      }

      setValue("same_as_shipping", false);
    }
  }, [shipping, billing, billingCountries]);

  // Handle postcode search
  const handleSearch = async () => {
    setAddressSearchLoading(true);

    const postal = watch("postalcode");
    if (!postal) {
      setAddressSearchLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(
          postal,
        )}?api_key=${process.env.NEXT_PUBLIC_IDEAL_POSTCODES_KEY}`,
      );

      const data = await res.json();

      if (data && Array.isArray(data.result) && data.result.length) {
        setAddressOptions(data.result);
        setManual(true);
        setAddressSearchLoading(false);
        // setIsPostalCodeNotValid(false)
      } else {
        setAddressSearchLoading(false);
        // setIsPostalCodeNotValid(true);
        toast.error("Invalid Post code");
        // setIsPostalCheck(isPostalCodeNotValid)
        // setValue("addressone", "");
        // setValue("addresstwo", "");
        // setValue("city", "");
      }
    } catch (error) {
      setAddressSearchLoading(false);
      console.log("API error:", error);
      // setIsPostalCheck(isPostalCodeNotValid);
      // setIsPostalCodeNotValid(isPostalCodeNotValid);
    }
  };

  // Submit billing info
  const onSubmit = async (data) => {
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setShowLoader(false);

    const selectedCountry = billingCountries?.find(
      (c) => c?.id?.toString() === billingIndex,
    );

    setBilling({
      id: selectedCountry?.id || "",
      country_name: selectedCountry?.name || "",
      country_price: selectedCountry?.price || "",
      postalcode: data.postalcode,
      addressone: data.addressone,
      addresstwo: data.addresstwo,
      city: data.city,
      state: data.state,
      same_as_shipping: data.same_as_shipping, // ✅ Save this also
    });

    onComplete();
  };

  useEffect(() => {
    const subscription = watch((values) => {
      const selectedCountry =
        billingCountries?.find(
          (c) => c?.id?.toString() === values.billingCountry,
        ) || billingCountries?.find((c) => c?.id?.toString() === billingIndex);

      const updatedBilling = {
        id: selectedCountry?.id || "",
        country_name: selectedCountry?.name || "",
        country_price: selectedCountry?.price || "",
        postalcode: values.postalcode || "",
        addressone: values.addressone || "",
        addresstwo: values.addresstwo || "",
        city: values.city || "",
        state: values.state || "",
        same_as_shipping: false,
      };

      const prev = prevBillingRef.current;
      const hasChanged =
        JSON.stringify(prev) !== JSON.stringify(updatedBilling);

      if (hasChanged) {
        prevBillingRef.current = updatedBilling;
        setBilling(updatedBilling);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, billingCountries, billingIndex, setBilling]);

  if (sameAsShipping) {
    return null; // ✅ Do not render anything if same as shipping
  }

  return (
    <SectionWrapper>
      <SectionHeader
        stepNumber={<SlNote />}
        title="Billing Address"
        description=""
        isCompleted={isCompleted}
      >
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
                className={`reg-font absolute right-3 transform -translate-y-1/2 text-white bg-primary px-3 py-1 rounded cursor-pointer w-28 flex items-center justify-center ${
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
            required
            register={register}
            errors={errors}
          />
          <TextField
            label="State / County"
            name="state"
            register={register}
            errors={errors}
          />

          <NextButton label="Continue" disabled={!isValid} />
        </form>

        {showLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded">
            <PageLoader />
          </div>
        )}
      </SectionHeader>
    </SectionWrapper>
  );
}
