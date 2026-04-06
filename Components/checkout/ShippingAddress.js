import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import SectionWrapper from "./SectionWrapper";
import SectionHeader from "./SectionHeader";
import { FaSearch, FaShippingFast } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { Client } from "getaddress-api";
import MUISelectField from "@/Components/SelectField/SelectField";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import { useRouter } from "next/router";
import useShipmentCountries from "@/store/useShipmentCountriesStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";
import NextButton from "../NextButton/NextButton";

// const api = new Client("aYssNMkdXEGsdfGVZjiY0Q26381");

export default function ShippingAddress({
  isCompleted,
  onComplete,
  setIsShippingCheck,
  setIsBillingCheck,
  setCloseShipping,
}) {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

  const [shippingIndex, setShippingIndex] = useState("");

  const {
    shipping,
    setShipping,
    setBillingSameAsShipping,
    setBilling,
    checkShippingForAccordion,
  } = useShippingOrBillingStore();
  const { shipmentCountries } = useShipmentCountries();

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
      same_as_shipping: false,
      first_name: "",
      last_name: "",
    },
  });

  // ✅ Watch all values and save in store

  const router = useRouter();

  const sameAsShippingValue = watch("same_as_shipping");
  useEffect(() => {
    console.log(
      sameAsShippingValue,
      "sameAsShippingValue From ShippingAddress",
    );

    if (typeof setIsBillingCheck === "function") {
      setIsBillingCheck(!!sameAsShippingValue);
    }
  }, [sameAsShippingValue, setIsBillingCheck]);
  useEffect(() => {
    if (sameAsShippingValue) {
      const selectedCountry = shipmentCountries.find(
        (c) => c.id.toString() === shippingIndex,
      );

      setBilling({
        id: selectedCountry?.id || "",
        country_name: selectedCountry?.name || "",
        country_price: selectedCountry?.price || "",
        postalcode: shipping?.postalcode,
        addressone: shipping?.addressone,
        addresstwo: shipping?.addresstwo,
        first_name: shipping?.first_name,
        last_name: shipping?.last_name,
        city: shipping?.city,
        state: "",
        same_as_shipping: true,
      });
    }
  }, [sameAsShippingValue, shipping, shippingIndex, shipmentCountries]);

  useEffect(() => {
    setBillingSameAsShipping(!!sameAsShippingValue); // This ensures it is always a boolean
  }, [sameAsShippingValue, setBillingSameAsShipping]);

  // useEffect(() => {
  //   if (checkShippingForAccordion != null) {
  //     console.log("All required fields are filled.");
  //     setCloseShipping(true);
  //   } else {
  //     console.log("Not all required fields are filled.");
  //   }
  // }, [checkShippingForAccordion]);

  useEffect(() => {
    if (!shipping || !shipmentCountries?.length) return;

    setValue("postalcode", shipping.postalcode || "");
    setValue("addressone", shipping.addressone || "");
    setValue("addresstwo", shipping.addresstwo || "");
    if (shipping.first_name) {
      setValue("first_name", shipping.first_name);
    }
    if (shipping.last_name) {
      setValue("last_name", shipping.last_name);
    }
    setValue("city", shipping.city || "");

    // ✅ Find country by name
    const country = shipmentCountries.find(
      (c) => c.name === shipping.country_name,
    );
    if (country) {
      setValue("shippingCountry", country.id.toString(), {
        shouldValidate: true,
      });
      setShippingIndex(country.id.toString());

      // ✅ ONLY UPDATE if price or name is different → to avoid infinite loop
      if (
        shipping.country_price !== country.price ||
        shipping.country_name !== country.name
      ) {
        setShipping({
          ...shipping,
          country_name: country.name,
          country_price: country.price,
        });
      }
    }

    setValue("same_as_shipping", shipping.same_as_shipping ?? false);
  }, [shipping?.country_name, shipmentCountries]);
  const postal = watch("postalcode");

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

  const watchedFields = watch([
    "first_name",
    "last_name",
    "shippingCountry",
    "postalcode",
    "addressone",
    "city",
  ]);

  // Check if all required fields are filled
  useEffect(() => {
    const allFilled = watchedFields.every((field) => field && field !== "");

    setIsShippingCheck(allFilled);
    // If "same as shipping" is checked and all shipping fields are filled, set billing check to true
    if (typeof setIsBillingCheck === "function") {
      setIsBillingCheck(allFilled && !!sameAsShippingValue);
    }
  }, [watchedFields, setIsBillingCheck, sameAsShippingValue]);
  const onSubmit = async (data) => {
    setCloseShipping(true);
    setIsShippingCheck(true);
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setShowLoader(false);

    const selectedCountry = shipmentCountries.find(
      (c) => c.id.toString() === shippingIndex,
    );

    // ✅ Save shipping data
    const shippingData = {
      id: selectedCountry?.id || "",
      country_name: selectedCountry?.name || "",
      country_price: selectedCountry?.price || "",
      postalcode: data.postalcode,
      addressone: data.addressone,
      addresstwo: data.addresstwo,
      first_name: data.first_name,
      last_name: data.last_name,
      city: data.city,
      state: "",
      same_as_shipping: data.same_as_shipping,
    };
    setShipping(shippingData);

    // ✅ Conditionally copy shipping to billing
    if (data.same_as_shipping === true) {
      setBilling({ ...shippingData });
    }

    // ✅ Save this value to Zustand too
    setBillingSameAsShipping(data.same_as_shipping);

    // ✅ Always call onComplete
    onComplete();
  };

  useEffect(() => {
    const subscription = watch((values) => {
      const selectedCountry =
        shipmentCountries.find(
          (c) => c.id.toString() === values.shippingCountry,
        ) || shipmentCountries.find((c) => c.id.toString() === shippingIndex);

      setShipping({
        id: selectedCountry?.id || "",
        country_name: selectedCountry?.name || "",
        country_price: selectedCountry?.price || "",
        postalcode: values.postalcode || "",
        addressone: values.addressone || "",
        addresstwo: values.addresstwo || "",
        first_name: values.first_name || "",
        last_name: values.last_name || "",
        city: values.city || "",
        state: "",
        same_as_shipping: values.same_as_shipping ?? false,
      });
    });

    return () => subscription.unsubscribe();
  }, [watch, shipmentCountries, shippingIndex, setShipping]);

  return (
    <>
      <SectionWrapper>
        <SectionHeader
          stepNumber={<FaShippingFast />}
          title="Shipping Address"
          description=""
          isCompleted={isCompleted}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5">
            <TextField
              label="First Name"
              name="first_name"
              register={register}
              required
              errors={errors}
            />
            <TextField
              label="Last Name"
              name="last_name"
              register={register}
              required
              errors={errors}
            />

            <Controller
              name="shippingCountry"
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field }) => (
                <MUISelectField
                  label="Select Country"
                  name="shippingCountry"
                  value={field.value}
                  required
                  onChange={(e) => {
                    const id = e.target.value;
                    field.onChange(id); // ✅ set id to RHF
                    setShippingIndex(id); // ✅ set id to local state
                    // ✅ Find selected country
                    const selectedCountry = shipmentCountries.find(
                      (c) => c.id.toString() === id,
                    );

                    if (selectedCountry) {
                      // ✅ Update shipping immediately when user changes country
                      setShipping({
                        ...shipping,
                        id: selectedCountry.id,
                        country_name: selectedCountry.name,
                        country_price: selectedCountry.price, // ✅ Update price
                      });
                    }
                  }}
                  options={(shipmentCountries || []).map((addr) => ({
                    value: addr.id.toString(), // ✅ Use country id as value
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
              {postal && (
                <>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className={`absolute right-3 transform -translate-y-1/2 text-white bg-primary px-3 py-1 rounded cursor-pointer w-28 flex items-center justify-center ${
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
                      <span className="flex items-center reg-font">
                        <FaSearch className="inline-block me-2" />
                        Search
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>

            {!addressSearchLoading && addressOptions.length > 0 && (
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

            <Controller
              name="same_as_shipping"
              control={control}
              render={({ field }) => (
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => field.onChange(!field.value)}
                >
                  {field.value ? (
                    <MdCheckBox className="text-primary mt-1" size={18} />
                  ) : (
                    <MdCheckBoxOutlineBlank
                      className="text-[#4565BF]  mt-1"
                      size={18}
                    />
                  )}
                  <span className="text-gray-700 reg-font mt-1">
                    Make billing address same as shipping address
                  </span>
                </div>
              )}
            />

            <NextButton label="Continue" disabled={!isValid} />
          </form>

          {showLoader && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded ">
              <PageLoader />
            </div>
          )}
        </SectionHeader>
      </SectionWrapper>
    </>
  );
}
