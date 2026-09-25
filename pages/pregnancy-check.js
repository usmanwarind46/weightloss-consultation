import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import BackButton from "@/Components/BackButton/BackButton";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import usePatientInfoStore from "@/store/patientInfoStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

export default function PregnancyCheck() {
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
      pregnancy: "",
    },
  });

  const pregnancy = watch("pregnancy");

  useEffect(() => {
    if (patientInfo?.pregnancy) {
      setValue("pregnancy", patientInfo.pregnancy);
      trigger(["pregnancy"]);
    }
  }, [patientInfo?.pregnancy]);

  // ✅ Select ke change pe hi state update — Next ka intezaar nahi.
  // Warna user URL paste karke aage ja sakta hai bina answer kiye.
  const handlePregnancyChange = (value) => {
    setPatientInfo({
      ...patientInfo, // 🧠 keep old data
      pregnancy: value,
    });
  };

  const onSubmit = async () => {
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/calculate-bmi");
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}pregnancy-check`} />
      <StepsHeader />

      <FormWrapper
        heading={"Before you continue"}
        description={
          "We just need to confirm one thing before we can process your reorder."
        }
        percentage={"30"}
      >
        <PageAnimationWrapper>
          <div>
            <div
              className={`relative ${
                showLoader ? "pointer-events-none cursor-not-allowed" : ""
              }`}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="rounded-xl border border-slate-100 bg-[#FBFBFD] p-5 space-y-4">
                  <p className="inter-semibold-font text-[15px] text-slate-900">
                    Are you pregnant, breastfeeding, or trying to conceive?
                  </p>
                  <p className="inter-reg-font text-[13.5px] text-slate-600">
                    Our treatment programme is not suitable while breastfeeding,
                    pregnant, or trying to conceive.
                  </p>

                  <div className="flex gap-4 mt-2 w-full">
                    {["yes", "no"].map((option) => {
                      const isSelected = pregnancy === option;
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
                            {...register("pregnancy", {
                              required: true,
                              onChange: (e) =>
                                handlePregnancyChange(e.target.value),
                            })}
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
                            {isSelected && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
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

                  {pregnancy === "yes" && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                      <p className="inter-reg-font text-[13px] text-red-600">
                        This treatment is not suitable if you are pregnant,
                        trying to get pregnant or breastfeeding. We recommend
                        you speak to your GP in person.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <NextButton
                    label="Next"
                    disabled={!isValid || pregnancy === "yes"}
                  />
                  <BackButton
                    label="Back"
                    className="mt-3"
                    onClick={() => router.push("/re-order")}
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
