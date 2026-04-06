import React from "react";

import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const BackButton = ({ label = "Back", loading = false, disabled = false, type = "button", onClick, className }) => {
  return (
    <div className={"mb-0"}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${className} px-8 border-2   py-3 rounded-md text-white bold-font text-sm transition-all duration-150 ease-in-out
            flex justify-center items-center cursor-pointer
            ${disabled || loading ? "bg-gray-300 !cursor-not-allowed" : " border-[#4565BF] bg-[#4565BF] hover:bg-[#4565BF]"}`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <span>{label}</span>
        )}
      </button>
    </div>
  );
};

export default BackButton;
