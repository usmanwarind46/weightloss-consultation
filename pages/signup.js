import useSignupStore from "@/store/signupStore"; // 🛒 import store
import TextField from "@/Components/TextField/TextField";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { useState, useEffect } from "react";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";
import useAuthStore from "@/store/authStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

export default function SignUp() {
  const [showLoader, setShowLoader] = useState(false);
  const { token } = useAuthStore();

  // 🛒 Zustand State
  const { firstName, lastName, setFirstName, setLastName } = useSignupStore();

  const {
    register,
    handleSubmit,
    setValue,
    trigger, // ✅ to set initial values
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: "", // will override below
      lastName: "",
    },
  });

  const router = useRouter();

  // 🛒 Set default values from Zustand on load
  useEffect(() => {
    console.log(firstName, "FirstName");

    setValue("firstName", firstName);
    setValue("lastName", lastName);

    if (firstName || lastName) {
      trigger(["firstName", "lastName"]);
    }

    // After setting values, trigger validation manually
    // trigger(["firstName", "lastName"]);
  }, [firstName, lastName, setValue, trigger]);

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    // 🛒 Update Zustand with latest values
    setFirstName(data.firstName);
    setLastName(data.lastName);

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    if (token) {
      router.push("/steps-information");
    } else {
      router.push("/email-confirmation");
    }
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}signup/`} />

      <StepsHeader percentage={"10"} />
      <FormWrapper
        heading={"Enter your full legal name"}
        description={"We require this to generate your prescription if you qualify for the treatment."}

      >
        <PageAnimationWrapper>
          <div className="">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField label="First Name" name="firstName" placeholder="First Name" register={register} required errors={errors} />
                  <TextField label="Last Name" name="lastName" placeholder="Last Name" register={register} required errors={errors} />
                </div>

                <div className="flex justify-between mt-6">

                  <BackButton label="Back" onClick={() => router.push("/acknowledgment")} />
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
