import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Inter } from "next/font/google";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import BackButton from "@/Components/BackButton/BackButton";
import usePatientInfoStore from "@/store/patientInfoStore";
// import { Client } from "getaddress-api";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import MUISelectField from "@/Components/SelectField/SelectField";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

// const api = new Client("aYssNMkdXEGsdfGVZjiY0Q26381");
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function ResidentialAddress() {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [searching, setSearching] = useState(false);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

  const { patientInfo, setPatientInfo } = usePatientInfoStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      postalCode: "",
      address1: "",
      address2: "",
      city: "",
      country: "",
    },
  });

  const router = useRouter();
  // 👇 Watch individual address fieldss
  const address1 = watch("address1");
  const city = watch("city");
  const country = watch("country");

  // 👇 Enable Next only when required fields are filled
  const isNextEnabled =
    !!address1?.trim() && !!city?.trim() && !!country?.trim();

  const handleSearch = async () => {
    setAddressSearchLoading(true);

    const postal = watch("postalCode")?.trim();
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

      if (data?.result?.length) {
        setAddressOptions(data.result);
        setManual(true);
      } else {
        toast.error("No addresses found");
      }
    } catch (error) {
      console.error("Ideal Postcodes error:", error);
      toast.error("Address lookup failed");
    } finally {
      setAddressSearchLoading(false);
    }
  };

  useEffect(() => {
    if (patientInfo?.address) {
      setValue("postalCode", patientInfo.address.postalcode || "");
      setValue("address1", patientInfo.address.addressone || "");
      setValue("address2", patientInfo.address.addresstwo || "");
      setValue("city", patientInfo.address.city || "");
      setValue("country", patientInfo.address.country || "");

      if (
        patientInfo.address.addressone ||
        patientInfo.address.addresstwo ||
        patientInfo.address.city ||
        patientInfo.address.country
      ) {
        setManual(true);
      }
    }
  }, [patientInfo]);

  const onSubmit = async (data) => {
    const fullAddress = {
      postalcode: data.postalCode,
      addressone: data.address1,
      addresstwo: data.address2,
      city: data.city,
      state: "",
      country: data.country,
    };

    setPatientInfo({ ...patientInfo, address: fullAddress });
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/preferred-phone-number");
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}residential-address/`} />

      <StepsHeader percentage="40" />
      <FormWrapper
        heading="Mention Your Residential Address"
        description="Required for age verification purpose"
      >
        <PageAnimationWrapper>
          <div>
            <div
              className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="min-w-0">
                      <TextField
                        label="Post code"
                        name="postalCode"
                        placeholder="e.g. SW1A 1AA"
                        register={register}
                        required
                        errors={errors}
                        className="pr-[108px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={addressSearchLoading}
                      className="inter-medium-font absolute right-0 top-[24px] flex min-h-[38px] min-w-[96px] cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[#4565BF] px-4 py-2 text-[12px] text-white transition-colors hover:bg-[#3550a0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {addressSearchLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                          className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                        />
                      ) : (
                        <>
                          <FaSearch size={12} />
                          <span>Search</span>
                        </>
                      )}
                    </button>
                  </div>

                  {addressOptions.length > 0 && (
                    <MUISelectField
                      label="Select Your Address"
                      name="addressSelect"
                      value={selectedIndex}
                      required
                      onChange={(e) => {
                        const idx = e.target.value;
                        const selected = addressOptions[idx];
                        setSelectedIndex(idx);

                        // ✅ Set values and revalidate to clear any existing errors
                        setValue("address1", selected.line_1 || "", {
                          shouldValidate: true,
                        });
                        setValue("address2", selected.line_2 || "", {
                          shouldValidate: true,
                        }); // optional but still validate
                        setValue("city", selected.post_town || "", {
                          shouldValidate: true,
                        });
                        setValue("country", selected.country || "", {
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
                      error={errors?.addressSelect?.message}
                    />
                  )}

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setManual(!manual)}
                      className="inter-medium-font cursor-pointer text-[13px] text-[#4565BF] transition-colors hover:text-[#3550a0]"
                    >
                      {manual
                        ? "Hide manual address entry"
                        : "Enter your address manually"}
                    </button>
                  </div>

                  {manual && (
                    <div className="space-y-4">
                      <TextField
                        label="Address"
                        name="address1"
                        placeholder="e.g. 10 Downing Street"
                        register={register}
                        required
                        errors={errors}
                      />
                      <TextField
                        label="Address 2"
                        name="address2"
                        placeholder="Apartment, suite or unit (optional)"
                        register={register}
                        errors={errors}
                      />
                      <TextField
                        label="Town / City"
                        name="city"
                        placeholder="e.g. London"
                        register={register}
                        required
                        errors={errors}
                      />
                      <TextField
                        label="Country"
                        name="country"
                        placeholder="e.g. United Kingdom"
                        register={register}
                        required
                        errors={errors}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-6">
                  <NextButton label="Next" disabled={!isNextEnabled} />
                  <BackButton
                    label="Back"
                    onClick={() => router.push("/personal-details")}
                  />
                </div>
              </form>

              {showLoader && (
                <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                  <PageLoader />
                </div>
              )}
            </div>
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
