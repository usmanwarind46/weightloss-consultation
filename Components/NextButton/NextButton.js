import React from "react";

import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const NextButton = ({
  label = "Next",
  loading = false,
  subLabel,
  disabled = false,
  type = "submit",
  onClick,
  props = "w-full",
}) => {
  return (
    <div className={"mb-0"}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${props ? "w-full" : ""} ${subLabel ? "" : "px-8"} border-2    py-3 rounded-md text-white bold-font text-md transition-all duration-150 ease-in-out
            flex justify-center items-center cursor-pointer
            ${
              disabled || loading
                ? "bg-gray-300 !cursor-not-allowed border-gray-300"
                : " border-[#4565BF] bg-[#4565BF] hover:bg-[#4565BF]"
            }`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <>
            {/* {icon && <span className="mr-2 flex items-center">{icon}</span>} */}

            <div className="flex flex-col items-center ">
              <div>{label}</div>
              {subLabel && (
                <div className="text-[13px] reg-font pt-1 normal-case">
                  {subLabel}
                </div>
              )}
            </div>
          </>
        )}
      </button>
    </div>
  );
};

export default NextButton;
