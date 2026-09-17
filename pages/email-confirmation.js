import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import useSignupStore from "@/store/signupStore";
import useUserDataStore from "@/store/userDataStore";
import useAuthStore from "@/store/authStore";
import { registerUser } from "@/api/authApi";
import { Login } from "@/api/loginApi";
import Fetcher from "@/library/Fetcher";

import NextButton from "@/Components/NextButton/NextButton";
import BackButton from "@/Components/BackButton/BackButton";
import StepsHeader from "@/layout/stepsHeader";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import LoginModal from "@/Components/LoginModal/LoginModal";
import TextField from "@/Components/TextField/TextField";
import PageLoader from "@/Components/PageLoader/PageLoader";
import useLoginModalStore from "@/store/useLoginModalStore";
import usePasswordReset from "@/store/usePasswordReset";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useReturning from "@/store/useReturningPatient";
import { patientSource } from "@/api/mergeRoutes";

export default function EmailConfirmation() {
  const [showLoader, setShowLoader] = useState(false);
  const [already, setAlready] = useState(false);
  // const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const {
    firstName,
    lastName,
    setLastName,
    setFirstName,
    email,
    confirmationEmail,
    setEmail,
    setConfirmationEmail,
  } = useSignupStore();
  const { setIsReturningPatient } = useReturning();

  const { userData, setUserData } = useUserDataStore();
  const { token, setToken } = useAuthStore();
  const { setIsPasswordReset, isPasswordReset, setShowResetPassword } =
    usePasswordReset();
  const { showLoginModal, closeLoginModal, openLoginModal } =
    useLoginModalStore();
  const { setAuthUserDetail } = useAuthUserDetailStore();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: { email: "", confirmationEmail: "" },
  });

  useEffect(() => {
    setValue("email", email);
    setValue("confirmationEmail", confirmationEmail);
    if (email) trigger(["email", "confirmationEmail"]);
  }, [email, confirmationEmail, setValue, trigger]);

  const registerMutation = useMutation(registerUser, {
    onSuccess: async (data) => {
      const user = data?.data?.data;
      setAuthUserDetail(user);
      setUserData(user);
      setToken(user?.token);
      setIsPasswordReset(true);
      setIsReturningPatient(user?.isReturning);
      Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user?.token}`;

      const stored = JSON.parse(
        localStorage.getItem("owlc_attribution") || "null",
      );

      if (stored) {
        try {
          await patientSource({
            user_id: userData?.id,
            type: "register",
            first_touch: {
              channel: stored.first_touch?.channel || "Direct",
              source: stored.first_touch?.source || "direct",
              medium: stored.first_touch?.medium || "none",
              paid_status: stored.first_touch?.paid_status || "unknown",
            },
            last_touch: {
              channel: stored.last_touch?.channel || "Direct",
              source: stored.last_touch?.source || "direct",
              medium: stored.last_touch?.medium || "none",
              paid_status: stored.last_touch?.paid_status || "unknown",
            },
          });

          // Clear karo

          console.log("✅ Attribution sent");
        } catch (attributionError) {
          console.error("Attribution API failed:", attributionError);
        }
      }

      router.push("/steps-information");
    },
    onError: (error) => {
      const emailError = error?.response?.data?.errors?.email;
      if (emailError === "This email is already registered.") setAlready(true);
      if (emailError) toast.error(emailError);
      setShowLoader(false);
    },
  });

  const loginMutation = useMutation(Login); // no onSuccess/onError

  const handleSignupSubmit = (data) => {
    setEmail(data.email);
    setConfirmationEmail(data.confirmationEmail);
    setShowLoader(true);

    registerMutation.mutate({
      email: data.email,
      email_confirmation: data.confirmationEmail,
      fname: firstName,
      lname: lastName,
      company_id: 2,
    });
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}email-confirmation/`} />

      <LoginModal
        show={showLoginModal}
        onClose={closeLoginModal}
        isLoading={showLoader}
        onLogin={async (data) => {
          setShowLoader(true);
          try {
            const response = await loginMutation.mutateAsync({
              ...data,
              company_id: 2,
            });
            const user = response?.data?.data;
            setIsPasswordReset(false);
            setAuthUserDetail(user);
            setUserData(user);
            setToken(user?.token);
            setFirstName(user?.fname);
            setLastName(user?.lname);
            setEmail(user?.email);
            setShowResetPassword(user?.show_password_reset);
            setIsReturningPatient(user?.isReturning);

            toast.success("Login Successfully");
            Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
            closeLoginModal();

            // ✅ Hide loader immediately after success
            setShowLoader(false);
            router.push("/dashboard");
          } catch (error) {
            const errorMsg = error?.response?.data?.errors;
            const firstMsg =
              errorMsg && typeof errorMsg === "object"
                ? Object.values(errorMsg)[0]
                : "Something went wrong.";
            toast.error(firstMsg);
            setShowLoader(false);
          }
        }}
      />

      {/*  */}

      <StepsHeader percentage="20" />
      <FormWrapper
        heading="Enter your email address"
        description="This is where we will send information about your order."
      >
        <PageAnimationWrapper>
          <div
            className={`relative ${
              showLoader ? "pointer-events-none cursor-not-allowed" : ""
            }`}
          >
            <form
              onSubmit={handleSubmit(handleSignupSubmit)}
              className="space-y-4"
            >
              <TextField
                label="Email Address"
                name="email"
                type="email"
                placeholder="Email Address"
                register={register}
                required
                errors={errors}
                disablePaste
              />

              <TextField
                label="Confirm Email Address"
                name="confirmationEmail"
                type="email"
                placeholder="Confirm Email Address"
                register={register}
                required
                validation={{
                  validate: (value) =>
                    value === getValues("email") ||
                    "Email addresses must match.",
                }}
                errors={errors}
                disablePaste
              />

              {already && (
                <div className="inter-reg-font rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-[13px] text-red-600">
                  The email address you have entered is already associated with
                  an existing account{" "}
                  <span
                    onClick={openLoginModal}
                    className="inter-medium-font cursor-pointer text-[#4565BF] underline hover:text-[#3550a0]"
                  >
                    Click here to login.
                  </span>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <NextButton label="Next" type="submit" disabled={!isValid} />
                <BackButton
                  label="Back"
                  onClick={() => router.push("/signup")}
                />
              </div>
            </form>

            {showLoader && (
              <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg">
                <PageLoader />
              </div>
            )}
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
