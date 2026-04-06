import useExplanationEvidenceStore from "@/store/useExplanationEvidenceStore";
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

  const getMessage = () => {
    if (explainenationEvidenceDetails.patient_type === "new") {
      return `To complete your order for Mounjaro <span class="medium-font">${explainenationEvidenceDetails?.product_name} ${explainenationEvidenceDetails.latest_dose}</span>, please provide details about your previous treatment. As a new patient ordering a higher dose, we require confirmation that you have completed prior dose progression with another healthcare provider, or clinical justification for starting at this level. Please explain your treatment history and upload any supporting documentation from your previous provider. Our clinical team reviews each order to ensure safe and appropriate prescribing.`;
    } else {
      return `To complete your order for  <span class="medium-font">${explainenationEvidenceDetails?.product_name} ${explainenationEvidenceDetails.latest_dose}</span>, please provide details regarding your dose progression. As you are ordering a higher dose, we require confirmation that you are currently taking <span class="medium-font">${explainenationEvidenceDetails.next_allowed_dose}</span>  mg or above, or clinical justification for this dose escalation. Please explain your treatment history and upload any supporting documentation from your healthcare provider. Our clinical team reviews each order to ensure safe and appropriate prescribing.`;
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

          {/* Progress Bar Animation */}
          {/* <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 5, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-white/40 via-white/60 to-white/40 origin-left"
          /> */}
        </motion.div>
      </motion.div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-md"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[70] overflow-y-auto flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl relative my-8 border border-purple-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative Elements */}

                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.05, 0.1, 0.05],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl pointer-events-none"
                />

                {/* Close Button */}
                <motion.button
                  onClick={handleCloseModal}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer bg-gray-100 rounded-full p-2 hover:bg-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </motion.button>

                {/* Header with Icon */}
                <div className="text-center mb-6">
                  {/* <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.1,
                    }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-500 rounded-full mb-4 shadow-lg"
                  >
                    <FiFileText className="text-3xl text-white" />
                  </motion.div> */}
                  <h2 className="text-2xl sm:text-3xl bold-font text-gray-800 mb-2">
                    Dose Verification Required
                  </h2>
                  <p className="text-gray-600 text-sm thin-font">
                    <div dangerouslySetInnerHTML={{ __html: getMessage() }} />
                  </p>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 relative"
                >
                  {/* Explanation Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="flex items-center gap-2 mb-3 text-gray-700 bold-font">
                      <FiFileText className="text-purple-500" />
                      Treatment Details
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="description"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <textarea
                          {...field}
                          placeholder="Please describe your current dosage, treatment timeline, and reason for selecting this dose..."
                          className="w-full p-4 border-2 rounded-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y h-26 reg-font text-gray-700 transition-all duration-300 hover:border-purple-300 bg-gradient-to-br from-white to-purple-50/30"
                        />
                      )}
                    />
                  </motion.div>

                  {/* File Upload */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="flex items-center gap-2 mb-3 text-gray-700 bold-font">
                      <FiUpload className="text-purple-500" />
                      Upload Attachment
                      <span className="text-gray-400 text-xs font-normal">
                        (Optional)
                      </span>
                    </label>
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
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="w-full min-h-[100px] border-2 border-dashed rounded-sm flex flex-col items-center justify-center border-purple-300 transition-all p-4 bg-gradient-to-br from-purple-50 to-pink-50 group-hover:border-purple-500 group-hover:shadow-lg"
                          >
                            {evidence ? (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative w-full h-36"
                              >
                                {evidence.type === "application/pdf" ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-inner border border-red-100">
                                    <motion.svg
                                      // animate={{ y: [0, -5, 0] }}
                                      // transition={{
                                      //   duration: 2,
                                      //   repeat: Infinity,
                                      // }}
                                      className="w-14 h-14 text-red-600 mb-2"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
                                    </motion.svg>
                                    <span className="text-sm text-gray-700 medium-font truncate max-w-[200px] px-2">
                                      {evidence.name}
                                    </span>
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring" }}
                                    >
                                      <AiOutlineCheckCircle className="absolute top-2 right-2 w-8 h-8 text-green-600 bg-white rounded-full p-1 shadow-lg" />
                                    </motion.div>
                                  </div>
                                ) : (
                                  <>
                                    <img
                                      src={previewUrl}
                                      alt="Evidence preview"
                                      className="w-full h-full object-contain rounded-xl shadow-md"
                                    />
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring" }}
                                    >
                                      <AiOutlineCheckCircle className="absolute top-2 right-2 w-8 h-8 text-green-600 bg-white rounded-full p-1 shadow-lg" />
                                    </motion.div>
                                  </>
                                )}
                              </motion.div>
                            ) : (
                              <motion.div
                                animate={{ y: [0, -5, 0] }}
                                // transition={{
                                //   duration: 2,
                                //   repeat: Infinity,
                                //   ease: "easeInOut",
                                // }}
                                className="flex flex-col items-center justify-center text-purple-400"
                              >
                                <div className="relative mb-3">
                                  <FiUpload className="w-8 h-8" />
                                  <motion.div
                                    animate={{
                                      scale: [1, 1.2, 1],
                                      opacity: [0.3, 0, 0.3],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                    }}
                                    className="absolute inset-0 bg-purple-500 rounded-full blur-lg"
                                  />
                                </div>
                                <span className="text-sm font-medium medium-font mb-1">
                                  Click to upload document
                                </span>
                                <span className="text-xs text-gray-400 reg-font lowercase">
                                  PNG, JPEG, WEBP or PDF (Max 5MB)
                                </span>
                              </motion.div>
                            )}
                          </motion.div>
                        </label>
                      )}
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={loading || !description}
                      whileHover={{ scale: loading || !description ? 1 : 1.02 }}
                      whileTap={{ scale: loading || !description ? 1 : 0.98 }}
                      className={`w-full py-4  rounded-2xl text-white font-bold bold-font text-lg transition-all duration-300 shadow-lg ${
                        loading || !description
                          ? "bg-gray-300 cursor-not-allowed"
                          : "cursor-pointer bg-[#47317c] hover:bg-purple-800 hover:shadow-xl"
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Submit
                        </span>
                      )}
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopToastExplanation;
