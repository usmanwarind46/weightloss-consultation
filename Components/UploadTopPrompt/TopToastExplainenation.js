import React, { useState } from "react";
import { FiAlertCircle, FiUpload, FiX, FiFileText } from "react-icons/fi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { HiSparkles } from "react-icons/hi";
import { BiError } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
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

            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              reject("Compression failed");
            }
          },
          "image/jpeg",
          0.8,
        );
      };

      img.onerror = () => reject("Image load failed");
      img.src = url;
    });

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

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
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

    if (file.size > MAX_SIZE_BYTES) {
      try {
        const compressed = await compressImage(file);
        setValue("evidence", compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
      } catch {
        toast.error(`Image too large (max ${MAX_SIZE_MB}MB)`);
        e.target.value = "";
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

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

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
      toast.error(
        err?.response?.data?.errors?.evidence || "Submission failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getMessage = () => {
    if (explainenationEvidenceDetails?.patient_type === "new") {
      return `Before this order for <span class="med-font">${explainenationEvidenceDetails?.product_name} ${explainenationEvidenceDetails?.latest_dose}</span> can be approved, our clinical team requires additional information regarding your treatment history. <br/> <br/>
       As you are a new patient requesting a higher starting dose, we are required to confirm that you have previously undergone an appropriate dose titration under the care of another healthcare provider, or to obtain a clinical rationale for initiating treatment at this dose. <br/> <br/> Where available, please attach supporting documentation such as a prescription label, pharmacy packaging, or correspondence from your previous provider. This is not mandatory, but may assist in the review of your order. <br/> <br/> All orders are subject to clinical review prior to dispensing.`;
    } else {
      return `Before this order for <span class="med-font">${explainenationEvidenceDetails?.product_name} ${explainenationEvidenceDetails?.latest_dose}</span> can be approved, our clinical team requires confirmation of your current treatment plan. <br/> <br/>
       As this order increases your dose, we are required to confirm that you are currently taking <span class="med-font">${explainenationEvidenceDetails?.next_allowed_dose}mg</span> or above, or to obtain a clinical rationale for this dose escalation. <br/> <br/> Where available, please attach supporting documentation such as a prescription label, pharmacy packaging, or correspondence from your provider. This is not mandatory, but may assist in the review of your order. <br/> <br/> All orders are subject to clinical review prior to dispensing.`;
    }
  };

  return (
    <>
      {/* Center Medical Floating Alert */}
      <motion.div
        initial={{ y: -28, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 24,
        }}
        className="fixed left-1/2 top-3 z-[60] w-[calc(100%-20px)] max-w-[760px] -translate-x-1/2 sm:top-5 sm:w-[calc(100%-32px)]"
      >
        <div className="relative overflow-hidden rounded-[22px] border border-[#bcd0ff] bg-gradient-to-br from-[#eaf2ff] via-[#edf5ff] to-[#dbe8ff] shadow-[0_22px_70px_-38px_rgba(37,71,171,0.95)] backdrop-blur-xl">
          <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-b from-[#163884] via-[#4565bf] to-[#8ab0ff]" />

          <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#4565bf]/16 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-20 h-36 w-36 rounded-full bg-[#7da4ff]/22 blur-3xl" />

          <div className="relative flex flex-col gap-3 px-4 py-4 pl-5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 sm:pl-7">
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[18px] border border-[#b8ccff] bg-[#dce9ff] text-[#4565bf] shadow-sm"
              >
                <BiError className="text-[25px]" />
              </motion.div>

              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="bold-font text-[14px] leading-tight text-[#0f172a] sm:text-[16px]">
                    Action Required
                  </h3>

                  {/* <span className="reg-font rounded-full border border-[#4565bf]/15 bg-[#4565bf]/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-[#4565bf]">
                    Clinical Review
                  </span> */}
                </div>

                <p className="reg-font text-[12px] leading-snug text-[#52617a] sm:text-[13px]">
                  Please provide the required information to complete your
                  order.
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => setShowModal(true)}
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="bold-font w-full cursor-pointer rounded-[14px] bg-[#4565bf] px-5 py-3 text-[13px] text-white shadow-[0_15px_30px_-18px_rgba(69,101,191,1)] transition hover:bg-[#3654aa] sm:w-auto sm:px-6"
            >
              Continue
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={handleCloseModal}
              className="fixed inset-0 z-[70] bg-[#061326]/75 backdrop-blur-[7px]"
            />

            <div className="fixed inset-0 z-[80] flex items-stretch justify-center overflow-y-auto bg-transparent p-0 sm:items-center sm:px-5 sm:py-7">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 18 }}
                transition={{
                  type: "spring",
                  stiffness: 330,
                  damping: 32,
                }}
                onClick={(e) => e.stopPropagation()}
                className="relative flex h-[100dvh] w-full max-w-[960px] overflow-hidden bg-white shadow-[0_34px_120px_-48px_rgba(0,0,0,0.9)] sm:h-auto sm:max-h-[94dvh] sm:rounded-[26px]"
              >
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex min-h-0 w-full flex-col overflow-hidden"
                >
                  {/* Improved Responsive Header */}
                  <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#102e75] via-[#4565bf] to-[#6f94ed] text-white">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_8%_90%,rgba(255,255,255,0.16),transparent_30%)]" />
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#b8caff]/20 blur-3xl" />

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="absolute right-3 top-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-[14px] border border-white/20 bg-white/12 text-white shadow-sm backdrop-blur transition hover:bg-white/20 sm:right-5 sm:top-5"
                    >
                      <FiX className="h-4 w-4" />
                    </button>

                    <div className="relative px-4 pb-7 pt-7 sm:px-7 sm:pb-9 sm:pt-8 lg:pb-10">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 pr-11 sm:pr-12 lg:pr-4">
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="reg-font inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-white shadow-sm backdrop-blur">
                              <HiSparkles className="text-[13px]" />
                              Medical Review
                            </span>

                            <span className="reg-font rounded-full bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-[#4565bf] shadow-sm">
                              Secure Submission
                            </span>
                          </div>

                          <div className="flex items-start gap-4">
                            <div className="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-[18px] border border-white/20 bg-white/14 text-white shadow-sm backdrop-blur sm:flex">
                              <FiFileText className="text-2xl" />
                            </div>

                            <div className="min-w-0">
                              <p className="reg-font mb-1 text-[11px] uppercase tracking-[0.18em] text-white/75 sm:text-[12px]">
                                Clinical Dose Review
                              </p>

                              <h2 className="bold-font max-w-[640px] text-[25px] leading-[1.14] tracking-[-0.035em] text-white sm:text-[32px] lg:text-[35px]">
                                Evidence of Previous Treatment Required
                              </h2>

                              <p className="reg-font mt-3 max-w-[650px] text-[13px] leading-relaxed text-white/78 sm:text-[14px]">
                                Please provide the information below so our
                                clinical team can safely review your order.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="min-h-0 flex-1 overflow-y-auto bg-[#f5f8ff] px-3 py-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#4565bf]/30 [&::-webkit-scrollbar-track]:bg-transparent sm:px-5 sm:py-5 lg:px-7">
                    {/* Information Box */}
                    <div className="mb-4 overflow-hidden rounded-[18px] border border-[#dbe7ff] bg-white shadow-[0_16px_48px_-40px_rgba(69,101,191,0.9)] sm:mb-5 sm:rounded-[20px]">
                      <div className="flex flex-col gap-3 border-b border-[#e5edff] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#eef5ff] text-[#4565bf]">
                            <FiAlertCircle className="text-lg" />
                          </div>

                          <div>
                            <p className="bold-font text-[13px] text-[#0f172a] sm:text-sm">
                              Clinical Review Information
                            </p>

                            <p className="reg-font mt-0.5 text-[11.5px] text-gray-500">
                              Please read this before submission
                            </p>
                          </div>
                        </div>

                        <span className="reg-font w-fit rounded-[10px] bg-[#4565bf]/10 px-3 py-1.5 text-[11px] text-[#4565bf]">
                          Important
                        </span>
                      </div>

                      <div
                        className="reg-font p-4 text-[13px] leading-[1.8] text-gray-600 [&_.med-font]:font-semibold [&_.med-font]:text-[#4565bf] sm:p-5 sm:text-[13.5px]"
                        dangerouslySetInnerHTML={{ __html: getMessage() }}
                      />
                    </div>

                    {/* Supporting Documentation */}
                    <div className="mb-4 w-full rounded-[18px] border border-[#dbe7ff] bg-white p-4 shadow-[0_16px_48px_-42px_rgba(69,101,191,0.9)] sm:mb-5 sm:rounded-[20px] sm:p-5">
                      <div className="mb-4">
                        <label className="bold-font flex flex-wrap items-center gap-2 text-[14px] text-[#0f172a] sm:text-[15px]">
                          Supporting Documentation
                          <span className="reg-font rounded-full border border-[#4565bf]/15 bg-[#4565bf]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#4565bf]">
                            Optional
                          </span>
                        </label>

                        <p className="reg-font mt-1.5 max-w-[720px] text-[12px] leading-relaxed text-gray-500 sm:text-[13px]">
                          Please upload any supporting documentation relating to
                          your previous treatment.
                        </p>
                      </div>

                      <Controller
                        name="evidence"
                        control={control}
                        render={() => (
                          <label className="block cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".png,.jpeg,.jpg,.webp,.pdf"
                              onChange={handleUpload}
                            />

                            {evidence ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col gap-3 rounded-[18px] border border-[#4565bf]/20 bg-[#f6f9ff] p-3 transition hover:border-[#4565bf]/35 sm:flex-row sm:items-center sm:p-4"
                              >
                                {evidence.type === "application/pdf" ? (
                                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[16px] bg-white text-[#4565bf] shadow-sm">
                                    <FiFileText className="text-2xl" />
                                  </div>
                                ) : (
                                  <img
                                    src={previewUrl}
                                    alt="Evidence preview"
                                    className="h-16 w-16 flex-shrink-0 rounded-[16px] object-cover sm:h-14 sm:w-14"
                                  />
                                )}

                                <div className="min-w-0 flex-1">
                                  <p className="medium-font truncate text-[13px] text-[#0f172a] sm:text-sm">
                                    {evidence.name}
                                  </p>

                                  <p className="reg-font mt-1 text-[11.5px] text-gray-500">
                                    File attached successfully
                                  </p>
                                </div>

                                <AiOutlineCheckCircle className="h-6 w-6 flex-shrink-0 text-[#4565bf]" />
                              </motion.div>
                            ) : (
                              <motion.div
                                whileHover={{ scale: 1.003 }}
                                className="rounded-[18px] border border-dashed border-[#4565bf]/35 bg-[#f6f9ff] p-4 transition hover:border-[#4565bf] hover:bg-white hover:shadow-[0_18px_44px_-36px_rgba(69,101,191,0.95)] sm:p-5"
                              >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[16px] bg-white text-[#4565bf] shadow-sm ring-1 ring-[#4565bf]/15">
                                    <FiUpload className="h-6 w-6" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="medium-font text-[14px] text-[#0f172a]">
                                      Upload supporting file
                                    </p>

                                    <p className="reg-font mt-1 text-[12px] leading-relaxed text-gray-500">
                                      PNG, JPEG, WEBP or PDF · max 5MB
                                    </p>
                                  </div>

                                  <span className="bold-font hidden rounded-[12px] bg-[#4565bf] px-4 py-2.5 text-xs text-white shadow-[0_12px_24px_-18px_rgba(69,101,191,1)] sm:inline-flex">
                                    Browse file
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </label>
                        )}
                      />

                      <p className="reg-font mt-4 rounded-[16px] border border-[#dbe7ff] bg-[#f7faff] px-4 py-3 text-[12px] leading-relaxed text-gray-600 sm:text-[12.5px]">
                        If you are unable to provide the evidence, please
                        provide a clinical explanation for why you are starting
                        at this dose.
                      </p>
                    </div>

                    {/* Treatment History */}
                    <div className="w-full rounded-[18px] border border-[#dbe7ff] bg-white p-4 shadow-[0_16px_48px_-42px_rgba(69,101,191,0.9)] sm:rounded-[20px] sm:p-5">
                      <div className="mb-4">
                        <label className="bold-font block text-[14px] text-[#0f172a] sm:text-[15px]">
                          Treatment History
                        </label>

                        <p className="reg-font mt-1.5 max-w-[720px] text-[12px] leading-relaxed text-gray-500 sm:text-[13px]">
                          Add your current dose, treatment duration, and the
                          clinical reason for this dose selection.
                        </p>
                      </div>

                      <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <textarea
                            {...field}
                            placeholder="Please describe your current dose, the duration of treatment, and the clinical reason for this dose selection..."
                            className="reg-font min-h-[140px] w-full resize-none rounded-[18px] border border-[#d9e5ff] bg-[#f8fbff] p-4 text-[13.5px] leading-relaxed text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#4565bf] focus:bg-white focus:ring-4 focus:ring-[#4565bf]/12 sm:min-h-[180px] sm:p-5"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="shrink-0 border-t border-[#dbe7ff] bg-white px-3 py-3 sm:px-5 sm:py-4 lg:px-7">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="reg-font order-2 text-center text-[11px] leading-snug text-gray-400 md:order-1 md:max-w-[430px] md:text-left">
                        All information submitted is reviewed by our clinical
                        team prior to approval.
                      </p>

                      <motion.button
                        type="submit"
                        disabled={loading || !description}
                        whileHover={{
                          scale: loading || !description ? 1 : 1.01,
                        }}
                        whileTap={{
                          scale: loading || !description ? 1 : 0.98,
                        }}
                        className={`bold-font order-1 w-full rounded-[16px] px-6 py-3.5 text-[15px] text-white transition md:order-2 md:w-auto md:min-w-[220px] ${
                          loading || !description
                            ? "cursor-not-allowed bg-gray-300"
                            : "cursor-pointer bg-[#4565bf] shadow-[0_16px_34px_-20px_rgba(69,101,191,1)] hover:-translate-y-0.5 hover:bg-[#3654aa] hover:shadow-[0_22px_44px_-26px_rgba(69,101,191,1)]"
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                            />
                            Submitting...
                          </span>
                        ) : (
                          "Submit"
                        )}
                      </motion.button>
                    </div>
                  </div>
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
