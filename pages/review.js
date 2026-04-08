"use client";

import React, { useEffect, useRef, useState } from "react";
import lottie from "lottie-web";
import ApplicationLogo from "@/config/ApplicationLogo";
import { IoArrowForward, IoChevronBack } from "react-icons/io5";
import googleIcon from "@/public/images/google.png";
import trustpilotIcon from "@/public/images/trustpilot.png";
import { motion } from "framer-motion";
import Image from "next/image";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/router";
// 🔹 API + store (ONLY ADDITION)
import useCartStore from "@/store/useCartStore";
import { TrackReview } from "@/api/mergeRoutes";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import BackButton from "@/Components/BackButton/BackButton";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

export default function ReviewScreen() {
  const { token, setReview } = useAuthStore();
  const router = useRouter();

  const [mode, setMode] = useState("idle");
  const [heading, setHeading] = useState("How was your experience?");
  const [fade, setFade] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [reviewDisabled, setReviewDisabled] = useState(null);

  const happyRef = useRef(null);
  const sadRef = useRef(null);

  // 🔹 ONLY ADDITION
  const { orderId } = useCartStore();

  React.useEffect(() => {
    setReview(false);
  }, [setReview]);

  if (!token) {
    router.push("/login/");
    return;
  }

  /* =============================
     API HELPER (UI TOUCH = ZERO)
  ============================= */
  const sendReview = async ({
    review = true,
    review_type = null,
    review_feedback = null,
    review_source = null,
  }) => {
    try {
      await TrackReview({
        review,
        review_type,
        company_id: 2,
        review_feedback,
        review_source,
        order_id: orderId,
      });
    } catch (err) {
      console.log(err?.response?.data?.errors?.order_id || "error-testing");

      if (err?.response?.data?.errors?.order_id) {
        setReviewDisabled(true);
        toast.error(
          `Order not completed: ${err?.response?.data?.errors?.order_id}`,
        );
      }

      console.error("TrackReview error:", err);
    }
  };

  /* =============================
     PAGE VIEW TRACK (ADDED)
  ============================= */
  useEffect(() => {
    if (!orderId) return;
    sendReview({ review: true });
  }, [orderId]);

  /* =============================
     PARALLAX EFFECT (UNCHANGED)
  ============================= */
  useEffect(() => {
    const shell = document.querySelector(".review-shell");
    if (!shell) return;

    const handleMouseMove = (e) => {
      const rect = shell.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      shell.style.setProperty("--mouse-x", `${x}px`);
      shell.style.setProperty("--mouse-y", `${y}px`);
    };

    shell.addEventListener("mousemove", handleMouseMove);
    return () => shell.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /* =============================
     LOTTIE LOAD (UNCHANGED)
  ============================= */
  useEffect(() => {
    if (happyRef.current) {
      happyRef.current.innerHTML = "";
      lottie.loadAnimation({
        container: happyRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "../images/smiley-emoji.json",
      });
    }

    if (sadRef.current) {
      sadRef.current.innerHTML = "";
      lottie.loadAnimation({
        container: sadRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "../images/sad-emoji.json",
      });
    }
  }, [mode]);

  const transition = (text, next) => {
    setFade(true);
    setTimeout(() => {
      setHeading(text);
      setMode(next);
      setFade(false);
    }, 260);
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}review/`} noIndex />

      <section className="review-container ">
        <div className="review-shell">
          <ApplicationLogo className="mx-auto w-46 mb-6 review-logo" />

          {reviewDisabled ? (
            <div className="thanks-panel">
              <p className="text-gray-900 text-center mont-reg-font">
                Complete your order to leave a review. We value your feedback
                and look forward to hearing about your experience once your
                order is finalized.
                <BackButton
                  className="mt-6"
                  onClick={() => router.push("/dashboard/")}
                />
              </p>
            </div>
          ) : (
            <>
              {mode !== "idle" && (
                <button
                  className="back-btn reg-font flex"
                  onClick={() => transition("How was your experience?", "idle")}
                >
                  <IoChevronBack className="mt-1 font-bold" size={24} />
                </button>
              )}

              <h1
                className={`main-heading mont-medium-font ${fade ? "fade-out" : ""}`}
              >
                {heading}
              </h1>

              <div className="fade-panel review-wrapper">
                {mode === "idle" && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-6">
                      {/* HAPPY */}
                      <div
                        className="review-card happy flex flex-col items-center justify-end pb-4 cursor-pointer"
                        onClick={() => {
                          sendReview({ review_type: "happy" }); // 🔹 API
                          transition(
                            "Had a good experience? We’d really appreciate a 5-star review.",
                            "happy",
                          );
                        }}
                      >
                        <div className="emoji">
                          <div ref={happyRef} className="lottie" />
                        </div>
                      </div>

                      {/* SAD */}
                      <div
                        className="review-card sad flex flex-col items-center justify-end pb-4 cursor-pointer"
                        onClick={() => {
                          sendReview({ review_type: "sad" }); // 🔹 API
                          transition(
                            "Sorry your experience wasn’t great. Your feedback helps us improve.",
                            "sad",
                          );
                        }}
                      >
                        <div className="emoji">
                          <div ref={sadRef} className="lottie" />
                        </div>
                      </div>
                    </div>

                    <p className="text-[12px] text-black mont-reg-font tracking-wide tap-text">
                      Tap on an option
                    </p>
                  </div>
                )}

                {mode === "sad" && (
                  <motion.div
                    className="fade-panel textarea-box flex flex-col items-center"
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 22 }}
                  >
                    <div className="w-full mb-6">
                      <textarea
                        placeholder="Tell us what went wrong..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full h-[150px] textArea rounded-3xl px-6 py-5 bg-white/75 backdrop-blur-xl border border-white/60 text-[15px] text-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_22px_44px_rgba(0,0,0,0.18)] focus:outline-none focus:ring-2 focus:ring-[#5b45a7]/50 placeholder:text-black/40 resize-none mont-reg-font"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!feedback.trim()}
                      className={`submit-btn ${
                        !feedback.trim()
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                          : "cursor-pointer"
                      }`}
                      onClick={() => {
                        sendReview({
                          review_type: "sad",
                          review_feedback: feedback,
                        }); // 🔹 API
                        transition("Thank you for your feedback.", "thanks");
                        setFeedback("");
                      }}
                    >
                      Submit Feedback
                    </button>
                  </motion.div>
                )}

                {mode === "happy" && (
                  <motion.div
                    className="fade-panel w-full"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <motion.div className="review-buttons flex flex-col gap-4">
                      <ReviewButton
                        icon={googleIcon}
                        label="Google Review"
                        brand="google"
                        onClick={() => {
                          sendReview({
                            review_type: "happy",
                            review_source: "google",
                          }); // 🔹 API
                          window.open(
                            "https://www.google.com/search?sca_esv=f49c25a2fc6aefe9&sxsrf=ANbL-n7sUMpR00m5rQ_FbAhYnQYTl-hxCw:1769757923485&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOdq0AxnOEkieNBKI51a4DQ3lm2jeLAzA81w3PrVInqgUXUCvUP6_KNfsrlI3BEnp7ybvAa9Mz3edUqGW94mDOQ79Z0vh0nFL5dLHuQMjJe5J-AZlzA%3D%3D&q=Mayfair+Weight+Loss+Clinic+Reviews&sa=X&ved=2ahUKEwi2rfiC3rKSAxXRl2oFHW3bLcUQ0bkNegQIUBAH&cshid=1769758222629938&biw=1366&bih=633&dpr=1&aic=0",
                            "_blank",
                          );
                        }}
                      />

                      <ReviewButton
                        icon={trustpilotIcon}
                        label="Trustpilot Review"
                        brand="trustpilot"
                        onClick={() => {
                          sendReview({
                            review_type: "happy",
                            review_source: "trustpilot",
                          }); // 🔹 API
                          window.open(
                            "https://www.trustpilot.com/review/weightlosspharmacy.co.uk",
                            "_blank",
                          );
                        }}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {mode === "thanks" && (
                  <div className="thanks-panel">
                    <p className="text-gray-800 text-center mont-reg-font">
                      We’re sorry to hear that. Your feedback really matters to
                      us, and we’ll definitely work on improving ourselves.
                      Thank you for sharing your experience.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function ReviewButton({ icon, label, brand, className = "", onClick }) {
  const isTrustpilot = brand === "trustpilot";

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={onClick}
      className={`group relative w-full rounded-2xl px-4 py-3.5 flex items-center gap-4 bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_22px_44px_rgba(0,0,0,0.18)] overflow-hidden cursor-pointer ${className}`}
    >
      {/* 🌈 Gradient Ring */}
      <span
        className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isTrustpilot
            ? "bg-[linear-gradient(120deg,rgba(0,182,122,.45),rgba(255,255,255,.6),rgba(0,182,122,.45))]"
            : "bg-[linear-gradient(120deg,rgba(66,133,244,.45),rgba(255,255,255,.6),rgba(66,133,244,.45))]"
        }`}
      />

      {/* ICON */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-[0_8px_18px_rgba(0,0,0,0.15)] ${
          isTrustpilot ? "bg-[#e8f7f1] border border-[#00b67a]/30" : "bg-white"
        }`}
      >
        <Image
          src={icon}
          alt={label}
          width={18}
          height={18}
          className="review-icon-img"
        />
      </motion.div>

      {/* TEXT */}
      <div className="relative z-10 flex-1 text-start">
        <p className="text-sm mont-medium-font text-black leading-tight review-btn-label">
          {label}
        </p>
        <p className="text-[11px] text-black/50 mont-medium-font review-btn-subtitle">
          Takes less than 30 seconds
        </p>
      </div>

      {/* ✨ Soft Glow */}
      <span
        className={`absolute -inset-6 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity ${
          isTrustpilot ? "bg-[#00b67a]" : "bg-[#4285f4]"
        }`}
      />
    </motion.button>
  );
}
