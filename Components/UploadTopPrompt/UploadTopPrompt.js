import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import Link from "next/link";
import React from "react";
import { FiUpload } from "react-icons/fi";

const UploadTopPrompt = () => {
  const { imageUploaded } = useImageUploadStore();
  const { idVerificationUpload } = useIdVerificationUploadStore();

  // Build dynamic message
  let missingItems = [];
  if (!imageUploaded) missingItems.push("photo");
  if (!idVerificationUpload) missingItems.push("ID verification");

  const message = missingItems.length
    ? `Please upload your ${missingItems.join(" and ")} to complete your order.`
    : "";
  console.log(message, "message");
  if (!message) return null; // nothing missing → don't show prompt

  let redirectTo = "/photo-upload"; // default
  if (imageUploaded && !idVerificationUpload) {
    redirectTo = "/id-verification";
  }

  return (
    <div className="sm:fixed top-4 left-1/3 bg-amber-500 text-white px-5 py-2 sm:rounded-xl shadow-lg w-[100%] sm:w-auto animate-slide-down z-50">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="bg-white/20 p-2 rounded-full">
          <FiUpload className="text-lg" />
        </div>

        {/* Message */}
        <div className="text-sm reg-font">
          {message}{" "}
          <Link
            href={redirectTo}
            className="font-medium underline underline-offset-4 hover:text-white/80 transition mx-2"
          >
            Click here to upload
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UploadTopPrompt;
