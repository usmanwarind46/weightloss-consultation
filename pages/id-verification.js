import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import toast from "react-hot-toast";
import useReorder from "@/store/useReorderStore";
import useCartStore from "@/store/useCartStore";
import { GetImageIsUplaod } from "@/api/mergeRoutes";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import NextButton from "@/Components/NextButton/NextButton";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import StepsHeader from "@/layout/stepsHeader";
import Image from "next/image";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import PassCard from "@/public/images/passcard.png";
import Driving from "@/public/images/driving.png";
import Passport from "@/public/images/passport.png";
import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import {
  GetIdVerification,
  IdVerificationUpload,
} from "@/api/IdVerificationApi";
import useImageUploadStore from "@/store/useImageUploadStore ";
import MUISelectField from "@/Components/SelectField/SelectField";
import { heicTo, isHeic } from "heic-to"; // ✅ import heic converter
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import PageLoader from "@/Components/PageLoader/PageLoader";

const IdVerification = () => {
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // ✅ Compress image using <canvas>
  const compressImage = (file, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) resolve(blob);
            else reject(new Error("Image compression failed."));
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image for compression."));
      };
      img.src = objectUrl;
    });
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // remove `data:image/...;base64,`
      reader.onerror = reject;
    });

  const GO = useRouter();
  const [open, setOpen] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  const searchParams = useSearchParams();
  const [orderIdGetUrl, setOrderIdGetUrl] = useState(null);

  const { reorder } = useReorder();
  const { control, setValue, handleSubmit, watch } = useForm();
  const { orderId } = useCartStore();
  const frontPhoto = watch("frontPhoto");
  const sidePhoto = watch("sidePhoto");
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("id_card");
  const [ImagesSend, setImagesSend] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Return to Dashboard");

  const { idVerificationUpload, setIdVerificationUpload } =
    useIdVerificationUploadStore();
  const { imageUploaded, setImageUploaded } = useImageUploadStore();

  const idImages = {
    passport: Passport,
    driving_license: Driving,
    pass_card: PassCard,
    id_card: PassCard,
  };

  useEffect(() => {
    const param = searchParams.get("order_id");
    if (param) {
      const parsedId = parseInt(param, 10);
      if (!isNaN(parsedId)) {
        setOrderIdGetUrl(parsedId); // ✅ store in Zustand + localStorage
      }
    }
  }, [searchParams, setOrderIdGetUrl]);

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetIdVerification({ order_id: orderId });
        console.log("Image Upload Response", res);

        setIdVerificationUpload(res?.data?.status);
        setImagesSend(res?.data?.status);
        console.log(res, "Image Upload Status");
      } catch (error) {
        console.error("Failed to fetch image status:", error);
      }
    };

    if (orderId) fetchImageStatus();
  }, [orderId]);

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({ order_id: orderId });
        console.log("Image Upload Response", res);
        setImageUploaded(res?.data?.status);
        setImagesSend(res?.data?.status);
        console.log(res, "Image Upload Status");
      } catch (error) {
        console.error("Failed to fetch image status:", error);
      }
    };
    if (orderId) fetchImageStatus();
  }, [orderId]);

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // start loader for that specific box
    setLoadingPhoto((prev) => ({ ...prev, [type]: true }));

    try {
      if (!file.type.startsWith("image/") && !isHeic(file)) {
        toast.error("Please upload a valid image (JPEG, PNG, or HEIC).");
        e.target.value = "";
        return;
      }

      let processedFile = file;

      if (isHeic(file)) {
        try {
          processedFile = await heicTo({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
          });
        } catch (err) {
          if (file.size === 0 || !file.type) {
            toast.error(
              "This file appears to be corrupted. Please try another image.",
            );
            e.target.value = "";
            return;
          }
          console.log("HEIC conversion failed — using original file instead.");
        }
      }

      if (processedFile.size > MAX_SIZE_BYTES) {
        const compressedBlob = await compressImage(processedFile, 0.8);
        if (compressedBlob.size > MAX_SIZE_BYTES) {
          toast.error(
            `Image too large even after compression (max ${MAX_SIZE_MB} MB).`,
          );
          e.target.value = "";
          return;
        }
        processedFile = new File([compressedBlob], file.name, {
          type: "image/jpeg",
        });
      }

      setValue(type, processedFile);
    } catch (err) {
      toast.error("Something went wrong while processing this image.");
      e.target.value = "";
    } finally {
      // stop loader for that box
      setLoadingPhoto((prev) => ({ ...prev, [type]: false }));
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!data.frontPhoto) {
        toast.error("Please upload a front image.");
        return;
      }

      setLoading(true);

      const frontBase64 = await toBase64(data.frontPhoto);

      let payload = {
        front: frontBase64,
        order_id: orderIdGetUrl ? orderIdGetUrl : orderId,
        type: selectedId,
      };

      if (data.sidePhoto) {
        const sideBase64 = await toBase64(data.sidePhoto);
        payload.side = sideBase64; // ✅ Only include if uploaded
      }

      console.log(payload, "Form Data");

      const res = await IdVerificationUpload(payload);

      if (res?.status === 200) {
        setOpen(true);
        setButtonLabel(
          !imageUploaded ? "Upload full body photo" : "Return to Dashboard",
        );
      }
    } catch (error) {
      console.log(error?.response?.data?.errors?.front, "Upload Error");

      if (error?.response?.data?.errors?.front) {
        toast.error(error?.response?.data?.errors?.front);
      }

      if (error?.response?.data?.errors?.side) {
        toast.error(error?.response?.data?.errors?.side);
      }
      if (error?.response?.data?.message === "Unauthenticated.") {
        toast.error("Failed to upload images. Please Login again.");
        GO.push("/login");
      }
      if (error?.response?.data?.errors?.Order === "Order not found") {
        toast.error(error?.response?.data?.errors?.Order);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    if (!imageUploaded) {
      GO.push("/photo-upload");
    } else {
      GO.push("/dashboard");
    }
  };

  const renderUploadBox = (label, photo, type, placeholderUrl, suggestion) => {
    const handleDrop = (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];

        // ✅ Only allow images
        if (file.type.startsWith("image/")) {
          setValue(type, file);
        } else {
          toast.error("Only image files are allowed.");
        }
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    return (
      <div className="w-full">
        <p className="inter-medium-font mb-2 text-[13px] text-slate-800">
          {label.includes("*") ? (
            <>
              {label.replace("*", "")}
              <span className="text-red-500">*</span>
            </>
          ) : (
            label
          )}
        </p>

        <label className="block w-full cursor-pointer rounded-xl focus-within:ring-2 focus-within:ring-[#4565BF]/25 focus-within:ring-offset-2">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative flex min-h-[164px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#9db3e8] bg-[#f4f6fd] px-5 py-6 text-center transition-all duration-200 hover:border-[#4565BF] hover:bg-[#eef1fb]"
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, type)}
              className="hidden"
            />

            {/* 🔄 Loading state */}
            {loadingPhoto[type] ? (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#4565BF]/10">
                  <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin text-[#4565BF]" />
                </div>
                <p className="inter-medium-font text-sm text-slate-700">Uploading...</p>
              </div>
            ) : !photo ? (
              /* 📤 Upload UI */
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#4565BF] shadow-sm ring-1 ring-[#4565BF]/10">
                  <FiUpload className="h-5 w-5" />
                </div>
                <p className="inter-semibold-font text-[14px] text-slate-800">
                  Choose a photo
                </p>
                <p className="inter-reg-font mt-1 text-[12px] leading-5 text-slate-500">
                  Tap to browse, or drag the image here
                </p>
              </div>
            ) : (
              /* 🖼️ Preview UI */
              <div className="relative my-1 w-full max-w-[240px]">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`${label} preview`}
                  className="h-36 w-full rounded-xl bg-white object-contain shadow-sm ring-1 ring-slate-200"
                />
                <AiOutlineCheckCircle className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white text-emerald-500" />
              </div>
            )}
          </div>
        </label>

        {/* 💡 Suggestion / helper text */}
        {suggestion && (
          <p className="inter-reg-font mt-3 text-center text-[11px] leading-5 text-slate-500 italic">
            {suggestion}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <StepsHeader />
      <MetaLayout canonical={`${meta_url}photo-upload/`} />
      {loading && (
        <PageLoader message="Please wait while your ID images are being uploaded..." />
      )}
      <main className="min-h-[calc(100vh-66px)] bg-[#EEF2FA] px-4 py-8 sm:py-12">
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative mx-4 w-full max-w-md rounded-2xl border border-[#4565BF]/10 bg-white p-7 shadow-[0_20px_60px_rgba(30,20,60,0.18)] sm:p-8"
              >
                {/* Animated Check Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 15 }}
                  className="flex justify-center mb-4"
                >
                  <FaCheckCircle className="text-[#4565BF]" size={64} />
                </motion.div>

                {/* Title */}
                <h2 className="inter-semibold-font text-center text-[22px] text-slate-900">
                  ID successfully uploaded
                </h2>

                {/* Message */}
                <p className="inter-reg-font mb-6 mt-3 text-center text-[14px] leading-6 text-slate-600">
                  {!imageUploaded
                    ? "Your ID Verification photo have been uploaded and are now under review by our prescribers. Seems like your full body photo is still pending. Please upload it to proceed."
                    : "Your ID has been uploaded and are now under review by our prescribers. We’ll approve your order once the review is complete and notify you straight away."}
                </p>

                {/* Button */}
                <NextButton
                  label={buttonLabel}
                  onClick={handleRedirect}
                  className="w-full"
                  // disabled={loading || !frontPhoto || !sidePhoto}
                  // loading={loading}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto w-full max-w-[620px] rounded-2xl border border-[#4565BF]/10 bg-white px-5 py-6 shadow-[0_12px_36px_rgba(69,101,191,0.09)] sm:px-8 sm:py-8"
        >
          <div className="mb-6 text-left">
            {/* Heading */}
            <h1 className="inter-semibold-font text-[21px] leading-[1.3] tracking-[-0.02em] text-slate-900 sm:text-[23px]">
              ID verification required
            </h1>

            {/* Description */}
            <p className="inter-reg-font mt-2 text-[13.5px] leading-6 text-slate-500">
              As an online healthcare provider, we are required by law to
              confirm that all patients are at least 18 years of age. Normally,
              these checks are completed automatically against national identity
              registers using the information you provide.
            </p>

            <p className="inter-medium-font mt-5 text-[13.5px] text-slate-700">
              How would you like to verify your identity?
            </p>
          </div>

          {/* Dropdown */}
          <div className="mb-6">
            <div className="w-full">
              <MUISelectField
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                options={[
                  { value: "passport", label: "Passport" },
                  { value: "driving_license", label: "Driving License" },
                  {
                    value: "pass_card",
                    label: "Proof of age card (e.g. PASS card)",
                  },
                  { value: "id_card", label: "Government-issued ID card" },
                ]}
              />
            </div>
          </div>

          {/* Image Preview */}
          {/* <div className="flex justify-center sm:gap-4 mb-8">
            <div className="flex flex-col items-center mx-0 sm:mx-3">
              <Image
                src={idImages[selectedId]}
                alt={selectedId}
                className="w-4xl h-full object-cover rounded-lg"
              />
            </div>
          </div> */}

          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Controller
              name="frontPhoto"
              control={control}
              defaultValue={null}
              render={() =>
                renderUploadBox(
                  "Front*",
                  frontPhoto,
                  "frontPhoto",
                  "/images/front_image.png",
                )
              }
            />

            <Controller
              name="sidePhoto"
              control={control}
              defaultValue={null}
              render={() =>
                renderUploadBox(
                  "Back (optional)",
                  sidePhoto,
                  "sidePhoto",
                  "/images/side_image.png",
                )
              }
            />

            {/* <Controller
                        name="sidePhoto"
                        control={control}
                        defaultValue={null}
                        render={() =>
                            renderUploadBox(
                                'Side Photo',
                                sidePhoto,
                                'sidePhoto',
                                '/images/side_image.png',
                                'Stand sideways with good posture and full body visible.'
                            )
                        }
                    /> */}
          </div>

          <div className="w-full">
            <button
              type="submit"
              disabled={loading || !frontPhoto}
              className={`inter-semibold-font flex min-h-[54px] w-full items-center justify-center rounded-xl px-6 py-3 text-[15px] text-white transition-all duration-200
      ${
        loading || !frontPhoto
          ? "cursor-not-allowed bg-slate-200 text-slate-400"
          : "cursor-pointer bg-[#4565BF] shadow-[0_8px_20px_rgba(69,101,191,0.18)] hover:bg-[#3550a0] active:scale-[0.99]"
      }
    `}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default IdVerification;
