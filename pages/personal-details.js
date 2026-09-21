import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useEffect, useState } from "react";
import PageLoader from "@/Components/PageLoader/PageLoader";
import MuiDatePickerField from "@/Components/DatePicker/DatePicker";
import { differenceInYears, format, parse } from "date-fns";
import usePatientInfoStore from "@/store/patientInfoStore";
import useProductId from "@/store/useProductIdStore";
import MetaLayout from "@/Meta/MetaLayout";
import {
  FoundayoProductId,
  meta_url,
  WegovyPillProductId,
} from "@/config/constants";

export default function PersonalDetails() {
  const [showLoader, setShowLoader] = useState(false);

  const router = useRouter();

  //Zustand Store State
  const { patientInfo, setPatientInfo } = usePatientInfoStore();
  const { productId } = useProductId();

  console.log(patientInfo, "patientInfo");

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      dob: "",
      gender: "",
      pregnancy: "",
    },
  });

  const gender = watch("gender");
  const pregnancy = watch("pregnancy");

  const validateAge = (date) => {
    if (!date) return "Date of birth is required";

    const today = new Date();
    const age = differenceInYears(today, date);

    if (age < 18) {
      return "You must be at least 18 years old";
    }

    // 85th birthday calculate karo
    const birthDate = new Date(date);
    const eightyFifthBirthday = new Date(
      birthDate.getFullYear() + 85,
      birthDate.getMonth(),
      birthDate.getDate(),
    );

    // Agar aaj 85th birthday ke baad hai — block karo
    const isOver85 = today > eightyFifthBirthday;

    console.log(productId, age, "product id & Age");

    if (productId === 1 && isOver85) {
      return "Wegovy (Semaglutide) is not recommended for individuals above 85 years of age";
    }

    if (productId === FoundayoProductId && isOver85) {
      return "Foundayo (Orforglipron) is not recommended for individuals above 85 years of age";
    }
    if (productId === WegovyPillProductId && isOver85) {
      return "Wegovy Pill is not recommended for individuals above 85 years of age";
    }

    if (productId === 4 && isOver85) {
      return "Mounjaro (Tirzepatide) is not recommended for individuals above 85 years of age";
    }

    return true;
  };

  useEffect(() => {
    if (patientInfo?.dob) {
      const parsedDate = parse(patientInfo.dob, "dd-MM-yyyy", new Date());
      const fixedGender = patientInfo?.gender
        ? patientInfo.gender.charAt(0).toUpperCase() +
          patientInfo.gender.slice(1).toLowerCase()
        : "";

      setValue("dob", parsedDate);
      setValue("gender", fixedGender);
    }

    if (patientInfo?.pregnancy) {
      setValue("pregnancy", patientInfo.pregnancy);
    }

    if (patientInfo?.dob) {
      trigger(["dob", "pregnancy"]);
    }
  }, [patientInfo, patientInfo?.gender]);

  useEffect(() => {
    if (watch("gender") === "Male") {
      setValue("pregnancy", "");
    }
  }, [watch("gender")]);

  const onSubmit = async (data) => {
    const formattedDOB = format(data.dob, "dd-MM-yyyy");

    setPatientInfo({
      ...patientInfo, // 🧠 keep old data
      dob: formattedDOB,
      gender: data.gender,
      pregnancy: data.pregnancy || "", // Add this
    });

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/residential-address");
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}personal-details`} />

      <StepsHeader percentage={"30"} />

      <FormWrapper
        heading={"Mention your sex at birth"}
        description={
          "This refers to your sex when you were born. We ask this because a range of health issues are specific to people based on their sex at birth."
        }
      >
        <PageAnimationWrapper>
          <div>
            <div
              className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    {["Male", "Female"].map((option) => {
                      const selected = watch("gender") === option;
                      return (
                        <label
                          key={option}
                          className={`flex min-w-0 items-center gap-2.5 cursor-pointer rounded-xl border-2 px-4 py-3.5 transition-all duration-150 select-none
                            ${
                              selected
                                ? "border-[#4565BF] bg-[#4565BF]/[0.05]"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                          <input
                            type="radio"
                            value={option}
                            {...register("gender", { required: true })}
                            className="hidden"
                          />
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150
                              ${
                                selected
                                  ? "border-[#4565BF] bg-[#4565BF]"
                                  : "border-slate-300 bg-white"
                              }`}
                          >
                            {selected && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span
                            className={`inter-medium-font text-[14px] ${
                              selected ? "text-[#4565BF]" : "text-slate-700"
                            }`}
                          >
                            {option}
                          </span>
                        </label>
                      );
                    })}

                    {gender === "Female" && (
                      <div className="rounded-xl border border-slate-100 bg-[#FBFBFD] p-5 mt-4 space-y-4">
                        <p className="inter-semibold-font text-[15px] text-slate-900">
                          Are you pregnant, breastfeeding, or trying to
                          conceive?
                        </p>
                        <p className="inter-reg-font text-[13.5px] text-slate-600">
                          Our treatment programme is not suitable while
                          breastfeeding, pregnant, or trying to conceive.
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
                                  {...register("pregnancy", { required: true })}
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
                                    isSelected
                                      ? "text-[#4565BF]"
                                      : "text-slate-700"
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
                              This treatment is not suitable if you are
                              pregnant, trying to get pregnant or breastfeeding.
                              We recommend you speak to your GP in person.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {errors.gender && (
                    <p className="inter-reg-font text-red-500 text-sm mt-1 text-center">
                      Please select your gender
                    </p>
                  )}
                </div>
                <div>
                  <MuiDatePickerField
                    name="dob"
                    label="Date of Birth"
                    control={control}
                    errors={errors}
                    rules={{ validate: validateAge }}
                  />
                </div>

                <div className="mt-6">
                  <NextButton
                    label="Next"
                    disabled={
                      !isValid || (gender === "Female" && pregnancy === "yes")
                    }
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
