import ProgressBar from "../ProgressBar/ProgressBar";


const FormWrapper = ({ className, children, width = "", heading = "", description = "", percentage = 0, showLoader = false }) => {
  return (
    <>
      <div className={`${className} py-6 sm:py-14 flex justify-center bg-[#EEF2FA] px-4 sm:px-6 ${showLoader ? "cursor-not-allowed" : ""}`}>
        <div className={`relative overflow-hidden bg-white rounded-2xl shadow-[0_8px_28px_rgba(30,41,89,0.09)] border border-slate-100 w-full max-w-xl ${width}`}>
          {/* ✅ Move ProgressBar inside the card */}
          {/* <ProgressBar percentage={percentage} /> */}

          {(heading || description) && (
            <div
              className="border-b border-[#e0e6f7] px-5 py-5 sm:px-8 sm:py-6"
              style={{ backgroundImage: "radial-gradient(120% 140% at 88% 0, #e8ecfb 0%, #f2f4fc 42%, #ffffff 78%)" }}
            >
              {/* Title */}
              {heading && (
                <h1 className="inter-bold-font text-[22px] sm:text-[26px] leading-tight text-slate-900 mb-2">
                  {heading}
                </h1>
              )}

              {/* Description */}
              {description && (
                <p className="inter-reg-font text-[13.5px] leading-relaxed text-slate-500">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className="px-5 sm:px-8 pt-6 pb-6 sm:pt-8 sm:pb-8">
            {/* Slot: Form Fields and Buttons */}
            <div className={`${showLoader ? "pointer-events-none opacity-50" : ""}`}>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormWrapper;
