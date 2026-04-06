import TextField from "../TextField/TextField";
import NextButton from "../NextButton/NextButton";
import BackButton from "../BackButton/BackButton";
import { forgotPasswordLink } from "@/api/forgotPasswordLinkApi";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CircularProgress from "@mui/material/CircularProgress";
import { BiTimeFive } from "react-icons/bi"; // import timer icon
export default function ForgotForm({ register, handleSubmit, errors, onSubmit, isLoading, isSuccess, onBack, watch, passwordlink, submittedEmail }) {
  const [resendTimer, setResendTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (isSuccess && resendTimer === 0) {
      setResendTimer(30); // start 60s when first success shows
    }
  }, [isSuccess]);

  useEffect(() => {
    let interval = null;

    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      setTimerInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Resend Mutation
  const forgotLinkMutation = useMutation(forgotPasswordLink);

  const handleResendLink = () => {
    if (!submittedEmail) {
      toast.error("Email address is missing.");
      return;
    }

    setResendLoading(true); // 🔁 Start loader

    forgotLinkMutation.mutate(
      {
        email: submittedEmail,
        passwordlink,
        clinic_id: 2,
      },
      {
        onSuccess: () => {
          toast.success("Reset link sent. Please check your email.");
          setResendTimer(30);
          setResendLoading(false); // ✅ Stop loader
        },
        onError: (error) => {
          const errors = error?.response?.data?.errors;
          if (errors && typeof errors === "object") {
            Object.values(errors).forEach((err) => {
              if (Array.isArray(err)) {
                err.forEach((msg) => toast.error(msg));
              } else {
                toast.error(err);
              }
            });
          } else {
            toast.error("Something went wrong.");
          }
          setResendLoading(false); // ✅ Stop loader on error too
        },
      }
    );
  };

  return (
    <>
      {isSuccess ? (
        <div className="text-green-700 text-sm sm:text-base text-start my-4 space-y-2 reg-font leading-relaxed">
          <p>A password reset link has been sent to your email address.</p>

          <p className="text-gray-600 mt-2 reg-font">Didn’t receive the email? Check your spam or junk folder.</p>
          {resendTimer > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm reg-font text-white bg-primary border border-blue-200 px-4 py-2 rounded-md shadow-sm mt-4">
              <BiTimeFive className="w-4 h-4" />
              <span>
                Resend available in <span className="font-semibold">{resendTimer}s</span>
              </span>
            </div>
          )}
          <NextButton
            label={"Resend Password Reset Link "}
            type="button"
            disabled={resendLoading || resendTimer > 0 || isLoading}
            onClick={handleResendLink}
            startIcon={resendLoading && <CircularProgress size={18} color="inherit" />}
          // Make sure your NextButton supports startIcon
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="paragraph reg-font">Enter your email address below and we will send you a password reset link.</p>
          <TextField label="Email Address" name="email" type="email" placeholder="Enter your email" register={register} required errors={errors} />
          <NextButton label="Send Password Reset Link" type="submit" disabled={isLoading} />

          <div className="flex justify-center mt-4">
            <button onClick={onBack} label="" className="text-black underline text-sm reg-font cursor-pointer">
              Login
            </button>
          </div>
        </form>
      )}
    </>
  );
}
