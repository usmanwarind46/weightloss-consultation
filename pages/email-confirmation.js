import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import useSignupStore from "@/store/signupStore";
import useUserDataStore from "@/store/userDataStore";
import useAuthStore from "@/store/authStore";
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
import { registerUser } from "@/api/mergeRoute";

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

  const { setUserData } = useUserDataStore();
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
    onSuccess: (data) => {
      const user = data?.data?.data;
      setAuthUserDetail(user);
      setUserData(user);
      setToken(user?.token);
      setIsPasswordReset(true);
      setIsReturningPatient(user?.isReturning);
      Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user?.token}`;
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
          console.log(data, "dfkjdskjjkffskj");
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
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
                  The email address you have entered is already associated with
                  an existing account{" "}
                  <span
                    onClick={openLoginModal}
                    className="text-blue-600 underline cursor-pointer reg-font hover:text-blue-800"
                  >
                    Click here to login.
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <BackButton
                  label="Back"
                  onClick={() => router.push("/signup")}
                />
                <NextButton label="Next" type="submit" disabled={!isValid} />
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
