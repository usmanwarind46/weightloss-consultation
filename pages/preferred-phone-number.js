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
                      <label htmlFor="phoneNo" className="inter-medium-font mb-1.5 block text-[13px] text-slate-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>

                      <div className={`w-full border-b-2 pb-1 transition-colors duration-200
                        ${errors.phoneNo ? "border-red-400" : "border-slate-200 focus-within:border-[#4565BF]"}`}>
                        <PhoneInput
                          {...field}
                          country="gb"
                          placeholder="e.g. 7700 900123"
                          containerStyle={{ width: "100%" }}
                          inputStyle={{
                            border: "none",
                            width: "100%",
                            background: "transparent",
                            fontSize: "14px",
                            color: "#1e293b",
                            paddingLeft: "52px",
                            height: "40px",
                            boxShadow: "none",
                            outline: "none",
                          }}
                          buttonStyle={{
                            border: "none",
                            background: "transparent",
                            paddingLeft: "0",
                          }}
                          dropdownStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 8px 24px rgba(69,101,191,0.10)",
                            fontSize: "13px",
                            fontFamily: "inherit",
                            marginTop: "6px",
                            color: "#1e293b",
                          }}
                        />
                      </div>

                      {errors.phoneNo && (
                        <p className="inter-reg-font mt-1.5 text-[12px] text-red-500">
                          {errors.phoneNo.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <div className="space-y-3 mt-6">
                  <NextButton
                    label="Next"
                    disabled={!isValid} // ✅ disables until valid
                    type="submit"
                  />
                  <BackButton label="Back" onClick={() => router.push("/residential-address")} />
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
