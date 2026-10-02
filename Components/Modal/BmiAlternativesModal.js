import React, { useEffect } from "react";
import { X } from "lucide-react";

// NOTE: confirm these contact details for the Online Weight Loss Clinic
const EMAIL = "contact@onlineweightlossclinic.co.uk";
const CONTACT_URL = "https://www.onlineweightlossclinic.co.uk/contact-us";

const BmiAlternativesModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bmi-alternatives-heading"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[calc(100dvh-48px)] w-full max-w-[560px] sm:max-w-[780px] overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <h2
          id="bmi-alternatives-heading"
          className="inter-semibold-font pr-10 text-[20px] sm:text-[22px] leading-snug tracking-[-0.01em] text-slate-900 sm:whitespace-nowrap"
        >
          Alternatives if you're not comfortable sending photos
        </h2>

        <div className="inter-reg-font mt-5 space-y-4 text-[16px] sm:text-[17px] leading-relaxed text-slate-600">
          <p>
            If you prefer not to send a photo, you can email one of the
            following to
            <span className="mt-1 block">
              <a
                href={`mailto:${EMAIL}`}
                className="inter-medium-font whitespace-nowrap text-[#4565BF] underline underline-offset-2 max-sm:text-[clamp(13px,4vw,16px)]"
              >
                {EMAIL}
              </a>
              :
            </span>
          </p>
          <ul className="list-disc space-y-3 pl-5 marker:text-[#4565BF]">
            <li>
              A letter from your GP or pharmacist confirming your height and
              weight. It must include your full name and date of birth, be
              printed on official headed paper or bear a pharmacy stamp, and be
              signed by a healthcare professional.
            </li>
            <li>
              A photo or video of you standing on a weighing scale. Your weight
              must be clearly visible, with your ID placed beside you and its
              details clearly legible.
            </li>
            
          </ul>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="inter-bold-font text-[16px] sm:text-[17px] text-slate-900">
              Need Help?
            </h3>
            <p className="mt-1.5">
              If you’re having issues with the verification process,{" "}
              <a
                href={CONTACT_URL} target="_blank"
                className="inter-medium-font text-[#4565BF] underline underline-offset-2 hover:text-[#3550a0]"
              >
                contact Customer Care
              </a>
              . The team can help you complete the required steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BmiAlternativesModal;
