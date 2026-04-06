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
      <div className="flex gap-4 mt-4 w-full">
        {["yes", "no"].map((option) => {
          const isSelected = value === option;
          return (
            <label
              key={option}
              className={`reg-font flex items-center px-4 py-4 rounded-md border justify-start cursor-pointer transition-all duration-200 flex-1
                ${isSelected
                  ? option === "yes"
                    ? "bg-violet-100 border-[#4565BF] text-primary"
                    : "bg-violet-100 border-[#4565BF] text-primary"
                  : "bg-white border-gray-300 hover:border-gray-400 text-gray-800"
                }`}
            >
              <input type="radio" value={option} {...register(fieldName, { required: true })} className="hidden" />
              <div
                className={`w-5 h-5 mr-2 rounded-md border flex items-center justify-start
                  ${isSelected
                    ? option === "yes"
                      ? "bg-primary border-[#4565BF] text-white"
                      : "bg-primary border-[#4565BF] text-white"
                    : "border-gray-400 bg-white"
                  }`}
              >
                {isSelected && <FiCheck className="text-md" />}
              </div>
              <span className="text-black bold-font paragraph capitalize">{option}</span>
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
                    <p className="text-red-600 text-sm mt-2">
                      This treatment is not suitable if you are pregnant, trying to get pregnant or breastfeeding. We recommend you speak to your GP
                      in person.
                    </p>
                  )}
                </div>
              </div>

              <div className="my-5 flex justify-between items-center">
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
