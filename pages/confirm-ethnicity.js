import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";
import usePatientInfoStore from "@/store/patientInfoStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
// import useReturning from "@/store/useReturningPatient";

const options = ["Yes", "No", "Prefer not to say"];

export default function ConfirmEthnicity() {
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();

  const { patientInfo, setPatientInfo } = usePatientInfoStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      ethnicity: "",
    },
  });

  const selectedOption = watch("ethnicity");

  useEffect(() => {
    const fixedEthnicity = patientInfo?.ethnicity
      ? patientInfo?.ethnicity.charAt(0).toUpperCase() +
        patientInfo?.ethnicity.slice(1).toLowerCase()
      : "";

    setValue("ethnicity", fixedEthnicity);

    if (patientInfo?.ethnicity) {
      setValue("ethnicity", fixedEthnicity);
    }

    if (patientInfo?.ethnicity) {
      trigger(["ethnicity"]);
    }
  }, [patientInfo, setValue, patientInfo?.ethnicity]);

  const onSubmit = async (data) => {
    console.log("Form Data:", data);

    setPatientInfo({
      ...patientInfo, // 🧠 keep old data
      ethnicity: data?.ethnicity,
    });
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/calculate-bmi");
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}confirm-ethnicity/`} />
      <StepsHeader percentage={"55"} />
      <FormWrapper
        heading={"Confirm Ethnicity"}
        description={
          "People of certain ethnicities may be suitable for treatment at a lower BMI than others, if appropriate."
        }
      >
        <PageAnimationWrapper>
          <p className="inter-medium-font my-3 text-[14px] text-slate-800">
            Does one of the following options describe your ethnic group or
            background?
          </p>
          <div className="">
            <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-[#4565BF]/10 bg-[#4565BF]/[0.035] p-4 sm:grid-cols-2 sm:p-5">
              {[
                "South Asian",
                "Chinese",
                "Other Asian",
                "Middle Eastern",
                "Black African",
                "African-Caribbean",
              ].map((ethnicity, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4565BF]/80" />
                  <p className="inter-medium-font text-[13.5px] text-slate-700">{ethnicity}</p>
                </div>
              ))}
            </div>
            <div
              className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    return (
                      <label
                        key={option}
                        className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-150 select-none ${index === 2 ? "col-span-2" : ""}
                          ${isSelected ? "border-[#4565BF] bg-[#4565BF]/[0.08] shadow-[0_3px_12px_rgba(69,101,191,0.08)]" : "border-slate-200 bg-white hover:border-[#4565BF]/25 hover:bg-[#4565BF]/[0.02]"}`}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150
                            ${isSelected ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <input
                          type="radio"
                          value={option}
                          {...register("ethnicity", { required: true })}
                          className="hidden"
                        />
                        <span className={`inter-medium-font text-[14px] ${isSelected ? "text-[#4565BF]" : "text-slate-700"}`}>
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <NextButton disabled={!isValid} label="Next" />
                  <BackButton
                    label="Back"
                    onClick={() => router.push("/preferred-phone-number")}
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
