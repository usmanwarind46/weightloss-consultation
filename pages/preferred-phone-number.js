import TextField from "@/Components/TextField/TextField";
import { Controller, useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { useEffect, useState } from "react";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";
import usePatientInfoStore from "@/store/patientInfoStore";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReturning from "@/store/useReturningPatient";

export default function SignUp() {
  const [showLoader, setShowLoader] = useState(false);
  const { isReturningPatient } = useReturning();
  const { patientInfo, setPatientInfo } = usePatientInfoStore();

  console.log(patientInfo?.phoneNo, "patientInfo");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      phoneNo: patientInfo?.phoneNo,
    },
  });
  const router = useRouter();

  useEffect(() => {
    setValue("phoneNo", patientInfo?.phoneNo);
  }, [patientInfo]);

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setPatientInfo({
      ...patientInfo, // 🧠 keep old data
      phoneNo: data?.phoneNo, // 🆕 update or add phoneNo
    });
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Wait 2s
    if (isReturningPatient) {

      router.push("/calculate-bmi/");
    } else {
      router.push("/confirm-ethnicity");

    }
  };





  return (
    <>
      <MetaLayout canonical={`${meta_url}preferred-phone-number/`} />


      <StepsHeader percentage={"50"} />
      <FormWrapper
        heading={"Enter your phone number"}
        description={"Please provide an active phone number to ensure smooth delivery of your order."}

      >
        <PageAnimationWrapper>
          <div>
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Phone Number */}

                <Controller
                  name="phoneNo"
                  control={control}
                  rules={{
                    required: "Phone number is required",
                    validate: (value) => {
                      const onlyDigits = value?.replace(/\D/g, "");
                      if (!onlyDigits || onlyDigits.length <= 5) return "Enter a valid phone number";
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <div className="mb-4">
                      <label htmlFor="phoneNo" className="bold-font paragraph mb-2 relative">
                        Phone Number <span className="text-red-500 absolute  m-1 niba-semibold-font"> *</span>
                      </label>

                      <div
                        className={`w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 
          focus-within:ring-2 focus-within:ring-blue-300 blue-within:border-[#4565BF]
          ${errors.phoneNo ? "border-red-500" : "border-black"}
        `}
                      >
                        <PhoneInput {...field} country="gb" placeholder="Enter your number" inputStyle={{ border: "none", width: "100%" }} />
                      </div>

                      {errors.phoneNo && <p className="text-red-500 text-sm mt-1">{errors.phoneNo.message}</p>}
                    </div>
                  )}
                />
                <div className="flex justify-between mt-6">

                  <BackButton label="Back" onClick={() => router.push("/residential-address")} />
                  <NextButton
                    label="Next"
                    disabled={!isValid} // ✅ disables until valid
                    type="submit"

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
