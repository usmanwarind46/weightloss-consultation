import axios from "axios";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useState, useEffect } from "react";
import PageLoader from "@/Components/PageLoader/PageLoader";
import BackButton from "@/Components/BackButton/BackButton";
import useGpDetailsStore from "@/store/gpDetailStore";
import MUISelectField from "@/Components/SelectField/SelectField";
import { motion } from "framer-motion";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

export default function GpDetail() {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");

  const { gpdetails, setGpDetails } = useGpDetailsStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      gpDetails: "",
      gepTreatMent: "",
      email: "",
      postalCode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      gpName: "",
    },
  });

  const gpDetails = watch("gpDetails");
  const gepTreatMent = watch("gepTreatMent");
  const postalCode = watch("postalCode");
  const gpName = watch("gpName");
  const addressLine1 = watch("addressLine1");
  const city = watch("city");

  const isManualAddressRequired =
    gpDetails === "yes" && gepTreatMent === "yes" && manual;
  const isNextEnabled = (() => {
    if (gpDetails === "no") return true; // ✅ Allow next if GP not registered
    if (gpDetails === "yes" && gepTreatMent === "no") return true; // ✅ Allow next if patient will inform GP

    if (gpDetails === "yes" && gepTreatMent === "yes") {
      return !!gpName?.trim() && !!addressLine1?.trim() && !!city?.trim();
    }

    return false; // fallback: disable
  })();

  useEffect(() => {
    if (gpdetails) {
      setValue("gpDetails", gpdetails.gpConsent || "");
      setValue("gepTreatMent", gpdetails.consentDetail || "");
      setValue("email", gpdetails.email || "");
      setValue("postalCode", gpdetails.zipcode || "");
      setValue("addressLine1", gpdetails.addressLine1 || "");
      setValue("addressLine2", gpdetails.addressLine2 || "");
      setValue("city", gpdetails.city || "");
      setValue("gpName", gpdetails.gpName || "");

      if (
        gpdetails.zipcode ||
        gpdetails.addressLine1 ||
        gpdetails.addressLine2 ||
        gpdetails.city ||
        gpdetails.gpName
      ) {
        setManual(true);
      }
    }
    trigger();
  }, [gpdetails, trigger, setValue]);

  useEffect(() => {
    if (gpDetails === "no") {
      setValue("gepTreatMent", "");
      setValue("email", "");
      setValue("postalCode", "");
      setValue("gpName", "");
      setValue("addressLine1", "");
      setValue("addressLine2", "");
      setValue("city", "");
      setManual(false); // Hide manual if open
      setSearchResults([]); // Clear search results
    }
  }, [gpDetails, setValue]);

  // 👉 Clear when user selects "No – I will inform my GP prior to starting treatment"
  useEffect(() => {
    if (gepTreatMent === "no") {
      setValue("email", "");
      setValue("postalCode", "");
      setValue("gpName", "");
      setValue("addressLine1", "");
      setValue("addressLine2", "");
      setValue("city", "");
      setManual(false);
      setSearchResults([]);
    }
  }, [gepTreatMent, setValue]);

  // API call
  const handleAddressFetch = async () => {
    if (!postalCode) return;

    const apiKey = "7a46f2abc01b47b58e586ec1cda38c68";
    const apiUrl = `https://api.nhs.uk/service-search/search-postcode-or-place?api-version=1&search=${postalCode}`;

    setSearchLoading(true);
    try {
      const response = await axios.post(
        apiUrl,
        {
          filter:
            "(OrganisationTypeID eq 'GPB') or (OrganisationTypeID eq 'GPP')",
          top: 25,
          skip: 0,
          count: true,
        },
        {
          headers: {
            "subscription-key": apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data) {
        setSearchResults(response.data.value);
      }
    } catch (err) {
      console.error("Postal search failed", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectAddress = (address) => {
    console.log(address, "Select GP Address");

    setValue("gpName", address.OrganisationName || "");
    setValue("addressLine1", address.Address1 || "");
    setValue("addressLine2", address.Address2 || "");
    setValue("city", address.City || "");
    setManual(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      gpConsent: data.gpDetails,
      consentDetail: data.gepTreatMent,
      email: data.email || "",
      zipcode: data.postalCode || "",
      gpName: data.gpName || "",
      addressLine1: data.addressLine1 || "",
      addressLine2: data.addressLine2 || "",
      city: data.city || "",
      state: "",
    };

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    setGpDetails(payload);
    router.push("/confirmation-summary");
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}gp-details/`} />

      <StepsHeader percentage={"90"} />
      <FormWrapper heading={"GP Details"} description="">
        <PageAnimationWrapper>
          <div
            className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <h1 className="inter-medium-font text-gray-500">
                Are you registered with a GP in the UK?
              </h1>
              <div className="flex mt-4 gap-2">
                {["yes", "no"].map((option) => {
                  const isSelected = gpDetails === option;
                  return (
                    <label
                      key={option}
                      className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border-2 px-4 py-3 transition-all duration-150 select-none
                        ${isSelected ? "border-[#4565BF] bg-[#4565BF]/[0.05]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <input
                        type="radio"
                        value={option}
                        {...register("gpDetails", { required: true })}
                        className="hidden"
                      />
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150
                          ${isSelected ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}
                      >
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={`inter-medium-font text-[14px] capitalize ${isSelected ? "text-[#4565BF]" : "text-slate-700"}`}
                      >
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* This was missing (✅ FIXED now) */}
              {gpDetails === "no" && (
                <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3.5 mt-6">
                  <p className="inter-reg-font text-[13px] text-amber-800">
                    You should inform your doctor of any medication you take.
                    Contact us if you want us to email a letter for your doctor.
                  </p>
                </div>
              )}

              {gpDetails === "yes" && (
                <>
                  <p className="inter-reg-font text-gray-500 mt-6 mb-3">
                    If you are registered with a GP in the UK then we can inform
                    them on your behalf.
                  </p>
                  <p className="inter-reg-font text-gray-500 mt-0">
                    Do you consent for us to inform your GP about the treatment?
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row sm:gap-4">
                    {[
                      { value: "yes", label: "Yes – Please inform my GP" },
                      {
                        value: "no",
                        label:
                          "No – I will inform my GP prior to starting treatment",
                      },
                    ].map((option) => {
                      const isSelected = gepTreatMent === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border-2 px-4 sm:my-0 my-2 py-3 transition-all duration-150 select-none
                            ${isSelected ? "border-[#4565BF] bg-[#4565BF]/[0.05]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            {...register("gepTreatMent", { required: true })}
                            className="hidden"
                          />
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150
                              ${isSelected ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}
                          >
                            {isSelected && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </div>

                          <span
                            className={`inter-medium-font text-[14px] ${isSelected ? "text-[#4565BF]" : "text-slate-700"}`}
                          >
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}

              {gpDetails === "yes" && gepTreatMent === "yes" && (
                <>
                  <TextField
                    label="GP Email"
                    name="email"
                    type="email"
                    register={register}
                    errors={errors}
                  />

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <TextField
                        label="Post code"
                        name="postalCode"
                        register={register}
                        required
                        errors={errors}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddressFetch}
                      disabled={searchLoading}
                      className="inter-medium-font mb-4 flex h-[42px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#4565BF] px-4 text-[13px] text-white transition-colors duration-150 hover:bg-[#3550a0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {searchLoading ? (
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
                          Search
                        </>
                      )}
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-4">
                      <MUISelectField
                        label="Select GP Address"
                        name="gpAddressSelect"
                        required
                        value={selectedIndex}
                        onChange={(e) => {
                          const idx = e.target.value;
                          const selected = searchResults[idx];
                          setSelectedIndex(idx);

                          // Fill form with selected address
                          setValue("gpName", selected.OrganisationName || "", {
                            shouldValidate: true,
                          });
                          setValue("addressLine1", selected.Address1 || "", {
                            shouldValidate: true,
                          });
                          setValue("addressLine2", selected.Address2 || "", {
                            shouldValidate: true,
                          });
                          setValue("city", selected.City || "", {
                            shouldValidate: true,
                          });

                          setManual(true); // force manual section open so user sees populated fields
                        }}
                        options={searchResults.map((item, idx) => ({
                          value: idx,
                          label: `${item.OrganisationName} - ${item.Address1}, ${item.City}`,
                        }))}
                      />
                    </div>
                  )}

                  <div className="text-sm  text-center sm:text-right mt-4">
                    <button
                      type="button"
                      onClick={() => setManual(!manual)}
                      className="inter-medium-font cursor-pointer text-[#4565BF] underline transition-colors duration-150 hover:text-[#3550a0]"
                    >
                      {manual
                        ? "Hide manual address entry"
                        : "Enter your address manually"}
                    </button>
                  </div>

                  {manual && (
                    <div className="space-y-4 mt-4">
                      <TextField
                        label="GP Name"
                        name="gpName"
                        register={register}
                        required
                        errors={errors}
                      />
                      <TextField
                        label="Address"
                        name="addressLine1"
                        register={register}
                        required
                        errors={errors}
                      />
                      <TextField
                        label="Address 2"
                        name="addressLine2"
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
                    </div>
                  )}
                </>
              )}

              <div className="space-y-3 mt-6">
                <NextButton
                  label="Next"
                  disabled={!isNextEnabled}
                />
                <BackButton
                  label="Back"
                  onClick={() => router.push("/patient-consent")}
                />
              </div>
            </form>

            {showLoader && (
              <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                <PageLoader />
              </div>
            )}
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
