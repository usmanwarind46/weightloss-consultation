import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Inter } from "next/font/google";
import { FaSearch } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { Client } from "getaddress-api";
import NextButton from "@/Components/NextButton/NextButton";
import MUISelectField from "@/Components/SelectField/SelectField";
import { useRouter } from "next/router";
import useShipmentCountries from "@/store/useShipmentCountriesStore";
import { RiRadioButtonFill } from "react-icons/ri";
import { IoRadioButtonOff } from "react-icons/io5";
import { motion } from "framer-motion";
import SectionWrapper from "@/Components/checkout/SectionWrapper";
import { useMutation } from "@tanstack/react-query";
import { getProfileData, sendProfileData } from "@/api/myProfileApi";
import toast from "react-hot-toast";

// const api = new Client("aYssNMkdXEGsdfGVZjiY0Q26381");

export default function Shipping({ shipmentCountries }) {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [shipping, setShipping] = useState("");
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

  const [shippingIndex, setShippingIndex] = useState("");
  const [countryChangedManually, setCountryChangedManually] = useState(false);

  console.log(shipmentCountries, "shipmentCountries");
  console.log(shipping, "shipping");

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

  // ✅ Watch all values and save in store

  const router = useRouter();

  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: (res) => {
      const shippingData = res?.data?.profile?.shipping;
      if (!shippingData) return;

      // Prefill form values
      setValue("postalcode", shippingData.postalcode || "");
      setValue("addressone", shippingData.addressone || "");
      setValue("addresstwo", shippingData.addresstwo || "");
      setValue("city", shippingData.city || "");

      // Match country by name from static list
      const country = shipmentCountries?.find(
        (c) => c.name === shippingData.country,
      );

      if (country) {
        setValue("shippingCountry", country.id.toString(), {
          shouldValidate: true,
        });
        setShippingIndex(country.id.toString()); // OK to track here
      }
    },
  });

  useEffect(() => {
    if (shipmentCountries?.length) {
      getProfileDataMutation.mutate();
    }
  }, [shipmentCountries]);

  useEffect(() => {
    if (countryChangedManually) {
      // Clear all address fields
      setValue("postalcode", "");
      setValue("addressone", "");
      setValue("addresstwo", "");
      setValue("city", "");
    }
  }, [shippingIndex]);

  const handleSearch = async () => {
    setAddressSearchLoading(true);

    const postal = watch("postalcode");
    if (!postal) {
      alert("Please enter a postcode.");
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
      } else {
        setAddressSearchLoading(false);
        toast.error("Invalid Post code");
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong while fetching addresses.");
      setAddressSearchLoading(false);
    }
  };

  // Send User Data Mutation
  const sendProfileDataMutation = useMutation(sendProfileData, {
    onSuccess: (data) => {
      if (data) {
        setShowLoader(false);
        toast.success("Shipping updated successfully!");
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    },
  });

  // On Submit Data
  const onSubmit = async (data) => {
    setShowLoader(true);

    const selectedCountry = shipmentCountries.find(
      (c) => c.id.toString() === shippingIndex,
    );

    // ✅ Save shipping info
    const formData = {
      shipping: true,
      country_name: selectedCountry?.name || "",
      postalcode: data.postalcode,
      addressone: data.addressone,
      addresstwo: data.addresstwo,
      city: data.city,
      state: "",
    };

    sendProfileDataMutation.mutate(formData);
    // console.log(formData, "formData");
  };

  return (
    <>
      <SectionWrapper>
        <header className="pb-4">
          <h1 className="headingDashBoard bold-font md:text-3xl text-lg mb-2  text-black">
            Shipping Information
          </h1>
          <p className="reg-font paragraph  text-left text-sm xl:w-3/4 mt-2">
            Update your shipping details — changes will apply to future orders
            only.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5">
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
                  field.onChange(id);
                  setShippingIndex(id);

                  // ✅ Clear fields ONLY when user changes country manually
                  setValue("postalcode", "");
                  setValue("addressone", "");
                  setValue("addresstwo", "");
                  setValue("city", "");

                  const selectedCountry = shipmentCountries.find(
                    (c) => c.id.toString() === id,
                  );
                  if (selectedCountry) {
                    setShipping({
                      id: selectedCountry.id,
                      country_name: selectedCountry.name,
                      country_price: selectedCountry.price,
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
                <span className="flex items-center reg-font">
                  <FaSearch className="inline-block me-2" />
                  Search
                </span>
              )}
            </button>
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
          <div className="max-w-24">
            <NextButton label="Continue" disabled={!isValid} />
          </div>
        </form>

        {showLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded ">
            <PageLoader />
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
