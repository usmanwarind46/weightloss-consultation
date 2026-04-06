import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import { FiCheck } from "react-icons/fi";
import { useRouter } from "next/navigation";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import StepsHeader from "@/layout/stepsHeader";
import { GoDotFill } from "react-icons/go";
import BackButton from "@/Components/BackButton/BackButton";
import usePatientInfoStore from "@/store/patientInfoStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReturning from "@/store/useReturningPatient";

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
      ? patientInfo?.ethnicity.charAt(0).toUpperCase() + patientInfo?.ethnicity.slice(1).toLowerCase()
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
        description={"People of certain ethnicities may be suitable for treatment at a lower BMI than others, if appropriate."}

      >
        <PageAnimationWrapper>
          <p className="bold-font paragraph my-3">Does one of the following options describe your ethnic group or background?</p>
          <div className="">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {["South Asian", "Chinese", "Other Asian", "Middle Eastern", "Black African", "African-Caribbean"].map((ethnicity, index) => (
                <div key={index} className="flex items-start gap-3">
                  {/* w-2.5 h-2.5 */}
                  <div className=" mt-2 bg-primary rounded-full"></div>
                  <div className="flex items-center">
                    <GoDotFill className="me-2 text-gray-800 text-xs" />
                    <p className="niba-bold-font text-gray-700">{ethnicity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {options.map((option) => {
                    const isSelected = selectedOption === option;
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm
                      ${isSelected ? "bg-[#E9F6FA] border-black bold-font paragraph" : "border-gray-300 bold-font paragraph hover:bg-gray-50"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-sm flex items-center justify-center border transition
                        ${isSelected ? "bg-primary border-[#4565BF] text-white" : "border-gray-400 bg-white"}`}
                        >
                          {isSelected && <FiCheck className="w-4 h-4" />}
                        </div>
                        <input type="radio" value={option} {...register("ethnicity", { required: true })} className="hidden" />
                        {option}
                      </label>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-6">
                  <BackButton label="Back" onClick={() => router.push("/preferred-phone-number")} />
                  <NextButton disabled={!isValid} label="Next" />
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
