import React from "react";

const BackButton = ({ label = "Back", loading = false, disabled = false, type = "button", onClick, className = "" }) => {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className="inter-medium-font flex items-center justify-center gap-1 text-[13px] text-[#4565BF] underline hover:text-slate-600 transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-[#4565BF] border-t-transparent rounded-full animate-spin" />
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
