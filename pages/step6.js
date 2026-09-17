import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FiCheck } from "react-icons/fi";

import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import StepsHeader from "@/layout/stepsHeader";

// ✅ Initialize Inter font here
import { Inter } from "next/font/google";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const Step6 = () => {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      personalUse: "",
      decisionCapacity: "",
      confirmConsent: false,
    },
  });

  const personalUse = watch("personalUse");
  const decisionCapacity = watch("decisionCapacity");
  const confirmConsent = watch("confirmConsent");

  const isNoSelected = personalUse === "no" || decisionCapacity === "no";
  const showConsentBox = personalUse === "yes" && decisionCapacity === "yes";

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/step7");
  };

  const renderYesNo = (fieldName, value) => {
    return (
      <div className="mt-4 flex flex-wrap gap-3 sm:flex-nowrap">
        {["yes", "no"].map((option) => {
          const isSelected = value === option;
          return (
            <label
              key={option}
              className={`flex min-w-[110px] cursor-pointer items-center gap-2.5 rounded-xl border-2 px-4 py-3 transition-all duration-150 select-none
                ${
                  isSelected
                    ? option === "yes"
                      ? "border-[#4565BF] bg-[#4565BF]/[0.05]"
                      : "border-red-400 bg-red-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <input type="radio" value={option} {...register(fieldName, { required: true })} className="hidden" />
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150
                  ${
                    isSelected
                      ? option === "yes"
                        ? "border-[#4565BF] bg-[#4565BF]"
                        : "border-red-500 bg-red-500"
                      : "border-slate-300 bg-white"
                  }`}
              >
                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <span
                className={`inter-medium-font text-[14px] capitalize ${
                  isSelected ? (option === "yes" ? "text-[#4565BF]" : "text-red-700") : "text-slate-700"
                }`}
              >
                {option}
              </span>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper heading={"Patient Acknowledgment"} description={""} percentage={"60"}>
        <PageAnimationWrapper>
          <div className="bg-white px-6 sm:p-7 mt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Questions */}
              <div className="max-h-[400px] space-y-6 overflow-auto">
                <div className="space-y-2">
                  <p className="inter-medium-font text-[14px] text-slate-800">
                    Are you purchasing this medication for yourself, of your own free will and the medicine is for your personal use only?
                  </p>
                  {renderYesNo("personalUse", personalUse)}
                </div>

                <div className="space-y-2">
                  <p className="inter-medium-font text-[14px] text-slate-800">Do you believe you have the ability to make healthcare decisions for yourself?</p>
                  {renderYesNo("decisionCapacity", decisionCapacity)}
                </div>

                {showConsentBox && (
                  <div className="rounded-xl border border-slate-100 bg-[#FBFBFD] p-4 sm:p-5">
                    <label className="flex cursor-pointer items-center gap-3 select-none">
                      <input type="checkbox" {...register("confirmConsent", { required: true })} className="hidden" />
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150
                          ${confirmConsent ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}
                      >
                        {confirmConsent && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="inter-semibold-font text-[14px] text-slate-800">Do you confirm that:</span>
                    </label>

                    <ul className="inter-reg-font mt-4 list-disc list-inside space-y-2 text-[13px] text-slate-600">
                      <li>
                        You consent for your medical information to be assessed by the clinical team at Online Weight Loss Clinic and its pharmacy
                        and to be prescribed medication.
                      </li>
                      <li>You consent to an age and ID check when placing your first order.</li>
                      <li>
                        You will answer all questions honestly and accurately, and understand that it is an offence to provide false information.
                      </li>
                      <li>
                        You have capacity to understand all about the condition and medication information we have provided and that you give fully
                        informed consent to the treatment option provided.
                      </li>
                      <li>You understand that the treatment or medical advice provided is based on the information you have provided.</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="my-5">
                <NextButton disabled={!isValid || isNoSelected} label="I Confirm" />
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
};

export default Step6;
