import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import SectionWrapper from "./SectionWrapper";
import SectionHeader from "./SectionHeader";
import { FiCheck, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import useSignupStore from "@/store/signupStore";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdatePassword } from "@/api/mergeRoutes";
import usePasswordReset from "@/store/usePasswordReset";
import { RiLockPasswordLine } from "react-icons/ri";
import NextButton from "../NextButton/NextButton";

const SetAPassword = ({ isCompleted, onComplete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isPasswordReset, setIsPasswordReset } = usePasswordReset();
  const { email } = useSignupStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const validations = {
    length: password.length >= 8,
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    number: /[0-9]/.test(password),
    match: password === confirmPassword && confirmPassword !== "",
  };

  const isPasswordStrongAndMatch = Object.values(validations).every(Boolean);

  const { mutate, isLoading } = useMutation(UpdatePassword, {
    onSuccess: (data) => {
      if (data?.status) {
        toast.success("Account created successfully!");
        if (onComplete) onComplete();
        // if (isCompleted) isCompleted();
        setIsPasswordReset(false);
      }
    },
    onError: (error) => {
      const errorData = error?.response?.data?.errors;
      if (errorData && typeof errorData === "object") {
        Object.values(errorData).forEach((errArray) => {
          if (Array.isArray(errArray)) {
            errArray.forEach((errMsg) => toast.error(errMsg));
          } else {
            toast.error(errArray);
          }
        });
      } else {
        toast.error(error?.response?.statusText || "Something went wrong!");
      }
    },
  });

  const onSubmit = () => {
    if (!isPasswordStrongAndMatch) {
      toast.error("Please complete password requirements first.");
      return;
    }

    mutate({
      company_id: 2,
      email: email,
      password: password,
      password_confirmation: confirmPassword,
    });
  };

  return (
    <SectionWrapper>
      <SectionHeader
        stepNumber={<RiLockPasswordLine />}
        title="Set a Password"
        description="Please create a strong password for your account."
        isCompleted={isCompleted}
        className={`relative ${!isPasswordReset ? "opacity-50 ursor-not-allowed pointer-events-none" : ""}`}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`relative ${!isPasswordReset ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div
            className={`relative mt-5 ${!isPasswordReset ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              {...register("password", { required: true })}
              className="inter-reg-font w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-3 pr-9 text-[14px] text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-[#4565BF] focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 transition-colors hover:text-[#4565BF]"
            >
              {showPassword ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>

          <div
            className={`relative mt-5 ${!isPasswordReset ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
          >
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              {...register("confirmPassword", { required: true })}
              onPaste={(e) => e.preventDefault()}
              className="inter-reg-font w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-3 pr-9 text-[14px] text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-[#4565BF] focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 transition-colors hover:text-[#4565BF]"
            >
              {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>

          <div className="inter-reg-font mt-6 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
            <PasswordCheck
              valid={validations.length}
              label="At least 8 characters."
            />
            <PasswordCheck
              valid={validations.case}
              label="Upper and lower case characters."
            />
            <PasswordCheck
              valid={validations.special}
              label="At least 1 special character."
            />
            <PasswordCheck
              valid={validations.number}
              label="At least 1 number."
            />
            <PasswordCheck
              valid={validations.match}
              label="Passwords must match."
            />
          </div>

          <div className="mt-6">
            <NextButton
              label="Continue"
              disabled={
                !isPasswordStrongAndMatch || isLoading || !isPasswordReset
              }
              type="submit"
            />
          </div>
        </form>
      </SectionHeader>
    </SectionWrapper>
  );
};

const PasswordCheck = ({ valid, label }) => (
  <div className="flex items-center justify-between">
    <span className="inter-reg-font text-[13.5px]">{label}</span>
    {valid ? (
      <FiCheck className="text-green-600" />
    ) : (
      <FiX className="text-red-600" />
    )}
  </div>
);

export default SetAPassword;
