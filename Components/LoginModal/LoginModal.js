import { useEffect, useState, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";

import { forgotPasswordLink } from "@/api/mergeRoutes";
import { forgotPassword } from "@/api/mergeRoutes";
import { passwordlink } from "@/config/constants";
import ResetForm from "./ResetForm";
import ForgotForm from "./ForgotForm";
import LoginForm from "./LoginForm";
import PageLoader from "../PageLoader/PageLoader";

export default function LoginModal({
  show = false,
  onClose = () => {},
  onLogin = () => {},
  isLoading = false,
  modes,
}) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const [mode, setMode] = useState(modes);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailFromURL = searchParams.get("email");
  const [submittedEmail, setSubmittedEmail] = useState("");

  // useEffect(() => {
  //     const pathname = window.location.pathname.replace(/\/+$/, "");
  //     console.log(pathname, "pathname");
  //     setMode(pathname == "/login" ? "forgot" : "login");

  // }, [mode]);

  console.log(mode, "mode");
  const [forceVisible, setForceVisible] = useState(false);
  const [showLoginMsg, setShowLoginMsg] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const forgotMutation = useMutation(forgotPassword, {
    onMutate: () => setLocalLoading(true),
    onSuccess: () => {
      toast.success("Password updated successfully.");
      setMode("login");
      setShowLoginMsg(true);
      setForceVisible(true);
      setLocalLoading(false);
    },
    onError: (error) => {
      console.log("Login error:", error);

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

      setLocalLoading(false);
    },
  });

  const forgotLinkMutation = useMutation(forgotPasswordLink, {
    onMutate: () => setLocalLoading(true),
    onSuccess: () => {
      toast.success("Reset link sent. Please check your email.");
      reset();
      setForceVisible(true);
      setLocalLoading(false);
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
    },
  });

  useEffect(() => {
    if (token && emailFromURL) setMode("reset");
  }, [token, emailFromURL]);

  useEffect(() => {
    if (!show) {
      forgotMutation.reset();
      forgotLinkMutation.reset();
      setForceVisible(false);
      setShowLoginMsg(false);
      setLocalLoading(false);
    } else {
      // When modal opens, set mode based on token or passed mode
      if (token && emailFromURL) {
        setMode("reset");
      } else {
        setMode(modes || "login");
      }
    }
  }, [show, token, emailFromURL, modes]);

  const showModal = show || forceVisible || mode === "reset";

  const isFormLoading = useMemo(() => {
    return (
      (mode === "login" && isLoading) ||
      (mode === "forgot" && forgotLinkMutation.isLoading) ||
      (mode === "reset" && forgotMutation.isLoading)
    );
  }, [mode, isLoading, forgotLinkMutation.isLoading, forgotMutation.isLoading]);

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md mx-4 sm:mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {(mode === "login" ||
              (mode === "forgot" && !forgotLinkMutation.isSuccess)) && (
              <button
                onClick={onClose}
                className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              >
                <RxCross2 size={22} />
              </button>
            )}

            <h2 className="text-center text-2xl font-semibold text-gray-800 mb-4">
              {mode === "login"
                ? "Login"
                : mode === "forgot"
                  ? "Forgot Password?"
                  : "Reset Password"}
            </h2>

            {showLoginMsg && mode === "login" && (
              <p className="text-green-600 text-center text-sm mb-4 reg-font">
                Your password was changed successfully. Please login below.
              </p>
            )}

            {mode === "reset" && (
              <ResetForm
                register={register}
                handleSubmit={handleSubmit}
                errors={errors}
                getValues={getValues} // ✅ pass it
                isLoading={forgotMutation.isLoading}
                onSubmit={(data) =>
                  forgotMutation.mutate({
                    email: emailFromURL,
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                    token,
                    passwordlink,
                    company_id: 2,
                  })
                }
              />
            )}

            {mode === "forgot" && (
              <ForgotForm
                register={register}
                handleSubmit={handleSubmit}
                errors={errors}
                submittedEmail={submittedEmail}
                isLoading={forgotLinkMutation.isLoading}
                isSuccess={forgotLinkMutation.isSuccess}
                watch={watch}
                passwordlink={passwordlink}
                onSubmit={(data) => {
                  setSubmittedEmail(data.email); // ✅ Save email for later
                  forgotLinkMutation.mutate({
                    email: data.email,
                    passwordlink,
                    clinic_id: 2,
                  });
                }}
                onBack={() => {
                  forgotLinkMutation.reset();
                  setMode("login");
                }}
              />
            )}

            {mode === "login" && (
              <LoginForm
                register={register}
                handleSubmit={handleSubmit}
                errors={errors}
                isLoading={isLoading}
                onLogin={onLogin}
                onForgot={() => setMode("forgot")}
              />
            )}

            {isFormLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-2xl">
                <PageLoader />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
