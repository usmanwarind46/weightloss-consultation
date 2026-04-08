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
      <div className="flex gap-4 mt-4 flex-wrap sm:flex-nowrap">
        {["yes", "no"].map((option) => {
          const isSelected = value === option;
          return (
            <label
              key={option}
              className={`flex items-center px-4 py-2 rounded-md border w-fit min-w-[100px] justify-center cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? option === "yes"
                      ? "bg-violet-100 border-[#4565BF] text-primary"
                      : "bg-red-100 border-red-600 text-red-700"
                    : "bg-white border-gray-300 hover:border-gray-400 text-gray-800"
                }`}
            >
              <input type="radio" value={option} {...register(fieldName, { required: true })} className="hidden" />
              <div
                className={`w-5 h-5 mr-2 rounded-md border flex items-center justify-center
                  ${
                    isSelected
                      ? option === "yes"
                        ? "bg-primary border-[#4565BF] text-white"
                        : "bg-red-600 border-red-600 text-white"
                      : "border-gray-400 bg-white"
                  }`}
              >
                {isSelected && <FiCheck className="text-xs" />}
              </div>
              <span className="text-sm reg-font capitalize">{option}</span>
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
              <div className="space-y-6 max-h-[400px] overflow-auto">
                <div className="space-y-2">
                  <p className="text-sm reg-font text-gray-800">
                    Are you purchasing this medication for yourself, of your own free will and the medicine is for your personal use only?
                  </p>
                  {renderYesNo("personalUse", personalUse)}
                </div>

                <div className="space-y-2">
                  <p className="text-sm reg-font text-gray-800">Do you believe you have the ability to make healthcare decisions for yourself?</p>
                  {renderYesNo("decisionCapacity", decisionCapacity)}
                </div>

                {showConsentBox && (
                  <div className="bg-white space-y-4 py-4">
                    <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 cursor-pointer">
                      <input type="checkbox" {...register("confirmConsent", { required: true })} className="hidden" />
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-200
                          ${confirmConsent ? "bg-primary border-[#4565BF] text-white" : "bg-white border-gray-400"}`}
                      >
                        {confirmConsent && <FiCheck className="w-3 h-3" />}
                      </div>
                      Do you confirm that:
                    </label>

                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
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
