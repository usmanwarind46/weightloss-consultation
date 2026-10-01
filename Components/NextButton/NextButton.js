import React from "react";

const NextButton = ({
  label = "Next",
  loading = false,
  subLabel,
  disabled = false,
  type = "submit",
  onClick,
  props,
  className = "",
  subHeadingClassName = "",
}) => {
  return (
    <div className="mb-0">
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${className} w-full inter-medium-font text-[14px] tracking-wide transition-all duration-150 ease-in-out
            flex justify-center items-center cursor-pointer rounded-lg py-3 px-6
            ${
              loading
                ? "bg-[#4565BF] text-white opacity-80 !cursor-not-allowed"
                : disabled
                  ? "bg-slate-200 text-slate-500 !cursor-not-allowed"
                  : "bg-[#4565BF] hover:bg-[#3550a0] text-white"
            }`}
      >
        {loading ? (
          <div className="relative flex flex-col items-center">
            {/* invisible copy of the normal content keeps the button size; spinner is centered over it */}
            <div aria-hidden="true" className="invisible flex flex-col items-center whitespace-nowrap">
              <div className="pl-6">Please wait...</div>
              {subLabel && (
                <div className={`${subHeadingClassName} text-[12px] inter-reg-font pt-1 normal-case`}>
                  {subLabel}
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap">
              <div className="w-4 h-4 shrink-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Please wait...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div>{label}</div>
            {subLabel && (
              <div className={`${subHeadingClassName} text-[12px] inter-reg-font pt-1 normal-case opacity-80`}>
                {subLabel}
              </div>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default NextButton;
