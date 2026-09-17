import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Check,
  Info,
  KeyRound,
  LockKeyhole,
  X,
} from "lucide-react";

import TextField from "@/Components/TextField/TextField";
import NextButton from "@/Components/NextButton/NextButton";
import { ChangePassword } from "@/api/mergeRoutes";
import useSignupStore from "@/store/signupStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import { PageHeader } from "@/Components/Dashboard/MyAccount/MyAccount";

const PasswordRequirement = ({ valid, label }) => {
  return (
    <div
      className={`flex items-center gap-3 rounded-[12px] border px-3.5 py-3 transition-all duration-200 ${
        valid
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          valid
            ? "bg-emerald-100 text-emerald-600"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {valid ? (
          <Check size={15} strokeWidth={2.5} />
        ) : (
          <X size={14} strokeWidth={2.3} />
        )}
      </span>

      <span
        className={`inter-medium-font text-[12px] leading-5 ${
          valid ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

const PasswordChange = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { email } = useSignupStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });
  const { authUserDetail } = useAuthUserDetailStore();

  const newPassword = watch("newpassword") || "";
  const confirmPassword = watch("newpassword_confirmation") || "";

  const passwordValidations = useMemo(
    () => ({
      length: newPassword.length >= 8,
      case: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      match: newPassword === confirmPassword && confirmPassword !== "",
    }),
    [newPassword, confirmPassword],
  );

  const completedRequirements =
    Object.values(passwordValidations).filter(Boolean).length;

  const passwordProgress = (completedRequirements / 5) * 100;

  const changePasswordMutation = useMutation(ChangePassword, {
    onSuccess: () => {
      toast.success("Password changed successfully.");
      reset();
      setIsLoading(false);
    },
    onError: (error) => {
      const errorObj = error?.response?.data?.errors;
      const message =
        errorObj && typeof errorObj === "object"
          ? Object.values(errorObj)?.[0]
          : "Something went wrong.";
      toast.error(message);
      setIsLoading(false);
    },
  });

  const onSubmit = (data) => {
    const validations = {
      length: data.newpassword.length >= 8,
      case: /[a-z]/.test(data.newpassword) && /[A-Z]/.test(data.newpassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(data.newpassword),
      number: /[0-9]/.test(data.newpassword),
      match: data.newpassword === data.newpassword_confirmation,
    };

    const isPasswordStrongAndMatch = Object.values(validations).every(Boolean);

    if (!isPasswordStrongAndMatch) {
      toast.error("Please complete all password requirements.");
      return;
    }

    setIsLoading(true);

    changePasswordMutation.mutate({
      old_password: data.old_password,
      newpassword: data.newpassword,
      newpassword_confirmation: data.newpassword_confirmation,
    });
  };

  return (
    <main className="inter-reg-font min-w-0 flex-1 bg-[#EEF2FA]">
      <div className="mx-auto flex w-full flex-col gap-6 p-4 sm:p-5 lg:p-6">

        <PageHeader
          label="Password"
          title="Change Password"
          subtitle="Create a strong, secure password to protect your account."
        />

        <section className="rounded-lg border border-slate-100 bg-white p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="xl:hidden">
              <PasswordRequirements
                validations={passwordValidations}
                progress={passwordProgress}
                completed={completedRequirements}
              />
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-100 bg-white">
              <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <LockKeyhole size={17} strokeWidth={2} />
                </span>

                <div className="min-w-0">
                  <h2 className="inter-semibold-font text-[16px] leading-6 text-slate-900">
                    Update your password
                  </h2>

                  <p className="inter-reg-font mt-1 text-[12.5px] leading-[1.7] text-slate-500 sm:text-[13px]">
                    Please create a strong password for your account.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="password-form space-y-5 p-4 sm:p-5 lg:p-6"
              >
                <TextField
                  type="password"
                  label="Current Password"
                  name="old_password"
                  placeholder="Enter your current password"
                  register={register}
                  validation={{
                    required: "Current password is required",
                  }}
                  errors={errors}
                  required
                />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <TextField
                    type="password"
                    label="New Password"
                    name="newpassword"
                    placeholder="Create a new password"
                    register={register}
                    required
                    validation={{
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    }}
                    errors={errors}
                  />

                  <TextField
                    type="password"
                    label="Confirm Password"
                    name="newpassword_confirmation"
                    placeholder="Re-enter your new password"
                    required
                    register={register}
                    validation={{
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === newPassword || "Passwords do not match",
                    }}
                    errors={errors}
                  />
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5">
                    <Info
                      size={16}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-slate-500"
                    />

                    <p className="inter-reg-font max-w-md text-[11.5px] leading-[1.7] text-slate-500">
                      After updating your password, use the new password the
                      next time you sign in.
                    </p>
                  </div>

                  <div className="password-save-button w-full shrink-0 sm:w-[190px]">
                    <NextButton
                      type="submit"
                      disabled={!isValid || isLoading}
                      label={isLoading ? "Saving..." : "Save password"}
                    />
                  </div>
                </div>
              </form>
            </div>

            <aside className="hidden xl:block">
              <PasswordRequirements
                validations={passwordValidations}
                progress={passwordProgress}
                completed={completedRequirements}
              />
            </aside>
          </div>

          <style jsx global>{`
            .password-form .MuiFormControl-root {
              width: 100%;
            }

            .password-form .MuiInputLabel-root {
              font-family: var(--inter-medium) !important;
              font-size: 13px !important;
              color: #64748b;
            }

            .password-form .MuiInputBase-root {
              min-height: 52px;
              border-radius: 14px !important;
              background: #ffffff;
              font-family: var(--inter-reg) !important;
              font-size: 13px !important;
            }

            .password-form .MuiOutlinedInput-notchedOutline {
              border-color: rgba(69, 101, 191, 0.13) !important;
            }

            .password-form
              .MuiInputBase-root:hover
              .MuiOutlinedInput-notchedOutline {
              border-color: rgba(0,0,0,0.18) !important;
            }

            .password-form .Mui-focused .MuiOutlinedInput-notchedOutline {
              border-color: #4565BF !important;
              border-width: 1px !important;
            }

            .password-form input {
              font-family: var(--inter-reg) !important;
              font-size: 13px !important;
              color: #0f172a !important;
            }

            .password-form label {
              font-family: var(--inter-medium) !important;
            }

            .password-save-button button {
              min-height: 42px !important;
              width: 100% !important;
              border-radius: 10px !important;
              border-color: #4565BF !important;
              background: #4565BF !important;
              padding: 10px 22px !important;
              font-family: var(--inter-medium) !important;
              font-size: 12px !important;
              color: #ffffff !important;
              transition: all 0.15s ease !important;
            }

            .password-save-button button:not(:disabled):hover {
              background: #3550a0 !important;
            }

            .password-save-button button:disabled {
              cursor: not-allowed !important;
              border-color: #cbd5e1 !important;
              background: #cbd5e1 !important;
              box-shadow: none !important;
            }
          `}</style>
        </section>
      </div>
    </main>
  );
};

const PasswordRequirements = ({ validations, progress, completed }) => {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4565BF] text-white">
          <KeyRound size={18} strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="inter-bold-font text-[15px] text-slate-950">
            Password requirements
          </h3>

          <p className="inter-reg-font mt-0.5 text-[11px] text-slate-500">
            {completed} of 5 completed
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-[#4565BF]/[0.08]">
          <div
            className="h-full rounded-full bg-[#4565BF] transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        <PasswordRequirement
          valid={validations.length}
          label="At least 8 characters"
        />

        <PasswordRequirement
          valid={validations.case}
          label="Upper and lower case letters"
        />

        <PasswordRequirement
          valid={validations.special}
          label="At least 1 special character"
        />

        <PasswordRequirement
          valid={validations.number}
          label="At least 1 number"
        />

        <PasswordRequirement
          valid={validations.match}
          label="Passwords must match"
        />
      </div>
    </div>
  );
};

export default PasswordChange;
