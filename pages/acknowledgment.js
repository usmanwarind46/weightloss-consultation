import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import NextButton from "@/Components/NextButton/NextButton";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import StepsHeader from "@/layout/stepsHeader";

import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReorderButtonStore from "@/store/useReorderButton";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";

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
    router.push("/signup");
  };

  const renderYesNo = (fieldName, value) => {
    return (
      <div className="flex gap-4 mt-4 w-full">
        {["yes", "no"].map((option) => {
          const isSelected = value === option;
          return (
            <label
              key={option}
              className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-xl border-2 px-4 py-3.5 transition-all duration-150 select-none
                ${
                  isSelected
                    ? "border-[#4565BF] bg-[#4565BF]/[0.05]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <input
                type="radio"
                value={option}
                {...register(fieldName, { required: true })}
                className="hidden"
              />
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150
                  ${
                    isSelected
                      ? "border-[#4565BF] bg-[#4565BF]"
                      : "border-slate-300 bg-white"
                  }`}
              >
                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <span
                className={`inter-medium-font text-[14px] capitalize ${
                  isSelected ? "text-[#4565BF]" : "text-slate-700"
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
      <MetaLayout canonical={`${meta_url}acknowledgment/`} />

      <StepsHeader percentage={"0"} />
      <FormWrapper heading={"Patient Acknowledgment"} description={""}>
        <PageAnimationWrapper>
          <div className="bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Questions */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="inter-reg-font text-sm text-slate-700">
                    Are you purchasing this medication for yourself, of your own
                    free will and the medicine is for your personal use only?
                  </p>
                  {renderYesNo("personalUse", personalUse)}
                </div>

                <div className="space-y-2">
                  <p className="inter-reg-font text-sm text-slate-700">
                    Do you believe you have the ability to make healthcare
                    decisions for yourself?
                  </p>
                  {renderYesNo("decisionCapacity", decisionCapacity)}
                </div>

                {isNoSelected && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="inter-reg-font text-[13px] text-red-600">
                      Unfortunately, based on your answer, we are unable to
                      proceed with your consultation at this time.
                    </p>
                  </div>
                )}

                {showConsentBox && (
                  <div className="bg-white space-y-4 py-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("confirmConsent", { required: true })}
                        className="hidden"
                      />
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition-all duration-150
                          ${
                            confirmConsent
                              ? "border-[#4565BF] bg-[#4565BF]"
                              : "border-slate-300 bg-white"
                          }`}
                      >
                        {confirmConsent && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="inter-semibold-font text-sm text-slate-800">
                        Do you confirm that:
                      </span>
                    </label>

                    <div className="rounded-xl border border-[#4565BF]/[0.14] bg-[#f7f8fc] p-4 sm:p-5">
                      <ul className="inter-reg-font list-disc list-outside pl-5 text-[13.5px] leading-[1.8] text-slate-700 space-y-2">
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
                  </div>
                )}
              </div>

              <div className="mt-6">
                <NextButton
                  disabled={!isValid || isNoSelected}
                  label="I Confirm"
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
