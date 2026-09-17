import React, { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import toast from "react-hot-toast";
import useReorder from "@/store/useReorderStore";
import { ImageUplaodApi } from "@/api/mergeRoutes";
import useCartStore from "@/store/useCartStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import { GetImageIsUplaod } from "@/api/mergeRoutes";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import NextButton from "@/Components/NextButton/NextButton";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import StepsHeader from "@/layout/stepsHeader";
import FullBody from "@/public/images/full-body-ok.png";
import HalfBodyX from "@/public/images/half-body-x.png";
import FaceX from "@/public/images/face-x.png";
import Image from "next/image"; // ✅ renamed
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import { GetIdVerification } from "@/api/IdVerificationApi";
import { heicTo, isHeic } from "heic-to"; // ✅ import heic converter
import { MdDelete } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { UploadPhotoLogs } from "@/api/mergeRoutes";

// ✅ Allowed file types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
];

// ✅ Separate UploadBox component to properly use hooks and fix memory leak
const UploadBox = ({
  label,
  photo,
  type,
  placeholderUrl,
  suggestion,
  loadingPhoto,
  onUpload,
  onSetValue,
  onRemove,
  inputRef,
}) => {
  // ✅ FIX: Memoize blob URL — only created once per photo, not on every render
  const photoUrl = useMemo(() => {
    if (!photo || !(photo instanceof File)) return null;
    return URL.createObjectURL(photo);
  }, [photo]);

  // ✅ FIX: Revoke old blob URL when photo changes or component unmounts — stops memory leak
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  // const handleDrop = (e) => {
  //   e.preventDefault();
  //   if (e.dataTransfer.files && e.dataTransfer.files[0]) {
  //     const file = e.dataTransfer.files[0];

  //     // ✅ FIX: Validate here directly — do NOT call handleUpload with a fake synthetic event
  //     const isPdf = file.type === "application/pdf";
  //     const isAllowedImage = ALLOWED_TYPES.includes(file.type);

  //     if (!isPdf && !isAllowedImage) {
  //       toast.error(
  //         "Only JPEG, PNG, WEBP, HEIC, HEIF, AVIF, or PDF files are allowed.",
  //       );
  //       return;
  //     }

  //     // ✅ Call parent handleUpload with a safe event-like object
  //     onUpload({ target: { files: [file], value: "" } }, type);
  //   }
  // };

  // const handleDragOver = (e) => {
  //   e.preventDefault();
  // };

  return (
    <div className="w-full">
      <div className="relative w-full">
        <label className="block w-full cursor-pointer rounded-xl focus-within:ring-2 focus-within:ring-[#4565BF]/25 focus-within:ring-offset-2">
          <div className="relative flex min-h-[164px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#9db3e8] bg-[#f4f6fd] px-5 py-6 text-center transition-all duration-200 hover:border-[#4565BF] hover:bg-[#eef1fb]">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/avif,application/pdf"
              onChange={(e) => onUpload(e, type)}
              className="hidden"
            />

            {loadingPhoto ? (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#4565BF]/10">
                  <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin text-[#4565BF]" />
                </div>
                <p className="inter-medium-font text-sm text-slate-700">
                  Uploading...
                </p>
              </div>
            ) : !photo ? (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#4565BF] shadow-sm ring-1 ring-[#4565BF]/10">
                  <FiUpload className="h-5 w-5" />
                </div>
                <p className="inter-semibold-font text-[14px] text-slate-800">
                  Choose a full-body photo
                </p>
                <p className="inter-reg-font mt-1 text-[12px] leading-5 text-slate-500">
                  Tap to browse files from your device
                </p>
              </div>
            ) : (
              <div className="relative flex w-full flex-col items-center">
                {photo?.type === "application/pdf" ? (
                  <div className="my-1 flex h-36 w-full max-w-[240px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mb-2 h-9 w-9 text-red-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                    </svg>
                    <p className="inter-reg-font w-full truncate px-3 text-center text-xs text-slate-600">
                      {photo?.name}
                    </p>
                  </div>
                ) : (
                  <img
                    src={photoUrl}
                    alt={`${label} preview`}
                    className="my-1 h-36 w-full max-w-[240px] rounded-xl bg-white object-contain shadow-sm ring-1 ring-slate-200"
                  />
                )}
              </div>
            )}
          </div>
        </label>

        {/* ✅ Delete button — label ke BAHAR, tabhi kaam karega */}
        {photo && !loadingPhoto && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(type);
            }}
            className="absolute -right-2 -top-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-red-600 shadow-md ring-1 ring-red-100 transition-colors duration-200 hover:bg-red-50"
            title="Remove photo"
          >
            <RxCross2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="inter-reg-font mt-3 text-center text-[11px] leading-5 text-slate-500">
        JPEG, PNG, WEBP, HEIC, HEIF, AVIF or PDF · Maximum 30 MB
      </p>
    </div>
  );
};

const PhotoUpload = () => {
  const MAX_SIZE_MB = 30;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const logError = (message) => {
    toast.error(message);
    UploadPhotoLogs({ message }).catch((err) =>
      console.error("Failed to log error:", err),
    );
  };

  const frontPhotoInputRef = React.useRef(null);

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

  // const toBase64 = (file) =>
  //   new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result.split(",")[1]); // remove `data:image/...;base64,`
  //     reader.onerror = reject;
  //   });

  const GO = useRouter();
  const [open, setOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  // get Order id url to send photo uplaod api
  const searchParams = useSearchParams();
  const [orderIdGetUrl, setOrderIdGetUrl] = useState(null);

  const { reorder } = useReorder();
  const { control, setValue, handleSubmit, watch } = useForm();
  const { orderId } = useCartStore();
  const frontPhoto = watch("frontPhoto");
  const sidePhoto = watch("sidePhoto");
  const [loading, setLoading] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [ImagesSend, setImagesSend] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Return to Dashboard");

  const { imageUploaded, setImageUploaded } = useImageUploadStore();
  const { idVerificationUpload, setIdVerificationUpload } =
    useIdVerificationUploadStore();

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
        const res = await GetImageIsUplaod({ order_id: orderId });
        console.log("Image Upload Response", res);

        setImageUploaded(res?.data?.status);
        setImagesSend(res?.data?.status);
        console.log(res, "Image Upload Status");

        if (!idVerificationUpload) {
          setButtonLabel("Upload ID verification photo");
        } else {
          setButtonLabel("Return to Dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch image status:", error);
      }
    };

    if (orderId) fetchImageStatus();
  }, [orderId]);

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

  // ✅ Handle upload + conversion + compression
  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const blockedExtensions = [
      ".exe",
      ".bat",
      ".sh",
      ".cmd",
      ".msi",
      ".dll",
      ".js",
      ".ts",
      ".php",
      ".py",
      ".rb",
      ".zip",
      ".rar",
      ".tar",
      ".gz",
      ".mp4",
      ".mp3",
    ];
    const hasBlockedExtension = blockedExtensions.some((ext) =>
      fileName.endsWith(ext),
    );

    if (hasBlockedExtension) {
      logError(
        // "Only JPEG, PNG, WEBP, HEIC, HEIF, AVIF, or PDF files are allowed.",
        "The file must be an image (jpeg, png, webp, heic, heif, avif) or a pdf.",
      );
      if (e.target.value !== undefined) e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      logError(`File too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`);
      if (e.target.value !== undefined) e.target.value = "";
      return;
    }

    try {
      const isPdf = file.type === "application/pdf";
      const isAllowedImage = ALLOWED_TYPES.includes(file.type) || isHeic(file);

      if (!isPdf && !isAllowedImage) {
        logError(
          "Only JPEG, PNG, WEBP, HEIC, HEIF, AVIF, or PDF files are allowed.",
        );
        if (e.target.value !== undefined) e.target.value = "";
        setValue(type, null);
        return;
      }

      setLoadingPhoto(true);

      // ✅ Handle PDF — no compression or HEIC conversion needed
      if (isPdf) {
        if (file.size > MAX_SIZE_BYTES) {
          logError(`PDF too large (max ${MAX_SIZE_MB} MB).`);
          if (e.target.value !== undefined) e.target.value = "";
          return;
        }
        setValue(type, file);
        return;
      }

      let processedFile = file;

      // ✅ Try HEIC conversion
      if (isHeic(file)) {
        try {
          // ✅ FIX: wrap heicTo result in a File so instanceof File check passes and preview works
          const heicBlob = await heicTo({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
          });
          processedFile = new File(
            [heicBlob],
            file.name.replace(/\.heic$/i, ".jpg"),
            { type: "image/jpeg" },
          );
        } catch (err) {
          console.warn("HEIC conversion failed:", err);

          // 🚫 Block completely if file seems corrupted
          if (file.size === 0 || !file.type || file.name === "") {
            logError(
              "This file appears to be corrupted. Please try another image.",
            );
            if (e.target.value !== undefined) e.target.value = "";
            return;
          }

          // Otherwise continue using the original HEIC file
          console.log("HEIC conversion failed — using original file instead.");
        }
      }

      // ✅ Compress large files
      if (processedFile.size > MAX_SIZE_BYTES) {
        const compressedBlob = await compressImage(processedFile, 0.8);

        if (compressedBlob.size > MAX_SIZE_BYTES) {
          logError(
            `Image too large even after compression (max ${MAX_SIZE_MB} MB).`,
          );
          if (e.target.value !== undefined) e.target.value = "";
          return;
        }

        processedFile = new File([compressedBlob], file.name, {
          type: "image/jpeg",
        });
      }

      // ✅ All checks passed
      setValue(type, processedFile);
      console.log("✅ Final processed file:", processedFile);
    } catch (err) {
      console.error("Error processing image:", err);
      logError("Something went wrong while processing this image.");
      if (e.target.value !== undefined) e.target.value = "";
    } finally {
      setLoadingPhoto(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!data.frontPhoto) {
        logError("Please upload Front images.");
        return;
      }
      // setLoading(true); // Start loading
      // const frontBase64 = await toBase64(data.frontPhoto);

      // const payload = {
      //   front: frontBase64,
      //   order_id: orderIdGetUrl ? orderIdGetUrl : orderId,
      // };

      // const res = await ImageUplaodApi(payload);

      setLoading(true);

      const formData = new FormData();
      formData.append("front", data.frontPhoto);
      formData.append("order_id", orderIdGetUrl ? orderIdGetUrl : orderId);

      const res = await ImageUplaodApi(formData);

      setShowLoader(true);

      if (res?.status === 200) {
        // toast.success("Photos uploaded successfully!");
        setOpen(true);
        if (frontPhotoInputRef.current) frontPhotoInputRef.current.value = "";
        if (!idVerificationUpload) {
          setButtonLabel("Upload ID verification photo");
        } else {
          setButtonLabel("Return to Dashboard");
        }
        // GO.push("/dashboard/");
      }
    } catch (error) {
      setShowLoader(false);
      console.log(error, "error");

      const frontError = error?.response?.data?.errors?.front;
      const orderError = error?.response?.data?.errors?.Order;

      if (frontError) {
        logError(frontError);
      } else if (orderError) {
        logError(orderError);
      } else {
        logError("Something went wrong. Please try again.");
      }

      if (error?.response?.data?.message === "Unauthenticated.") {
        logError("Failed to upload images. Please Login again.");
        GO.push("/login");
      }

      // ✅ Clear the file on any API error — forces user to re-select
      setValue("frontPhoto", null);
      if (frontPhotoInputRef.current) frontPhotoInputRef.current.value = ""; // ✅ reset input so same file can be selected again
    } finally {
      setShowLoader(false);
      setLoading(false); // ✅ loading hamesha false hoga
    }
  };

  console.log(ImagesSend, "GDJSGHSFHDSHFBSDJFSDJFB");

  console.log(imageUploaded, "imageUploaded");

  const handleRedirect = () => {
    if (!idVerificationUpload) {
      GO.push("/id-verification");
    } else {
      GO.push("/dashboard");
    }
  };

  return (
    <>
      <StepsHeader />
      <MetaLayout canonical={`${meta_url}photo-upload/`} />
      {loading && (
        <PageLoader message="Please wait while your photo is being uploaded..." />
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
                  Image successfully uploaded
                </h2>

                {/* Message */}
                <p className="inter-reg-font mb-6 mt-3 text-center text-[14px] leading-6 text-slate-600">
                  {!idVerificationUpload
                    ? "Your full body photo have been uploaded and are now under review by our prescribers. You need to complete the ID verification to proceed. Please click the button below to continue."
                    : "Your full body photo have been uploaded and are now under review by our prescribers. We'll approve your order once the review is complete and notify you straight away."}
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
              Submit your photo for prescriber review
            </h1>

            {/* Description */}
            <p className="inter-reg-font mt-2 text-[13.5px] leading-6 text-slate-500">
              Please upload a <span className="inter-semibold-font">full body</span>{" "}
              picture of yourself.
            </p>

            {/* Bullet Points */}
            <div className="mt-5 rounded-xl border border-[#4565BF]/10 bg-[#f4f6fd] px-4 py-3.5">
              <p className="inter-semibold-font mb-2 text-[13px] text-slate-800">Why we need this</p>
              <ul className="inter-reg-font list-disc space-y-2 pl-5 text-[12.5px] leading-5 text-slate-600 marker:text-[#4565BF]">
                <li>We will only ask for this once.</li>
                <li>
                  We realise it's inconvenient, but this is a regulatory
                  requirement designed for your safety and to prevent
                  inappropriate use.
                </li>
              </ul>
            </div>
          </div>

          {/* Example Images */}
          <div className="mb-6">
            <p className="inter-semibold-font mb-3 text-[13px] text-slate-800">Photo guidance</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="relative overflow-hidden rounded-xl border-2 border-emerald-400 bg-white">
                <Image
                  src={FullBody}
                  alt="correct"
                  className="aspect-[3/4] h-auto w-full object-cover"
                />
                <span className="inter-semibold-font absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-1 text-[10px] text-emerald-700 shadow-sm"><FaCheck size={10} /> Good</span>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Image
                  src={FaceX}
                  alt="incorrect"
                  className="aspect-[3/4] h-auto w-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Image
                  src={HalfBodyX}
                  alt="incorrect"
                  className="aspect-[3/4] h-auto w-full object-cover"
                />
                <span className="inter-semibold-font absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-1 text-[10px] text-red-600 shadow-sm"><RxCross2 size={10} /> Avoid</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Controller
              name="frontPhoto"
              control={control}
              defaultValue={null}
              render={() => (
                <UploadBox
                  label="Front Photo"
                  photo={frontPhoto}
                  type="frontPhoto"
                  placeholderUrl="/images/front_image.png"
                  loadingPhoto={loadingPhoto}
                  onUpload={handleUpload}
                  onSetValue={setValue}
                  onRemove={(type) => {
                    setValue(type, null);
                    if (frontPhotoInputRef.current)
                      frontPhotoInputRef.current.value = "";
                  }}
                  inputRef={frontPhotoInputRef}
                />
              )}
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

export default PhotoUpload;
