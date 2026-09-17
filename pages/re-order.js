import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FiCheck } from "react-icons/fi";

import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import useReorder from "@/store/useReorderStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReorderButtonStore from "@/store/useReorderButton";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";

export default function ReOrder() {
  const router = useRouter();
  const { setReorderStatus } = useReorder();
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
    },
  });

  useEffect(() => {
    setReorderBackProcess(false);
  }, []);

  const personalUse = watch("personalUse");
  useEffect(() => {
    setReorderBackProcess(false);
  }, []);
  const onSubmit = async (data) => {
    setIsFromReorder(false);
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (data.personalUse === "yes") {
      router.push("/signup");
      setReorderStatus(true);
    } else {
      router.push("/calculate-bmi");
      setReorderBackProcess(true);
      setReorderStatus(false);
      setReorderBackProcess(true);
    }
  };

  const renderYesNo = (fieldName, value) => (
    <div className="mt-4 flex w-full gap-3">
      {["yes", "no"].map((option) => {
        const isSelected = value === option;
        return (
          <label
            key={option}
            className={`flex min-h-[54px] flex-1 cursor-pointer items-center gap-2.5 rounded-xl border-2 px-4 py-3.5 transition-all duration-200 select-none ${
              isSelected
                ? option === "yes"
                  ? "border-[#4565BF] bg-[#4565BF]/[0.08] shadow-[0_3px_12px_rgba(69,101,191,0.08)]"
                  : "border-emerald-500 bg-emerald-50 shadow-[0_3px_12px_rgba(16,185,129,0.08)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-[#4565BF]/25 hover:bg-[#4565BF]/[0.02]"
            }`}
          >
            <input
              type="radio"
              value={option}
              {...register(fieldName, { required: true })}
              className="hidden"
            />
            <div
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
                isSelected
                  ? option === "yes"
                    ? "border-[#4565BF] bg-[#4565BF]"
                    : "border-emerald-500 bg-emerald-500"
                  : "border-slate-300 bg-white"
              }`}
            >
              {isSelected && <FiCheck className="text-[11px] text-white" />}
            </div>
            <span
              className={`inter-medium-font text-[14px] capitalize ${
                isSelected
                  ? option === "yes"
                    ? "text-[#4565BF]"
                    : "text-emerald-700"
                  : "text-slate-700"
              }`}
            >
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );

  return (
    <>
      <MetaLayout canonical={`${meta_url}re-order/`} />

      <StepsHeader />
      <FormWrapper heading="Reorder Confirmation" description="" percentage="0">
        <PageAnimationWrapper>
          <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <p className="inter-medium-font text-[14px] leading-relaxed text-slate-800">
                  Has anything changed since your last order?
                </p>
                {renderYesNo("personalUse", personalUse)}
              </div>

              <div>
                <NextButton disabled={!isValid} label="I Confirm" />
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
