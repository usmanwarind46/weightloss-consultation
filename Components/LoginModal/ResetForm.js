import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import NextButton from "../NextButton/NextButton";

export default function ResetForm({ register, handleSubmit, errors, onSubmit, isLoading, getValues }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* New Password */}
      <div className="space-y-1">
        <label htmlFor="password" className="bold-font paragraph mb-2">
          New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            onPaste={(e) => e.preventDefault()}
            placeholder="New Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            className={`reg-font w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-[#4565BF]
              ${errors.password ? "border-red-500" : "border-black"}`}
          />
          <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="cursor-pointer absolute top-5 right-3 text-gray-500">
            {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label htmlFor="password_confirmation" className="bold-font paragraph mb-2">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="password_confirmation"
            type={showConfirm ? "text" : "password"}
            onPaste={(e) => e.preventDefault()}
            placeholder="Confirm Password"
            {...register("password_confirmation", {
              required: "Please confirm your password",
              validate: (val) => val === getValues("password") || "Passwords do not match",
            })}
            className={`reg-font w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-[#4565BF]
              ${errors.password_confirmation ? "border-red-500" : "border-black"}`}
          />
          <button type="button" onClick={() => setShowConfirm((prev) => !prev)} className="cursor-pointer absolute top-5 right-3 text-gray-500">
            {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>
        {errors.password_confirmation && <p className="text-sm text-red-600 mt-1">{errors.password_confirmation.message}</p>}
      </div>

      <NextButton label="Change Password" type="submit" disabled={isLoading} />
    </form>
  );
}
