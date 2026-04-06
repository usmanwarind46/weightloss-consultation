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
import { FiCheck } from "react-icons/fi";
import MuiDatePickerField from "@/Components/DatePicker/DatePicker";
import { differenceInYears, format, parse } from "date-fns";
import usePatientInfoStore from "@/store/patientInfoStore";
import useProductId from "@/store/useProductIdStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

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

    const age = differenceInYears(new Date(), date);

    if (age < 18) {
      return "You must be at least 18 years old";
    }

    if (productId === 1 && age > 75) {
      return "Wegovy (Semaglutide) is not recommended for individuals above 75 years of age";
    }

    if (productId === 4 && age > 85) {
      return "Mounjaro (Tirzepatide) is not recommended for individuals above 85 years of age";
    }

    return true;
  };

  useEffect(() => {
    if (patientInfo?.dob) {
      const parsedDate = parse(patientInfo.dob, "dd-MM-yyyy", new Date());
      const fixedGender = patientInfo?.gender ? patientInfo.gender.charAt(0).toUpperCase() + patientInfo.gender.slice(1).toLowerCase() : "";

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
      <MetaLayout canonical={`${meta_url}personal-details/`} />

      <StepsHeader percentage={"30"} />

      <FormWrapper
        heading={"Mention your sex at birth"}
        description={
          "This refers to your sex when you were born. We ask this because a range of health issues are specific to people based on their sex at birth."
        }

      >
        <PageAnimationWrapper>
          <div>
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {/* <h1 className="text-lg font-semibold text-center mb-2 text-black">What is your gender</h1> */}
                  {/* <p className="text-sm text-green-900 text-center mb-6">
                                Why do we ask about your sex at birth?
                            </p> */}

                  <div className="space-y-3">
                    {["Male", "Female"].map((option) => {
                      const selected = watch("gender") === option;
                      return (
                        <label
                          key={option}
                          className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm
                            ${selected ? "bg-[#E9F6FA] border-black text-black bold-font paragraph" : "border-gray-300 text-gray-900 hover:bg-gray-50"
                            } bold-font paragraph`}
                        >
                          <div
                            className={`w-5 h-5 rounded-sm flex items-center justify-center border transition
                            ${selected ? "bg-primary border-[#4565BF] text-white" : "border-gray-400 bg-white"}`}
                          >
                            {selected && <FiCheck className="w-4 h-4" />}
                          </div>
                          <input type="radio" value={option} {...register("gender", { required: true })} className="hidden" />

                          {option}
                        </label>
                      );
                    })}

                    {gender === "Female" && (
                      <div className="space-y-4 mt-6">
                        <p className="mb-3 reg-font paragraph !text-black !text-lg">Are you pregnant, breastfeeding, or trying to conceive?</p>
                        <p className="mb-6 reg-font paragraph">
                          Our treatment programme is not suitable while breastfeeding, pregnant, or trying to conceive.
                        </p>

                        <div className="flex gap-4 mt-2 w-full">
                          {["yes", "no"].map((option) => {
                            const isSelected = pregnancy === option;
                            return (
                              <label
                                key={option}
                                className={`reg-font flex items-center px-4 py-4 rounded-md border justify-start cursor-pointer transition-all duration-200 flex-1
              ${isSelected ? "bg-violet-100 border-[#4565BF] text-primary" : "bg-white border-gray-300 hover:border-gray-400 text-gray-800"}`}
                              >
                                <input type="radio" value={option} {...register("pregnancy", { required: true })} className="hidden" />
                                <div
                                  className={`w-5 h-5 mr-2 rounded-md border flex items-center justify-center
                ${isSelected ? "bg-primary border-[#4565BF] text-white" : "border-gray-400 bg-white"}`}
                                >
                                  {isSelected && <FiCheck className="text-md" />}
                                </div>
                                <span className="text-black bold-font paragraph capitalize">{option}</span>
                              </label>
                            );
                          })}
                        </div>

                        {pregnancy === "yes" && (
                          <p className="text-red-600 text-sm mt-2">
                            This treatment is not suitable if you are pregnant, trying to get pregnant or breastfeeding. We recommend you speak to
                            your GP in person.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {errors.gender && <p className="text-red-500 text-sm mt-1 text-center">Please select your gender</p>}
                </div>
                <div>
                  <MuiDatePickerField name="dob" label="Date of Birth" control={control} errors={errors} rules={{ validate: validateAge }} />

                  {/* {errors.dob && <p className="text-red-500 text-sm mt-1 text-center">{errors.dob.message}</p>} */}

                  {/* {errors.dob && <p className="text-red-500 text-sm mt-1">Date of birth is required</p>} */}
                </div>

                <div className="flex justify-end mt-6">
                  <NextButton label="Next" disabled={!isValid || (gender === "Female" && pregnancy === "yes")} />

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
