import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FiCheck } from "react-icons/fi";

import NextButton from "@/Components/NextButton/NextButton";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import StepsHeader from "@/layout/stepsHeader";

// ✅ Initialize Inter font here
import { Inter } from "next/font/google";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReorderButtonStore from "@/store/useReorderButton";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";
import { BASE_PATH } from "@/library/basePath";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function Acknowledgment() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const { setIsFromReorder } = useReorderButtonStore();
  const { setReorderBackProcess } = useReorderBackProcessStore();

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

  useEffect(() => {
    setReorderBackProcess(false);
  }, []);

  const personalUse = watch("personalUse");
  const decisionCapacity = watch("decisionCapacity");
  const confirmConsent = watch("confirmConsent");

  const isNoSelected = personalUse === "no" || decisionCapacity === "no";
  const showConsentBox = personalUse === "yes" && decisionCapacity === "yes";

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setShowLoader(true);
    setIsFromReorder(false);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push(`${BASE_PATH}/signup`);
  };

  const renderYesNo = (fieldName, value) => {
    return (
      <div className="flex gap-4 mt-4 w-full">
        {["yes", "no"].map((option) => {
          const isSelected = value === option;
          return (
            <label
              key={option}
              className={`reg-font flex items-center px-4 py-4 rounded-md border justify-start cursor-pointer transition-all duration-200 flex-1
                ${
                  isSelected
                    ? option === "yes"
                      ? "bg-violet-100 border-[#4565BF] text-primary"
                      : "bg-red-100 border-red-600 text-red-700"
                    : "bg-white border-gray-300 hover:border-gray-400 text-gray-800"
                }`}
            >
              <input
                type="radio"
                value={option}
                {...register(fieldName, { required: true })}
                className="hidden"
              />
              <div
                className={`w-5 h-5 mr-2 rounded-md border flex items-center justify-start
                  ${
                    isSelected
                      ? option === "yes"
                        ? "bg-primary border-[#4565BF] text-white"
                        : "bg-red-600 border-red-600 text-white"
                      : "border-gray-400 bg-white"
                  }`}
              >
                {isSelected && <FiCheck className="text-md" />}
              </div>
              <span className="text-md bold-font paragraph capitalize">
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
      <MetaLayout canonical={`${meta_url}acknowledgment/`} />

      <StepsHeader percentage={"0"} />
      <FormWrapper heading={"Patient Acknowledgment"} description={""}>
        <PageAnimationWrapper>
          <div className="bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Questions */}
              <div className="space-y-6">
                <div className="space-y-2">
                  {/* className="block text-sm reg-font text-black mb-1" */}
                  <p className="text-sm reg-font  paragraph">
                    Are you purchasing this medication for yourself, of your own
                    free will and the medicine is for your personal use only?
                  </p>
                  {renderYesNo("personalUse", personalUse)}
                </div>

                <div className="space-y-2">
                  <p className="text-sm reg-font paragraph">
                    Do you believe you have the ability to make healthcare
                    decisions for yourself?
                  </p>
                  {renderYesNo("decisionCapacity", decisionCapacity)}
                </div>

                {showConsentBox && (
                  <div className="bg-white space-y-4 py-4 max-h-[200px] overflow-auto">
                    <label className="flex items-center gap-3 text-sm bold-font text-gray-800 cursor-pointer paragraph">
                      <input
                        type="checkbox"
                        {...register("confirmConsent", { required: true })}
                        className="hidden"
                      />
                      <div
                        className={`w-5 h-5 rounded-sm flex items-center justify-center border transition-all duration-200
                          ${
                            confirmConsent
                              ? "bg-primary border-[#4565BF] text-white"
                              : "bg-white border-gray-400"
                          }`}
                      >
                        {confirmConsent && <FiCheck className="w-3 h-3" />}
                      </div>
                      Do you confirm that:
                    </label>

                    <ul className="list-disc list-outside pl-5 text-sm text-gray-700 space-y-2 reg-font paragraph">
                      <li>
                        You consent for your medical information to be assessed
                        by the clinical team at Online Weight Loss Clinic and
                        its pharmacy and to be prescribed medication.
                      </li>
                      <li>
                        You consent to an age and ID check when placing your
                        first order.
                      </li>
                      <li>
                        You will answer all questions honestly and accurately,
                        and understand that it is an offence to provide false
                        information.
                      </li>
                      <li>
                        You have capacity to understand all about the condition
                        and medication information we have provided and that you
                        give fully informed consent to the treatment option
                        provided.
                      </li>
                      <li>
                        You understand that the treatment or medical advice
                        provided is based on the information you have provided.
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="my-5 flex justify-end">
                <NextButton
                  disabled={!isValid || isNoSelected}
                  label="I Confirm"
                  props={"w-full"}
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
