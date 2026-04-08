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
  const [selectedId, setSelectedId] = useState("passport");
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
      <>
        <div className="flex flex-col items-center w-full px-3">
          <label className="w-full cursor-pointer">
            <p className="mt-2 mb-1 text-gray-800 font-medium reg-font">
              {label.includes("*") ? (
                <>
                  {label.replace("*", "")}
                  <span className="text-red-500">*</span>
                </>
              ) : (
                label
              )}
            </p>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-blue-700 rounded-2xl p-2
        hover:border-blue-800 hover:shadow-md transition-all duration-300 ease-in-out
        flex flex-col items-center justify-center text-center relative min-h-[140px] bg-white"
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
                  <AiOutlineLoading3Quarters className="animate-spin text-blue-700 w-7 h-7 mb-3" />
                  <p className="text-gray-700 text-sm reg-font">Uploading...</p>
                </div>
              ) : !photo ? (
                /* 📤 Upload UI */
                <div className="flex flex-col items-center justify-center">
                  <FiUpload className="text-blue-700 w-full h-7 mb-3" />
                  <p className="text-gray-700 text-sm reg-font">
                    Click here
                    <br />
                    <span className="text-gray-400 text-xs">
                      or drag the image to upload
                    </span>
                  </p>
                </div>
              ) : (
                /* 🖼️ Preview UI */
                <div className="flex flex-col items-center">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`${label} preview`}
                    className="w-full object-contain rounded-lg mb-3"
                  />
                  <AiOutlineCheckCircle className="w-6 h-6 text-[#1F9E8C] absolute top-3 right-3" />
                </div>
              )}
            </div>
          </label>

          {/* 💡 Suggestion / helper text */}
          <p className="text-xs text-gray-500 mt-2 text-center italic">
            {suggestion}
          </p>
        </div>
      </>
    );
  };

  return (
    <>
      <StepsHeader />
      <MetaLayout canonical={`${meta_url}photo-upload/`} />
      <div className="my-14">
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
                className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 max-w-md w-full border border-white/30"
              >
                {/* Animated Check Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 15 }}
                  className="flex justify-center mb-4"
                >
                  <FaCheckCircle
                    className="text-primary"
                    color="text-[#c9b2ed]"
                    size={80}
                  />
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-primary">
                  ID successfully uploaded
                </h2>

                {/* Message */}
                <p className="text-md text-black text-center mt-3 mb-6 reg-font">
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
          className="max-w-3xl mx-auto my-auto px-6 sm:px-32 py-10 bg-white shadow-2xl rounded-3xl border border-gray-100"
        >
          <div className="mb-4 max-w-2xl mx-auto text-left">
            {/* Heading */}
            {/* <h2 className="subHeading niba-semibold-font mb-2 border-b pb-3">
                            Please upload a <span className='niba-bold-font text-black' >full body</span> picture of yourself
                        </h2> */}

            <h2 className="subHeading !text-black bold-font mb-3 border-b pb-3">
              ID verification required
            </h2>

            {/* Description */}
            <p className="text-gray-700 mb-1 reg-font">
              As an online healthcare provider, we are required by law to
              confirm that all patients are at least 18 years of age. Normally,
              these checks are completed automatically against national identity
              registers using the information you provide.
            </p>

            {/* Bullet Points */}
            {/* <ul className="list-disc pl-6 text-gray-800 text-sm space-y-2 font-normal font-sans pt-2 my-10 sm:my-0">
              <li>We will only ask for this once.</li>
              <li>
                We realise it's inconvenient, but this is a regulatory
                requirement designed for your safety and to prevent
                inappropriate use.
              </li>
            </ul> */}
            <p className="text-gray-700 mb-0 mt-6 reg-font">
              How would you like to verify your identity?
            </p>
          </div>

          {/* Dropdown */}
          <div className="flex justify-center mb-4">
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

          <div className="flex flex-wrap sm:flex-nowrap justify-center gap-6 mb-8">
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

          <div className="w-full flex justify-center">
            <button
              type="submit"
              disabled={loading || !frontPhoto}
              className={`reg-font px-6 py-3 rounded-full text-white font-semibold text-sm transition-all duration-150 ease-in-out
      flex items-center justify-center 
      ${
        loading || !frontPhoto
          ? "bg-gray-300 cursor-not-allowed"
          : "border-[#4565BF] bg-[#4565BF] hover:bg-[#4565BF] border-2 cursor-pointer"
      }
    `}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default IdVerification;
