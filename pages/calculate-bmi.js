import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import TextField from "@/Components/TextField/TextField";
import { useRouter } from "next/navigation";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import BackButton from "@/Components/BackButton/BackButton";
import SwitchTabs from "@/Components/Tabs/SwitchTabs";
import useBmiStore from "@/store/bmiStore";
import BmiTextField from "@/Components/BmiTextField/BmiTextField";
import useReorder from "@/store/useReorderStore";
import useLastBmi from "@/store/useLastBmiStore";
import { BsInfoCircle } from "react-icons/bs";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";
import useReturning from "@/store/useReturningPatient";

const validateRange = (value, min, max, wholeOnly, message) => {
  const num = Number(value);
  if (isNaN(num)) return message;
  if (wholeOnly && !Number.isInteger(num)) return message;
  if (num < min || num > max) return message;
  return true;
};

export default function CalculateBmi() {
  const { isReturningPatient } = useReturning();
  const [localStep, setLocalStep] = useState(1);
  const [heightUnit, setHeightUnit] = useState("metrics");
  const [weightUnit, setWeightUnit] = useState("metrics");
  const [showLoader, setShowLoader] = useState(false);
  const [heightUnitKey, setHeightUnitKey] = useState(""); // Will be "imperial" or "metrics"
  const [weightUnitKey, setWeightUnitKey] = useState("");
  const { reorder, reorderStatus } = useReorder();
  const { lastBmi } = useLastBmi();
  const { reorderBackProcess } = useReorderBackProcessStore();

  const { bmi, setBmi } = useBmiStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      heightFt: "",
      heightIn: "",
      heightCm: "",
      weightSt: "",
      weightLbs: "",
      weightKg: "",
    },
  });

  const heightFt = watch("heightFt");
  const heightIn = watch("heightIn");
  const heightCm = watch("heightCm");

  const weightSt = watch("weightSt");
  const weightLbs = watch("weightLbs");
  const weightKg = watch("weightKg");

  // Load values from store
  useEffect(() => {
    setValue("heightFt", bmi?.ft);
    setValue("heightIn", bmi?.inch);
    setValue("heightCm", bmi?.cm);
    // setValue("weightSt", bmi?.stones);
    // setValue("weightLbs", bmi?.pound);
    // setValue("weightKg", bmi?.kg);

    // Detect units based on which fields are filled
    if (bmi?.cm) {
      setHeightUnit("metrics");
      setHeightUnitKey("metrics");
    } else if (bmi?.ft || bmi?.inch) {
      setHeightUnit("imperial");
      setHeightUnitKey("imperial");
    }

    if (bmi?.kg) {
      setWeightUnit("metrics");
      setWeightUnitKey("metrics");
    } else if (bmi?.stones || bmi?.pound) {
      setWeightUnit("imperial");
      setWeightUnitKey("imperial");
    }

    if (
      bmi?.ft ||
      bmi?.inch ||
      bmi?.cm ||
      bmi?.stones ||
      bmi?.pound ||
      bmi?.kg
    ) {
      trigger([
        "heightFt",
        "heightIn",
        "heightCm",
        "weightSt",
        "weightLbs",
        "weightKg",
      ]);
    }
  }, [bmi, setValue, trigger]);

  const isStepValid = () => {
    if (localStep === 1) {
      if (heightUnit === "imperial") {
        return !errors.heightFt && !errors.heightIn;
      } else {
        return !errors.heightCm;
      }
    } else {
      if (weightUnit === "metrics") {
        return !errors.weightKg;
      } else {
        return !errors.weightSt && !errors.weightLbs;
      }
    }
  };

  const handleNext = async () => {
    const fields =
      localStep === 1
        ? heightUnit === "imperial"
          ? ["heightFt", "heightIn"]
          : ["heightCm"]
        : weightUnit === "imperial"
          ? ["weightSt", "weightLbs"]
          : ["weightKg"];

    // Validate
    const isValid = await trigger(fields);
    if (!isValid) return;

    // ⭐ Convert before going to next or calculating
    if (localStep === 1) {
      if (heightUnit === "metrics") {
        // cm to ft/in
        const cm = parseFloat(watch("heightCm")) || 0;
        const totalInches = cm / 2.54;
        const ft = Math.floor(totalInches / 12);
        const inch = totalInches % 12;

        setValue("hiddenCm", cm);
        setValue("heightFt", ft ? Math.round(ft) : "");
        setValue("heightIn", inch ? Math.round(inch) : "");
      } else {
        // ft/in to cm
        const ft = parseFloat(watch("heightFt")) || 0;
        const inch = parseFloat(watch("heightIn")) || 0;
        const cm = ft * 30.48 + inch * 2.54;

        setValue("hiddenCm", cm);
        setValue("heightCm", cm ? Math.round(cm) : "");
      }
    } else {
      if (weightUnit === "metrics") {
        // kg to st/lbs
        const kg = parseFloat(watch("weightKg")) || 0;
        const totalLbs = kg / 0.453592;
        const st = Math.floor(totalLbs / 14);
        const lbs = totalLbs % 14;

        setValue("hiddenKg", kg);
        setValue("weightSt", st ? Math.round(st) : "");
        setValue("weightLbs", lbs ? Math.round(lbs) : "");
      } else {
        // st/lbs to kg
        const st = parseFloat(watch("weightSt")) || 0;
        const lbs = parseFloat(watch("weightLbs")) || 0;
        const kg = st * 6.35029 + lbs * 0.453592;

        setValue("hiddenKg", kg);
        setValue("weightKg", kg ? Math.round(kg) : "");
      }
    }

    // After conversion → next step or calculate
    if (localStep === 2) {
      handleSubmit(async (data) => {
        const formValues = getValues();

        const ft = parseFloat(formValues.heightFt) || 0;
        const inch = parseFloat(formValues.heightIn) || 0;
        const cm = ft * 30.48 + inch * 2.54;

        const st = parseFloat(formValues.weightSt) || 0;
        const lbs = parseFloat(formValues.weightLbs) || 0;
        const kg = st * 6.35029 + lbs * 0.453592;

        const heightCm = parseFloat(data?.hiddenCm) || cm;
        const weightKg = parseFloat(data?.hiddenKg) || kg;

        const heightInMeters = heightCm / 100;

        let calculatedBmi = 0;
        let bmiLevel = "";

        if (heightInMeters > 0 && weightKg > 0) {
          calculatedBmi = weightKg / (heightInMeters * heightInMeters);
          calculatedBmi = +calculatedBmi.toFixed(1);

          if (calculatedBmi < 18.5) {
            bmiLevel = "Underweight";
          } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
            bmiLevel = "Normal";
          } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
            bmiLevel = "Overweight";
          } else {
            bmiLevel = "Obese";
          }
        }

        setBmi({
          ...bmi,
          ft: data?.heightFt,
          inch: data?.heightIn,
          cm: data?.heightCm,
          stones: data?.weightSt,
          pound: data?.weightLbs,
          kg: data?.weightKg,
          bmi: calculatedBmi,
          hiddenInch: data?.heightIn,
          hiddenLb: data?.weightLbs,
          hiddenCm: data?.hiddenCm || cm,
          hiddenKg: data?.hiddenKg || kg,
          height_unit: heightUnitKey || bmi?.height_unit, // default to metrics if blank
          weight_unit: weightUnitKey || bmi?.weight_unit, // default to metrics if blank
        });

        setShowLoader(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        router.push("/bmi-detail");
      })();
    } else {
      setLocalStep(2);
    }
  };

  // On Blur → Convert and sync hidden values
  const handleHeightBlur = () => {
    const ft = parseFloat(watch("heightFt")) || 0;
    const inch = parseFloat(watch("heightIn")) || 0;
    const cm = ft * 30.48 + inch * 2.54;

    setValue("hiddenCm", cm);
    setValue("heightCm", cm ? Math.round(cm) : "");
  };

  const handleCmBlur = () => {
    const cm = parseFloat(watch("heightCm")) || 0;
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;

    setValue("hiddenCm", cm);
    setValue("heightFt", ft ? Math.round(ft) : "");
    setValue("heightIn", inch ? Math.round(inch) : "");
  };

  const handleWeightBlur = () => {
    const st = parseFloat(watch("weightSt")) || 0;
    const lbs = parseFloat(watch("weightLbs")) || 0;
    const kg = st * 6.35029 + lbs * 0.453592;

    setValue("hiddenKg", kg);
    setValue("weightKg", kg ? Math.round(kg) : "");
  };

  const handleKgBlur = () => {
    const kg = parseFloat(watch("weightKg")) || 0;
    const totalLbs = kg / 0.453592;
    const st = Math.floor(totalLbs / 14);
    const lbs = totalLbs % 14;

    setValue("hiddenKg", kg);
    setValue("weightSt", st ? Math.round(st) : "");
    setValue("weightLbs", lbs ? Math.round(lbs) : "");
  };

  const back = () => {
    if (reorderBackProcess == true) {
      router.push("/re-order");
    } else if (isReturningPatient) {
      router.push("/preferred-phone-number");
    } else {
      router.push("/confirm-ethnicity");
    }
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}calculate-bmi/`} />
      <StepsHeader percentage="65" />
      <FormWrapper
        heading={
          localStep === 1
            ? "What is your height?"
            : "What is your current weight?"
        }
        description={`Your Body Mass Index (BMI) is an important factor in assessing your eligibility for treatment. Please enter your ${
          localStep === 1 ? "height" : "weight"
        } below to allow us to calculate your BMI.`}
      >
        <PageAnimationWrapper>
          <div>
            <SwitchTabs
              tabs={
                localStep === 1
                  ? [
                      { label: "cm", value: "metrics" },
                      { label: "ft/inch", value: "imperial" },
                    ]
                  : [
                      { label: "kg", value: "metrics" },
                      { label: "st/lb", value: "imperial" },
                    ]
              }
              selectedTab={localStep === 1 ? heightUnit : weightUnit}
              onTabChange={(value) => {
                if (localStep === 1) {
                  if (value === "metrics") {
                    const ft = parseFloat(watch("heightFt")) || 0;
                    const inch = parseFloat(watch("heightIn")) || 0;
                    const cm = ft * 30.48 + inch * 2.54;
                    console.log(
                      cm,
                      "cm value in tabs saving in hidden before round If metric",
                    );
                    setValue("hiddenCm", cm);
                    setValue("heightCm", cm ? Math.round(cm) : "");
                  } else {
                    const cm = parseFloat(watch("heightCm")) || 0;
                    const totalInches = cm / 2.54;
                    const ft = Math.floor(totalInches / 12);
                    const inch = totalInches % 12;
                    console.log(
                      cm,
                      "cm value in tabs saving in hidden before round If imperial",
                    );
                    setValue("hiddenCm", cm);
                    setValue("heightFt", ft ? Math.round(ft) : "");
                    setValue("heightIn", inch ? Math.round(inch) : "");
                  }
                  setHeightUnit(value);
                  setHeightUnitKey(value);
                } else {
                  if (value === "metrics") {
                    const st = parseFloat(watch("weightSt")) || 0;
                    const lbs = parseFloat(watch("weightLbs")) || 0;
                    const kg = st * 6.35029 + lbs * 0.453592;
                    setValue("hiddenKg", kg);
                    setValue("weightKg", kg ? Math.round(kg) : "");
                  } else {
                    const kg = parseFloat(watch("weightKg")) || 0;
                    const totalLbs = kg / 0.453592;
                    const st = Math.floor(totalLbs / 14);
                    const lbs = totalLbs % 14;
                    setValue("hiddenKg", kg);
                    setValue("weightSt", st ? Math.round(st) : "");
                    setValue("weightLbs", lbs ? Math.round(lbs) : "");
                  }
                  setWeightUnit(value);
                  setWeightUnitKey(value);
                }
              }}
            />

            <div
              className={`relative ${
                showLoader ? "pointer-events-none cursor-not-allowed" : ""
              }`}
            >
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {localStep === 1 &&
                  (heightUnit === "imperial" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <BmiTextField
                        required
                        label="Feet (ft)"
                        name="heightFt"
                        disabled={isReturningPatient}
                        readOnly={isReturningPatient}
                        fieldProps={register("heightFt", {
                          required: "This field is required",
                          validate: (value) =>
                            validateRange(
                              value,
                              4,
                              10,
                              true,
                              "Only numbers from 4 to 10 are allowed",
                            ),
                          onChange: (e) => {
                            if (e.target.value !== "")
                              setHeightUnitKey("imperial");
                          },
                        })}
                        errors={errors}
                        onBlur={handleHeightBlur}
                      />
                      <BmiTextField
                        required
                        label="Inches (in)"
                        name="heightIn"
                        disabled={isReturningPatient}
                        readOnly={isReturningPatient}
                        fieldProps={register("heightIn", {
                          required: "This field is required",
                          validate: (value) =>
                            validateRange(
                              value,
                              0,
                              11,
                              true,
                              "Only valid numbers (0–11) are allowed",
                            ),
                          onChange: (e) => {
                            if (e.target.value !== "")
                              setHeightUnitKey("imperial");
                          },
                        })}
                        errors={errors}
                        onBlur={handleHeightBlur}
                      />
                    </div>
                  ) : (
                    <BmiTextField
                      required
                      label="Centimetres (cm)"
                      name="heightCm"
                      disabled={isReturningPatient}
                      readOnly={isReturningPatient}
                      fieldProps={register("heightCm", {
                        required: "This field is required",
                        validate: (value) => {
                          const num = Number(value);
                          if (!Number.isInteger(num))
                            return "Only whole numbers from 122 to 300 are allowed";
                          if (num < 122 || num > 300)
                            return "Only whole numbers from 122 to 300 are allowed";
                          return true;
                        },
                        onChange: (e) => {
                          if (e.target.value !== "")
                            setHeightUnitKey("metrics");
                        },
                      })}
                      errors={errors}
                      onBlur={handleCmBlur}
                    />
                  ))}

                {localStep === 2 && (
                  <>
                    {weightUnit === "imperial" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <BmiTextField
                          required
                          label="Stone (st)"
                          name="weightSt"
                          fieldProps={register("weightSt", {
                            required: "This field is required",
                            validate: (value) =>
                              validateRange(
                                value,
                                4,
                                80,
                                false,
                                "Only valid numbers (4–80) are allowed",
                              ),
                            onChange: (e) => {
                              if (e.target.value !== "")
                                setWeightUnitKey("imperial");
                            },
                          })}
                          errors={errors}
                          onBlur={handleWeightBlur}
                        />
                        <BmiTextField
                          required
                          label="Pounds (lb)"
                          name="weightLbs"
                          fieldProps={register("weightLbs", {
                            required: "This field is required",
                            validate: (value) =>
                              validateRange(
                                value,
                                0,
                                20,
                                false,
                                "Only valid numbers (0–20) are allowed",
                              ),
                            onChange: (e) => {
                              if (e.target.value !== "")
                                setWeightUnitKey("imperial");
                            },
                          })}
                          errors={errors}
                          onBlur={handleWeightBlur}
                        />
                      </div>
                    ) : (
                      <BmiTextField
                        required
                        label="Kilograms (kg)"
                        name="weightKg"
                        fieldProps={register("weightKg", {
                          required: "This field is required",
                          validate: (value) =>
                            validateRange(
                              value,
                              40,
                              500,
                              true,
                              "Only whole numbers from 40 to 500 are allowed",
                            ),
                          onChange: (e) => {
                            if (e.target.value !== "")
                              setWeightUnitKey("metrics");
                          },
                        })}
                        errors={errors}
                        onBlur={handleKgBlur}
                      />
                    )}

                    {lastBmi ? (
                      lastBmi?.weight_unit == "metrics" ? (
                        <div className="bg-[#FFF3CD] px-4 py-4 mt-6 mb-6 text-gray-700 rounded shadow-md">
                          <p className="flex items-center sm:text-[16px] text-xs">
                            <BsInfoCircle className="me-2" /> Your previous
                            recorded weight was{" "}
                            <span className="font-bold ms-1 sm:text-[16px] text-xs">
                              {lastBmi?.kg} kg
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="bg-[#FFF3CD] px-4 py-4 mt-6 mb-6 text-gray-700 rounded shadow-md">
                          <p className="flex items-center sm:text-[16px] text-xs">
                            <BsInfoCircle className="me-2" /> Your previous
                            recorded weight was{" "}
                            <span className="font-bold ms-1 me-2 sm:text-[16px] text-xs">
                              {lastBmi?.stones} st & {lastBmi?.pound} lbs
                            </span>
                          </p>
                        </div>
                      )
                    ) : (
                      ""
                    )}
                  </>
                )}

                <div className="flex justify-between items-center mt-6">
                  {localStep === 2 ? (
                    <BackButton
                      type="button"
                      label="Back"
                      onClick={() => setLocalStep(1)}
                    />
                  ) : (
                    <BackButton label="Back" onClick={back} />
                  )}
                  <NextButton
                    label="Next"
                    onClick={handleNext}
                    type="button"
                    disabled={!isStepValid()}
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
