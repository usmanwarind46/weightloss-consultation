import React, { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import toast from "react-hot-toast";
import useReorder from "@/store/useReorderStore";
import useCartStore from "@/store/useCartStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import GetImageIsUplaod from "@/api/GetImageIsUplaod";
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
import { ImageUplaodApi, UploadPhotoLogs } from "@/api/mergeRoute";

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
    <>
      <div className="flex flex-col">
        <div className="flex flex-col items-center w-full px-3">
          {/* ✅ Wrapper relative rakho */}
          <div className="w-full relative">
            <label className="w-full cursor-pointer">
              <div
                className="border-2 border-dashed border-blue-400 rounded-2xl p-2R 
                   hover:border-blue-600 hover:shadow-md transition-all duration-300 ease-in-out
                   flex flex-col items-center justify-center text-center relative min-h-[140px] bg-white"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/avif,application/pdf"
                  onChange={(e) => onUpload(e, type)}
                  className="hidden"
                />

                {loadingPhoto ? (
                  <div className="flex flex-col items-center justify-center">
                    <AiOutlineLoading3Quarters className="animate-spin text-blue-600 w-7 h-7 mb-3" />
                    <p className="text-gray-700 text-sm reg-font">
                      Uploading...
                    </p>
                  </div>
                ) : !photo ? (
                  <div className="flex flex-col items-center justify-center">
                    <FiUpload className="text-blue-600 w-7 h-7 mb-3" />
                    <p className="text-gray-700 text-sm reg-font">
                      Click here
                      <br />
                      <span className="text-gray-400 text-xs">
                        to upload image
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center relative">
                    {photo?.type === "application/pdf" ? (
                      <div className="flex flex-col items-center justify-center w-[200px] h-40 my-3 bg-gray-50 rounded-lg border border-gray-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-10 h-10 text-red-500 mb-2"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                        </svg>
                        <p className="text-xs text-gray-600 reg-font text-center px-2 truncate w-full text-center">
                          {photo?.name}
                        </p>
                      </div>
                    ) : (
                      <img
                        src={photoUrl}
                        alt={`${label} preview`}
                        className="w-[200px] h-40 object-contain rounded-lg my-3"
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
                className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 
                           text-white rounded-full w-7 h-7 flex items-center justify-center 
                           shadow-md transition-all duration-200 cursor-pointer"
                title="Remove photo"
              >
                <RxCross2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center italic">
            {suggestion}
          </p>
        </div>

        <div className="flex flex-col items-center w-full">
          <p className="text-gray-800 text-[12px] mt-2 text-center medium-font">
            Supported formats:{" "}
            <span className="text-gray-700 thin-font">
              .jpeg, .png, .webp, .heic, .heif, .avif, .pdf
            </span>
          </p>
        </div>
      </div>
    </>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="flex flex-col items-center">
            <p className="text-white text-lg reg-font">
              <PageLoader />
            </p>
            <br />
            <br />
            <br />
            <br />
            <p className="reg-font text-gray-200 px-2 text-center">
              Please wait while your image is being uploaded...
            </p>
          </div>
        </div>
      )}
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
                  Image successfully uploaded
                </h2>

                {/* Message */}
                <p className="text-md text-black text-center mt-3 mb-6 reg-font">
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
          className="max-w-3xl mx-auto my-auto px-6 sm:px-32 py-10 bg-white shadow-2xl rounded-3xl border border-gray-100"
        >
          <div className="mb-8 max-w-2xl mx-auto text-left">
            {/* Heading */}
            {/* <h2 className="subHeading niba-semibold-font mb-2 border-b pb-3">
                            Please upload a <span className='niba-bold-font text-black' >full body</span> picture of yourself
                        </h2> */}

            <h2 className="subHeading !text-black bold-font mb-3 border-b pb-3">
              Submit your photo for prescriber review
            </h2>

            {/* Description */}
            <p className="text-gray-700 mb-1 reg-font">
              Please upload a <span className="bold-font">full body</span>{" "}
              picture of yourself.
            </p>

            {/* Bullet Points */}
            <ul className="list-disc pl-6 text-gray-800 text-sm space-y-2 font-normal font-sans pt-2 my-10 sm:my-0">
              <li>We will only ask for this once.</li>
              <li>
                We realise it's inconvenient, but this is a regulatory
                requirement designed for your safety and to prevent
                inappropriate use.
              </li>
            </ul>
          </div>

          {/* Example Images */}
          <div className="flex justify-center  sm:gap-4 mb-8">
            <div className="flex flex-col items-center bg-white shadow-sm rounded-md mx-0 sm:mx-3 border-1">
              <Image
                src={FullBody}
                alt="correct"
                className="w-28 h-40 object-cover rounded-lg"
              />
              {/* <span className="text-green-500 font-bold my-1"><FaCheck size={18} /></span> */}
            </div>
            <div className="flex flex-col items-center bg-white shadow-sm rounded-md mx-0 sm:mx-3 border-1">
              <Image
                src={FaceX}
                alt="incorrect"
                className="w-28 h-40 object-cover rounded-lg"
              />
              {/* <span className="text-red-500 font-bold my-1"><RxCross2 size={18} /></span> */}
            </div>
            <div className="flex flex-col items-center bg-white shadow-sm rounded-md mx-0 sm:mx-3 border-1">
              <Image
                src={HalfBodyX}
                alt="incorrect"
                className="w-28 h-40 object-cover rounded-lg"
              />
              {/* <span className="text-red-500 font-bold my-1"><RxCross2 size={18} /></span> */}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap justify-center gap-6 mb-8">
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

export default PhotoUpload;
