import React, { useState } from "react";
import { FiAlertCircle, FiUpload, FiX, FiFileText } from "react-icons/fi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { HiSparkles } from "react-icons/hi";
import { BiError } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import NextButton from "@/Components/NextButton/NextButton";
import useCartStore from "@/store/useCartStore";
import {
  GetPrescriptionEvidence,
  PostPrescriptionEvidence,
} from "@/api/PrescriptionEvidenceApi";
import useAuthStore from "@/store/authStore";
import useExplanationEvidenceStore from "@/pages/useExplanationEvidenceStore";

const TopToastExplanation = () => {
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const router = useRouter();
  const { orderId } = useCartStore();
  const { token } = useAuthStore();
  const {
    explainenationEvidence,
    setExplainenationEvidence,
    setExplainenationEvidenceDetails,
    explainenationEvidenceDetails,
  } = useExplanationEvidenceStore();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { control, handleSubmit, setValue, watch, reset } = useForm();
  const description = watch("description");
  const evidence = watch("evidence");

  if (explainenationEvidence?.require_evidence) return null;

  // Compress image if needed
  const compressImage = async (file) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob)
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            else reject("Compression failed");
          },
          "image/jpeg",
          0.8,
        );
      };
      img.onerror = () => reject("Image load failed");
      img.src = url;
    });

  // Handle file upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Upload PNG, JPEG, WEBP, or PDF.");
      e.target.value = "";
      return;
    }

    if (file.type === "application/pdf") {
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`PDF file is too large (max ${MAX_SIZE_MB}MB)`);
        e.target.value = "";
        return;
      }
      setValue("evidence", file);
      setPreviewUrl(URL.createObjectURL(file));
      return;
    }

    if (file.type === "image/svg+xml") {
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`SVG file is too large (max ${MAX_SIZE_MB}MB)`);
        e.target.value = "";
        return;
      }
      setValue("evidence", file);
      setPreviewUrl(URL.createObjectURL(file));
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      try {
        const compressed = await compressImage(file);
        setValue("evidence", compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
      } catch {
        toast.error(`Image too large (max ${MAX_SIZE_MB}MB)`);
        return;
      }
    } else {
      setValue("evidence", file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
    setPreviewUrl(null);
  };

  const GetEvidence = async () => {
    try {
      const res = await GetPrescriptionEvidence({ token });
      console.log("Prescription Evidence Status", res);
      setExplainenationEvidence(res?.data?.require_evidence);
      setExplainenationEvidenceDetails(res?.data);
    } catch (error) {
      console.error("Failed to fetch prescription evidence status:", error);
    }
  };

  const onSubmit = async (data) => {
    if (!data.description) {
      toast.error("Explanation is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        order_id: orderId,
        explanation: data.description,
      };

      if (data.evidence) {
        payload.evidence = await toBase64(data.evidence);
      }

      const res = await PostPrescriptionEvidence(payload);
      if (res?.status === 200 || res?.data?.success) {
        toast.success(
          "Thank you. Your information has been submitted for clinical review. Our healthcare team will process your order and contact you if any additional details are needed.",
        );
        handleCloseModal();

        GetEvidence();
      } else {
        toast.error(res?.data?.message || "Submission failed.");
      }
    } catch (err) {
      toast.error(err.response.data.errors.evidence || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  // OWLC copy — professional clinical tone, distinct wording from Mayfair
  const getMessage = () => {
    if (explainenationEvidenceDetails.patient_type === "new") {
      return `Before this order for <span class="med-font">${explainenationEvidenceDetails?.product_name} ${explainenationEvidenceDetails.latest_dose}</span> can be approved, our clinical team requires additional information regarding your treatment history. <br/> <br/>
       As you are a new patient requesting a higher starting dose, we are required to confirm that you have previously undergone an appropriate dose titration under the care of another healthcare provider, or to obtain a clinical rationale for initiating treatment at this dose. <br/> <br/> Where available, please attach supporting documentation such as a prescription label, pharmacy packaging, or correspondence from your previous provider. This is not mandatory, but may assist in the review of your order. <br/> <br/> All orders are subject to clinical review prior to dispensing.`;
    } else {
      return `Before this order for <span class="med-font">${explainenationEvidenceDetails?.product_name} ${explainenationEvidenceDetails.latest_dose}</span> can be approved, our clinical team requires confirmation of your current treatment plan. <br/> <br/>
       As this order increases your dose, we are required to confirm that you are currently taking <span class="med-font">${explainenationEvidenceDetails.next_allowed_dose}mg</span> or above, or to obtain a clinical rationale for this dose escalation. <br/> <br/> Where available, please attach supporting documentation such as a prescription label, pharmacy packaging, or correspondence from your provider. This is not mandatory, but may assist in the review of your order. <br/> <br/> All orders are subject to clinical review prior to dispensing.`;
    }
  };

  return (
    <>
      {/* Modern Animated Toast Notification */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.6,
        }}
        className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 w-[100%] sm:w-auto max-w-2xl px-2 z-60"
      >
        <motion.div
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl  overflow-hidden"
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.25, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"
            />
          </div>

          {/* Content */}
          <div className="relative flex items-center gap-2 sm:gap-4">
            {/* Animated Icon */}
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex-shrink-0"
            >
              <div className="relative">
                <BiError className="text-xl sm:text-3xl text-white drop-shadow-lg" />
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-white rounded-full blur-md"
                />
              </div>
            </motion.div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-base bold-font">
                Action Required
              </h3>
              <p className="text-[10px] sm:text-sm text-white/95 reg-font">
                please provide the required information to complete your order
              </p>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer flex-shrink-0 px-2.5 sm:px-5 py-1.5 sm:py-2 bg-white text-amber-600 rounded-lg sm:rounded-xl font-bold bold-font text-[11px] sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-amber-50 border-2 border-white/20 whitespace-nowrap"
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal — modern centered card, no sidebar/stepper */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-[#0b1f3a]/60 z-[60] backdrop-blur-sm"
            />

            <div className="fixed inset-0 z-[70] overflow-y-auto flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                className="bg-white rounded-[28px] w-full max-w-[520px] relative my-8 overflow-hidden shadow-[0_24px_70px_-12px_rgba(20,30,60,0.35)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Ambient glow accent, signature element */}
                <div
                  className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-[0.12] pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, #4565bf, transparent 70%)",
                  }}
                />
                <div
                  className="absolute -bottom-20 -left-16 w-48 h-48 rounded-full opacity-[0.10] pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, #4db581, transparent 70%)",
                  }}
                />

                {/* Close Button */}
                <motion.button
                  onClick={handleCloseModal}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="absolute top-5 right-5 z-10 text-gray-400 hover:text-gray-600 transition cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                >
                  <FiX className="w-4 h-4" />
                </motion.button>

                <div className="relative p-7 sm:p-9 [@media(max-height:800px)]:p-5 [@media(max-height:800px)]:sm:p-6">
                  {/* Icon badge */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 22,
                      delay: 0.05,
                    }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 [@media(max-height:800px)]:w-10 [@media(max-height:800px)]:h-10 [@media(max-height:800px)]:rounded-xl [@media(max-height:800px)]:mb-3"
                    style={{
                      background: "linear-gradient(135deg, #4565bf, #5a78d1)",
                    }}
                  >
                    <FiFileText className="text-white text-xl [@media(max-height:800px)]:text-lg" />
                  </motion.div>

                  <h2 className="text-[22px] sm:text-2xl bold-font text-gray-900 mb-2 tracking-tight [@media(max-height:800px)]:text-[19px] [@media(max-height:800px)]:sm:text-xl [@media(max-height:800px)]:mb-1.5">
                    Dose Verification Required
                  </h2>

                  <div
                    className="text-gray-500 text-[13.5px] leading-relaxed reg-font mb-7 [&_.med-font]:font-semibold [&_.med-font]:text-gray-800 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [@media(max-height:800px)]:text-[13px] [@media(max-height:800px)]:leading-snug [@media(max-height:800px)]:mb-4 [@media(max-height:800px)]:max-h-[100px] [@media(max-height:800px)]:overflow-y-auto [@media(max-height:800px)]:pr-2"
                    dangerouslySetInnerHTML={{ __html: getMessage() }}
                  />

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5 [@media(max-height:800px)]:space-y-3"
                  >
                    {/* File Upload — modern compact dropzone */}
                    <div>
                      <label className="flex items-center gap-1.5 mb-1 text-gray-700 bold-font text-[13px] [@media(max-height:800px)]:mb-1.5">
                        Supporting Documentation
                        <span className="text-gray-400 text-[11px] font-normal normal-case">
                          optional
                        </span>
                      </label>
                      <p className="flex items-start gap-1.5 text-gray-500 text-[12px] leading-snug mb-3 reg-font">
                        <FiAlertCircle className="w-3.5 h-3.5 text-[#4565bf]/60 flex-shrink-0 mt-[1px]" />
                        Please upload any supporting documentation relating to
                        your previous treatment.
                      </p>
                      <Controller
                        name="evidence"
                        control={control}
                        render={() => (
                          <label className="block cursor-pointer group">
                            <input
                              type="file"
                              className="hidden"
                              accept=".png,.jpeg,.jpg,.webp,.pdf"
                              onChange={handleUpload}
                            />
                            {evidence ? (
                              <motion.div
                                initial={{ scale: 0.96, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative w-full rounded-2xl border border-gray-200 bg-gray-50/60 p-3 flex items-center gap-3 hover:border-[#4565bf]/40 transition-colors [@media(max-height:800px)]:p-2"
                              >
                                {evidence.type === "application/pdf" ? (
                                  <div className="w-12 h-12 rounded-xl bg-[#4565bf]/10 flex items-center justify-center flex-shrink-0 [@media(max-height:800px)]:w-9 [@media(max-height:800px)]:h-9">
                                    <svg
                                      className="w-5 h-5 text-[#4565bf] [@media(max-height:800px)]:w-4 [@media(max-height:800px)]:h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
                                    </svg>
                                  </div>
                                ) : (
                                  <img
                                    src={previewUrl}
                                    alt="Evidence preview"
                                    className="w-12 h-12 object-cover rounded-xl flex-shrink-0 [@media(max-height:800px)]:w-9 [@media(max-height:800px)]:h-9"
                                  />
                                )}
                                <span className="text-[13px] text-gray-700 medium-font truncate flex-1">
                                  {evidence.name}
                                </span>
                                <AiOutlineCheckCircle className="w-5 h-5 text-[#4db581] flex-shrink-0" />
                              </motion.div>
                            ) : (
                              <motion.div
                                whileHover={{ scale: 1.005 }}
                                className="w-full rounded-2xl border border-dashed border-gray-300 group-hover:border-[#4565bf]/50 group-hover:bg-[#4565bf]/[0.03] transition-all duration-200 p-4 flex items-center gap-3 [@media(max-height:800px)]:p-2.5"
                              >
                                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#4565bf]/10 flex items-center justify-center flex-shrink-0 transition-colors [@media(max-height:800px)]:w-9 [@media(max-height:800px)]:h-9">
                                  <FiUpload className="w-4 h-4 text-gray-400 group-hover:text-[#4565bf] transition-colors" />
                                </div>
                                <div>
                                  <p className="text-[13px] medium-font text-gray-600">
                                    Click to upload a document
                                  </p>
                                  <p className="text-[11px] text-gray-400 reg-font">
                                    PNG, JPEG, WEBP or PDF · max 5MB
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </label>
                        )}
                      />
                      <p className="flex items-start gap-1.5 text-gray-500 text-[12px] leading-snug mt-2.5 reg-font border-l-2 border-[#4565bf]/20 pl-2.5">
                        If you are unable to provide the evidence, please
                        provide a clinical explanation for why you are starting
                        at this dose.
                      </p>
                    </div>

                    {/* Treatment details */}
                    <div>
                      <label className="block mb-2 text-gray-700 bold-font text-[13px] [@media(max-height:800px)]:mb-1.5">
                        Treatment History
                        <span className="text-[#4565bf] ml-1">*</span>
                      </label>
                      <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <textarea
                            {...field}
                            placeholder="Please describe your current dose, the duration of treatment, and the clinical reason for this dose selection..."
                            className="w-full p-3.5 border rounded-2xl border-gray-200 focus:outline-none focus:ring-[3px] focus:ring-[#4565bf]/15 focus:border-[#4565bf] resize-none h-28 reg-font text-[13.5px] text-gray-700 transition-all duration-200 bg-gray-50/60 placeholder:text-gray-400 [@media(max-height:800px)]:p-3 [@media(max-height:800px)]:h-16 [@media(max-height:800px)]:text-[13px]"
                          />
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={loading || !description}
                      whileHover={{ scale: loading || !description ? 1 : 1.01 }}
                      whileTap={{ scale: loading || !description ? 1 : 0.98 }}
                      className={`w-full py-3.5 rounded-2xl text-white font-bold bold-font text-[15px] transition-all duration-200 [@media(max-height:800px)]:py-2.5 [@media(max-height:800px)]:text-[14px] ${
                        loading || !description
                          ? "bg-gray-200 cursor-not-allowed"
                          : "cursor-pointer bg-[#4565bf] hover:bg-[#37549c] shadow-[0_8px_20px_-6px_rgba(69,101,191,0.5)]"
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Submitting...
                        </span>
                      ) : (
                        "Submit"
                      )}
                    </motion.button>

                    <p className="text-center text-[11px] text-gray-400 reg-font !mt-3 [@media(max-height:800px)]:!mt-2">
                      All information submitted is reviewed by our clinical team
                      prior to approval.
                    </p>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopToastExplanation;
