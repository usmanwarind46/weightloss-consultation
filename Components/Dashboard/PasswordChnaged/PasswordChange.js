import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { FiCheck, FiX } from "react-icons/fi";

import TextField from "@/Components/TextField/TextField";
import NextButton from "@/Components/NextButton/NextButton";
import { ChangePassword } from "@/api/ChangePassword";
import useSignupStore from "@/store/signupStore";

const PasswordChange = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { email } = useSignupStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  const newPassword = watch("newpassword");
  const confirmPassword = watch("newpassword_confirmation");

  const changePasswordMutation = useMutation(ChangePassword, {
    onSuccess: () => {
      toast.success("Password changed successfully.");
      reset();
      setIsLoading(false);
    },
    onError: (error) => {
      const errorObj = error?.response?.data?.errors;
      const message = errorObj && typeof errorObj === "object" ? Object.values(errorObj)?.[0] : "Something went wrong.";
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

  const PasswordCheck = ({ valid, label }) => (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      {valid ? <FiCheck className="text-green-600" /> : <FiX className="text-red-600" />}
    </div>
  );

  return (
    <div className="p-6 sm:bg-[#F9FAFB] sm:min-h-screen sm:rounded-md sm:shadow-md my-5 sm:me-5">
      <div className="max-w-2xl p-5 rounded-md">
        <h1 className="text-3xl bold-font headingDashBoard mb-2">Change Password</h1>
        <p className="paragraph mb-6 reg-font">Please create a strong password for your account.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <TextField
              type="password"
              label="Current Password"
              name="old_password"
              register={register}
              validation={{ required: "Current password is required" }}
              errors={errors}
              required
            />
            <div>
              <TextField
                type="password"
                label="New Password"
                name="newpassword"
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
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <TextField
              type="password"
              label="Confirm Password"
              name="newpassword_confirmation"
              required
              register={register}
              validation={{
                required: "Please confirm your password",
                validate: (v) => v === newPassword || "Passwords do not match",
              }}
              errors={errors}
            />
          </div>
          <div className="bg-gray-50 text-black reg-font border border-gray-200 rounded-lg p-4 mt-6 space-y-2">
            <PasswordCheck valid={newPassword?.length >= 8} label="At least 8 characters." />
            <PasswordCheck valid={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)} label="Upper and lower case characters." />
            <PasswordCheck valid={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)} label="At least 1 special character." />
            <PasswordCheck valid={/[0-9]/.test(newPassword)} label="At least 1 number." />
            <PasswordCheck valid={newPassword === confirmPassword && confirmPassword !== ""} label="Passwords must match." />
          </div>

          <div className="w-full md:w-1/2 ">
            <NextButton type="submit" disabled={!isValid || isLoading} label={isLoading ? "Saving..." : "Save"} />
          </div>
        </form>

        <div className="mt-5">
          <div className="bg-gray-100 border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 cursor-not-allowed">{email}</div>
          <p className="text-xs text-gray-600 my-2">(This email is associated with your account and cannot be changed)</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordChange;
