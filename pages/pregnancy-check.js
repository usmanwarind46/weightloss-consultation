import React, { useEffect, useState } from "react";
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
import usePatientInfoStore from "@/store/patientInfoStore";
import BackButton from "@/Components/BackButton/BackButton";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function PregnancyCheck() {
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();
  const { patientInfo, setPatientInfo } = usePatientInfoStore();

  console.log(patientInfo, "patientInfo");

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
      pregnancy: "",
    },
  });

  const pregnancy = watch("pregnancy");

  useEffect(() => {
    setValue("pregnancy", patientInfo?.pregnancy);

    if (patientInfo?.pregnancy) {
      trigger(["pregnancy"]);
    }
  }, [patientInfo?.pregnancy, trigger]);

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setPatientInfo({
      ...patientInfo, // 🧠 keep old data
      pregnancy: data.pregnancy,
    });
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/residential-address");
  };

  const renderYesNo = (fieldName, value) => {
    return (
      <div className="mt-4 flex w-full gap-4">
        {["yes", "no"].map((option) => {
          const isSelected = value === option;
          return (
            <label
              key={option}
              className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border-2 px-4 py-3.5 transition-all duration-150 select-none
                ${isSelected ? "border-[#4565BF] bg-[#4565BF]/[0.05]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <input type="radio" value={option} {...register(fieldName, { required: true })} className="hidden" />
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150
                  ${isSelected ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}
              >
                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <span className={`inter-medium-font text-[14px] capitalize ${isSelected ? "text-[#4565BF]" : "text-slate-700"}`}>
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
      <MetaLayout canonical={`${meta_url}pregnancy-check/`} />

      <StepsHeader />
      <FormWrapper
        heading={"Are you pregnant, breastfeeding, or trying to conceive?"}
        description={
          "Please note that our treatment programme is not suitable for use while breastfeeding, pregnant, or currently trying to conceive."
        }
        percentage={"30"}
      >
        <PageAnimationWrapper>
          <div className="bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Questions */}
              <div className="space-y-6">
                <div className="space-y-2">
                  {/* className="block text-sm reg-font text-black mb-1" */}
                  {renderYesNo("pregnancy", pregnancy)}
                  {pregnancy === "yes" && (
                    <div className="mt-3 rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-3.5">
                      <p className="inter-reg-font text-[13px] text-red-700">
                        This treatment is not suitable if you are pregnant, trying to get pregnant or breastfeeding. We recommend you speak to your GP
                        in person.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="my-5 flex flex-col gap-3">
                <NextButton disabled={!isValid || pregnancy === "yes"} label="Next" />
                <BackButton label="Back" onClick={() => router.back()} />
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
