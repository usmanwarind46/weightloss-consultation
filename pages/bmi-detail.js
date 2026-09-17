import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import useBmiStore from "@/store/bmiStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import StepsHeader from "@/layout/stepsHeader";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import TextField from "@/Components/TextField/TextField";
import NextButton from "@/Components/NextButton/NextButton";
import BackButton from "@/Components/BackButton/BackButton";
import useReorder from "@/store/useReorderStore";
import useLastBmi from "@/store/useLastBmiStore";
import useReturning from "@/store/useReturningPatient";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

export default function BmiDetail() {
  const [showLoader, setShowLoader] = useState(false);
  const { bmi, setBmi } = useBmiStore();
  const { patientInfo } = usePatientInfoStore();
  const { reorder, reorderStatus } = useReorder();
  const { lastBmi } = useLastBmi();
  const { isReturningPatient } = useReturning();
  const router = useRouter();

  console.log(lastBmi, "lastBmi");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      checkbox1: false,
      checkbox2: false,
      noneOfTheAbove: false,
      weight_related_comorbidity_explanation: "",
    },
  });

  const checkbox1 = watch("checkbox1");
  const checkbox2 = watch("checkbox2");
  const noneOfTheAbove = watch("noneOfTheAbove");
  const explanation = watch("weight_related_comorbidity_explanation");

  const bmiValue = parseFloat(Number(bmi?.bmi).toFixed(1));
  const shouldShowCheckboxes =
    patientInfo?.ethnicity === "Yes"
      ? bmiValue >= 25.5 && bmiValue <= 27.4
      : bmiValue >= 27 && bmiValue <= 29.9;

  const shouldShowInfoMessage =
    patientInfo?.ethnicity === "Yes" && bmiValue >= 27.5 && bmiValue <= 29.9;
  const isApproachingUnderweight = bmiValue >= 20 && bmiValue <= 20.9;

  // Check For reorder and low BMI
  const isReorderAndBmiLow = isReturningPatient && bmiValue < 20;

  // Check if the ethnicity is "Yes" or "No" and if the BMI is below the required threshold
  const isEthnicityYes = patientInfo?.ethnicity === "Yes";
  const isEthnicityNo = patientInfo?.ethnicity === "No";
  const isEthnicityNotDecided = patientInfo?.ethnicity === "Prefer not to say";
  let bmiError = "";

  if (isEthnicityYes && bmiValue < 25.5 && !isReturningPatient) {
    bmiError = "BMI must be at least 25.5";
  } else if (
    (isEthnicityNo || isEthnicityNotDecided) &&
    bmiValue < 27 &&
    !isReturningPatient
  ) {
    bmiError = "BMI must be at least 27";
  } else if (isApproachingUnderweight && isReturningPatient) {
    bmiError =
      "Your BMI is approaching the lower end of healthy weight. Due to the risk of becoming underweight, you are not able to proceed. Please arrange a telephone consultation with a member of our clinical team to discuss alternatives";
  }

  const isNextDisabled =
    (!isReturningPatient &&
      shouldShowCheckboxes &&
      (noneOfTheAbove ||
        (!checkbox1 && !checkbox2) ||
        (checkbox2 && !explanation?.trim()))) ||
    (isReturningPatient && bmiValue < 20) ||
    bmiError;

  // const isNextDisabled = shouldShowCheckboxes && (noneOfTheAbove || (!checkbox1 && !checkbox2) || (checkbox2 && !explanation?.trim()));

  const getCheckbox1Label = () => {
    return patientInfo?.ethnicity === "Yes" &&
      bmiValue >= 25.5 &&
      bmiValue <= 27.4
      ? "You have previously taken weight loss medication your starting (baseline) BMI was above 27.5"
      : "You have previously taken weight loss medication your starting (baseline) BMI was above 30";
  };

  // Pre-fill from bmiStore
  useEffect(() => {
    const consent = bmi?.bmiConsent;

    if (consent) {
      if (consent.previously_taking_medicine?.length) {
        setValue("checkbox1", true);
      }
      if (consent.weight_related_comorbidity?.length) {
        setValue("checkbox2", true);
      }
      if (consent.weight_related_comorbidity_explanation) {
        setValue(
          "weight_related_comorbidity_explanation",
          consent.weight_related_comorbidity_explanation,
        );
      }
      if (consent.assian_message) {
        setValue("noneOfTheAbove", true);
      }
    }
  }, [bmi, setValue]);

  // Checkbox 1 or 2 → Uncheck none of the above
  useEffect(() => {
    if ((checkbox1 || checkbox2) && noneOfTheAbove) {
      setValue("noneOfTheAbove", false);
    }
  }, [checkbox1, checkbox2, noneOfTheAbove, setValue]);

  // Checkbox 2 → Uncheck → Clear textarea
  useEffect(() => {
    if (!checkbox2 && explanation) {
      setValue("weight_related_comorbidity_explanation", "");
    }
  }, [checkbox2, explanation, setValue]);

  const onSubmit = (data) => {
    const consent = {
      previously_taking_medicine: [],
      weight_related_comorbidity: [],
      weight_related_comorbidity_explanation: "",
      assian_message: "",
    };

    // Skip all logic if isReturningPatient is true
    if (!isReturningPatient) {
      consent.assian_message = shouldShowInfoMessage
        ? "As you have confirmed that you are from one of the following family backgrounds: South Asian, Chinese, Other Asian, Middle Eastern, Black African or African-Caribbean, your cardiometabolic risk occurs at a lower BMI. You are, therefore, able to proceed with a lower BMI."
        : "";

      // Only populate if checkboxes are visible
      if (shouldShowCheckboxes) {
        if (data.checkbox1) {
          consent.previously_taking_medicine.push(getCheckbox1Label());
        }

        if (data.checkbox2) {
          consent.weight_related_comorbidity.push(
            "You have at least one weight-related comorbidity (e.g. PCOS, diabetes, etc.)",
          );

          if (data.weight_related_comorbidity_explanation) {
            consent.weight_related_comorbidity_explanation =
              data.weight_related_comorbidity_explanation;
          }
        }
      }
    }

    // ✅ Save final consent state
    setBmi({
      ...bmi,
      bmiConsent: consent,
    });

    console.log("Form Submitted:", consent);

    setShowLoader(true);

    if (reorder == true && reorderStatus == false) {
      setTimeout(() => {
        router.push("/confirmation-summary");
      }, 500);
    } else {
      setTimeout(() => {
        router.push("/medical-questions");
      }, 500);
    }
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}bmi-detail/`} />
      <StepsHeader percentage={"70"} />
      <FormWrapper heading={"Your BMI:"}>
        <PageAnimationWrapper>
          <div className="mb-5 rounded-2xl border border-[#4565BF]/[0.12] bg-[#f2f4fb] py-10 text-center">
            <p className="inter-medium-font mb-1 text-[13px] uppercase tracking-widest text-[#4565BF]/60">Your BMI</p>
            <h1 className="inter-bold-font text-4xl text-[#4565BF]">{bmiValue}</h1>
          </div>

          {isReorderAndBmiLow && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 mb-4">
              <p className="inter-reg-font text-[13px] text-red-600">
                Your BMI is in the underweight category. Therefore, losing
                further weight is not safe and you are not able to proceed
                further. Please contact us to discuss your options with the
                clinical team.
              </p>
            </div>
          )}

          {shouldShowInfoMessage && !isReturningPatient && (
            <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3.5 mt-6 mb-6">
              <p className="inter-reg-font text-[13px] text-amber-800">
                As you have confirmed that you are from one of the following
                family backgrounds: South Asian, Chinese, Other Asian, Middle
                Eastern, Black African or African-Caribbean, your
                cardiometabolic risk occurs at a lower BMI. You are, therefore,
                able to proceed with a lower BMI.
              </p>
            </div>
          )}

          {bmiError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 mb-4">
              <p className="inter-reg-font text-[13px] text-red-600">
                {bmiError}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 relative"
          >
            {shouldShowCheckboxes && !isReturningPatient && (
              <>
                {patientInfo?.ethnicity === "No" ||
                patientInfo?.ethnicity === "Prefer not to say" ? (
                  <p className="inter-reg-font text-[14px] text-slate-700">
                    Your BMI is between 27-29.9 which indicates you are
                    overweight.
                  </p>
                ) : null}
                <p className="inter-reg-font text-[14px] text-slate-700">
                  You should only continue with the consultation if you have
                  tried losing weight through a reduced-calorie diet and
                  increased physical activity but are still struggling to lose
                  weight and confirm that either:
                </p>

                <Controller name="checkbox1" control={control} render={({ field }) => (
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-150
                    ${field.value ? "border-[#4565BF]/20 bg-[#4565BF]/[0.03]" : "border-slate-200 bg-[#FBFBFD]"}`}>
                    <input type="checkbox" {...field} checked={field.value} className="hidden" />
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 transition-all duration-150
                      ${field.value ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}>
                      {field.value && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="inter-medium-font text-[13px] leading-relaxed text-slate-800">{getCheckbox1Label()}</span>
                  </label>
                )} />

                <Controller name="checkbox2" control={control} render={({ field }) => (
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-150
                    ${field.value ? "border-[#4565BF]/20 bg-[#4565BF]/[0.03]" : "border-slate-200 bg-[#FBFBFD]"}`}>
                    <input type="checkbox" {...field} checked={field.value} className="hidden" />
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 transition-all duration-150
                      ${field.value ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}>
                      {field.value && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="inter-medium-font text-[13px] leading-relaxed text-slate-800">You have at least one weight-related comorbidity (e.g. PCOS, diabetes, etc.)</span>
                  </label>
                )} />

                {checkbox2 && (
                  <Controller name="weight_related_comorbidity_explanation" control={control}
                    rules={{ required: "Explanation is required" }}
                    render={({ field }) => (
                      <TextField {...field} required label="Explanation"
                        name="weight_related_comorbidity_explanation" placeholder="Describe your condition(s)" errors={errors} multiline rows={4} />
                    )}
                  />
                )}

                <Controller name="noneOfTheAbove" control={control} render={({ field }) => (
                  <div>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-150
                      ${field.value ? "border-red-200 bg-red-50/30" : "border-slate-200 bg-[#FBFBFD]"}`}>
                      <input type="checkbox" {...field} checked={field.value} onChange={(e) => {
                        const checked = e.target.checked;
                        field.onChange(checked);
                        if (checked) {
                          setValue("checkbox1", false);
                          setValue("checkbox2", false);
                          setValue("weight_related_comorbidity_explanation", "");
                        }
                      }} className="hidden" />
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 transition-all duration-150
                        ${field.value ? "border-red-400 bg-red-400" : "border-slate-300 bg-white"}`}>
                        {field.value && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="inter-medium-font text-[13px] leading-relaxed text-slate-800">None of the above</span>
                    </label>
                    {noneOfTheAbove && (
                      <div className="mt-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                        <p className="inter-reg-font text-[13px] text-red-700">
                          Your BMI in this range, weight loss treatment can only be
                          prescribed if you have either previously taken weight loss
                          medication, or you have at least one weight-related
                          medical condition.
                        </p>
                      </div>
                    )}
                  </div>
                )} />
              </>
            )}

            <div className="mt-6 space-y-3 relative">
              <NextButton
                label="Next"
                type="submit"
                disabled={isNextDisabled}
              />
              <BackButton
                label="Back"
                onClick={() => router.push("/calculate-bmi")}
              />
            </div>
            {showLoader && (
              <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg">
                <PageLoader />
              </div>
            )}
          </form>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
