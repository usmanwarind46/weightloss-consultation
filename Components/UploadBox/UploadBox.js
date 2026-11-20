import React, { useEffect, useMemo } from "react";
import { FiUpload } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";

// ✅ Separate UploadBox component to properly use hooks and fix memory leak
const UploadBox = ({
  label,
  photo,
  type,
  loadingPhoto,
  onUpload,
  onRemove,
  inputRef,
  title = "Upload a full-body photo",
  accept = "image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/avif,application/pdf",
  formatsText = "JPEG, PNG, WEBP, HEIC, HEIF, AVIF or PDF · Maximum 50 MB",
  removeTitle = "Remove photo",
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

  return (
    <div className="w-full">
      <div className="relative w-full">
        <label className="block w-full cursor-pointer rounded-xl focus-within:ring-2 focus-within:ring-[#4565BF]/25 focus-within:ring-offset-2">
          <div
            className="relative flex min-h-[164px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#8da3d9] bg-[#f3f6fc] px-5 py-6 text-center transition-all duration-200 hover:border-[#4565BF] hover:bg-[#eaf0fb]"
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={(e) => onUpload(e, type)}
              className="hidden"
            />

            {loadingPhoto ? (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#4565BF]/10">
                  <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin text-[#4565BF]" />
                </div>
                <p className="inter-medium-font text-[16px] max-sm:text-[16px] text-slate-700">
                  Uploading...
                </p>
              </div>
            ) : !photo ? (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#4565BF] shadow-sm ring-1 ring-[#4565BF]/10">
                  <FiUpload className="h-5 w-5" />
                </div>
                <p className="inter-semibold-font text-[16px] max-sm:text-[16px] text-slate-800">
                  {title}
                </p>
                <p className="inter-reg-font mt-1 text-[16px] max-sm:text-[16px] leading-6 text-slate-500">
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
                    <p className="inter-reg-font w-full truncate px-3 text-center text-[16px] max-sm:text-[16px] text-slate-600">
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
            title={removeTitle}
          >
            <RxCross2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="inter-reg-font mt-3 text-center text-[16px] max-sm:text-[16px] leading-6 text-slate-500">
        {formatsText}
      </p>
    </div>
  );
};

export default UploadBox;
