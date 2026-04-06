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
                                  : "bg-green-100 border-[#4DB581] text-[#4DB581]"
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
              className={`w-5 h-5 mr-2 rounded-md border flex items-center justify-center
                                ${
                                  isSelected
                                    ? option === "yes"
                                      ? "bg-primary border-[#4565BF] text-white"
                                      : "bg-[#4DB581] border-[#4DB581] text-white"
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

  return (
    <>
      <MetaLayout canonical={`${meta_url}re-order/`} />

      <StepsHeader />
      <FormWrapper heading="Reorder Confirmation" description="" percentage="0">
        <PageAnimationWrapper>
          <div className="bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm reg-font paragraph">
                    Has anything changed since your last order?
                  </p>
                  {renderYesNo("personalUse", personalUse)}
                </div>
              </div>

              <div className="my-5">
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
