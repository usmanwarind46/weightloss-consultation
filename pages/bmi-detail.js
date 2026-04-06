import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Checkbox, FormControlLabel } from "@mui/material";
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
import { BsInfoCircle } from "react-icons/bs";
import { FaLessThan } from "react-icons/fa";
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
  const shouldShowCheckboxes = patientInfo?.ethnicity === "Yes" ? bmiValue >= 25.5 && bmiValue <= 27.4 : bmiValue >= 27.5 && bmiValue <= 29.9;
  const shouldShowInfoMessage = patientInfo?.ethnicity === "Yes" && bmiValue >= 27.5 && bmiValue <= 29.9;
  const isApproachingUnderweight = bmiValue >= 19.5 && bmiValue <= 21.0;

  // Check For reorder and low BMI
  const isReorderAndBmiLow = isReturningPatient && bmiValue <= 19.4;

  // Check if the ethnicity is "Yes" or "No" and if the BMI is below the required threshold
  const isEthnicityYes = patientInfo?.ethnicity === "Yes";
  const isEthnicityNo = patientInfo?.ethnicity === "No";
  let bmiError = "";

  if (isEthnicityYes && bmiValue < 25.5 && !isReturningPatient) {
    bmiError = "BMI must be at least 25.5";
  } else if (isEthnicityNo && bmiValue < 27 && !isReturningPatient) {
    bmiError = "BMI must be at least 27";
  } else if (isApproachingUnderweight && isReturningPatient) {
    bmiError = "Your BMI is approaching the lower end of healthy weight. Due to the risk of becoming underweight, you are not able to proceed. Please arrange a telephone consultation with a member of our clinical team to discuss alternatives";
  }


  const isNextDisabled =
    (!isReturningPatient && shouldShowCheckboxes && (noneOfTheAbove || (!checkbox1 && !checkbox2) || (checkbox2 && !explanation?.trim()))) ||
    (isReturningPatient && bmiValue < 20) ||
    bmiError;

  // const isNextDisabled = shouldShowCheckboxes && (noneOfTheAbove || (!checkbox1 && !checkbox2) || (checkbox2 && !explanation?.trim()));

  const getCheckbox1Label = () => {
    return patientInfo?.ethnicity === "Yes" && bmiValue >= 25.5 && bmiValue <= 27.4
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
        setValue("weight_related_comorbidity_explanation", consent.weight_related_comorbidity_explanation);
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
          consent.weight_related_comorbidity.push("You have at least one weight-related comorbidity (e.g. PCOS, diabetes, etc.)");

          if (data.weight_related_comorbidity_explanation) {
            consent.weight_related_comorbidity_explanation = data.weight_related_comorbidity_explanation;
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
      <StepsHeader percentage={"65"} />
      <FormWrapper heading={"Your BMI:"}>
        <PageAnimationWrapper>
          <div className="py-12 mb-5 border text-center bg-blue-100 rounded-2xl shadow">
            <h1 className="text-black text-3xl bold-font">BMI: {bmiValue}</h1>
          </div>

          {isReorderAndBmiLow && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 border border-red-300">
              {/* Your BMI is approaching the lower end of healthy weight. Due to the risk of becoming underweight, you are not able to proceed. Please
              arrange a telephone consultation with a member of our clinical team to discuss alternatives. */}
              Your BMI is in the underweight category. Therefore, losing further weight is not safe and you are not able to proceed further. Please contact us to discuss your options with the clinical team.

            </div>
          )}

          {shouldShowInfoMessage && !isReturningPatient && (
            <div className="bg-[#FFF3CD] px-4 py-4 mt-6 mb-6 text-gray-700 rounded shadow-md">
              <p>
                As you have confirmed that you are from one of the following family backgrounds: South Asian, Chinese, Other Asian, Middle Eastern,
                Black African or African-Caribbean, your cardiometabolic risk occurs at a lower BMI. You are, therefore, able to proceed with a lower
                BMI.
              </p>
            </div>
          )}

          {bmiError && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 border border-red-300">{bmiError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
            {shouldShowCheckboxes && !isReturningPatient && (
              <>
                {patientInfo?.ethnicity === "No" || patientInfo?.ethnicity === "Prefer not to say" ? (
                  <p className="text-gray-800 font-normal">Your BMI is between 27-29.9 which indicates you are overweight.</p>
                ) : null}
                <p className="text-gray-800 font-normal">
                  You should only continue with the consultation if you have tried losing weight through a reduced-calorie diet and increased physical
                  activity but are still struggling to lose weight and confirm that either:
                </p>

                <Box mb={1}>
                  <Controller
                    name="checkbox1"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            sx={{
                              color: "#4565BF", // violet-700
                              "&.Mui-checked": {
                                color: "#4565BF", // violet-700 when checked
                              },
                            }}
                          />
                        }
                        label={getCheckbox1Label()}
                        classes={{ label: "reg-font text-gray-800" }}
                      />
                    )}
                  />
                </Box>

                <Box mb={1}>
                  <Controller
                    name="checkbox2"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            sx={{
                              color: "#4565BF", // violet-700
                              "&.Mui-checked": {
                                color: "#4565BF", // violet-700 when checked
                              },
                            }}
                          />
                        }
                        label="You have at least one weight-related comorbidity (e.g. PCOS, diabetes, etc.)"
                        classes={{ label: "reg-font text-gray-800" }}
                      />
                    )}
                  />
                </Box>

                {checkbox2 && (
                  <Box mb={1}>
                    <Controller
                      name="weight_related_comorbidity_explanation"
                      control={control}
                      rules={{ required: "Explanation is required" }}
                      render={({ field }) => (
                        <TextField {...field} label="Explanation"
                          required name="weight_related_comorbidity_explanation" errors={errors} multiline rows={4} />
                      )}
                    />
                  </Box>
                )}

                <Box mb={3}>
                  <Controller
                    name="noneOfTheAbove"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              field.onChange(checked);
                              if (checked) {
                                setValue("checkbox1", false);
                                setValue("checkbox2", false);
                                setValue("weight_related_comorbidity_explanation", "");
                              }
                            }}
                            sx={{
                              color: "#4565BF", // violet-700
                              "&.Mui-checked": {
                                color: "#4565BF", // violet-700 when checked
                              },
                            }}
                          />
                        }
                        label="None of the above"
                        classes={{ label: "reg-font text-gray-800" }}
                      />
                    )}
                  />

                  {noneOfTheAbove && (
                    <p className="text-red-600 font-normal mt-2">
                      Your BMI in this range, weight loss treatment can only be prescribed if you have either previously taken weight loss medication,
                      or you have at least one weight-related medical condition.
                    </p>
                  )}
                </Box>
              </>
            )}

            <div className="flex justify-between mt-6 relative">
              <BackButton label="Back" onClick={() => router.push("/calculate-bmi")} />
              <NextButton label="Next" type="submit" disabled={isNextDisabled} />

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
