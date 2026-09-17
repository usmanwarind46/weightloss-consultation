import React from "react";
import { useRouter } from "next/router";
import NextButton from "../NextButton/NextButton";
import { AlertTriangle, CreditCard } from "lucide-react";

const PaymentFailed = () => {
  const GO = useRouter();

  const handleGoBack = () => {
    GO.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EEF2FA] px-4 py-10 sm:px-6">
      <div className="w-full max-w-[580px] overflow-hidden rounded-2xl border border-[#4565BF]/10 bg-white text-center shadow-[0_22px_65px_rgba(69,101,191,0.12)]">
        <div className="relative overflow-hidden border-b border-[#4565BF]/[0.08] bg-[#f2f4fb] px-6 py-9 sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-16 h-40 w-40 rounded-full border-[22px] border-[#4565BF]/[0.035]"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-12 h-36 w-36 rounded-full bg-[#4565BF]/[0.035]"
          />

          <div className="relative mb-6 flex justify-center">
            <div className="relative flex h-[82px] w-[112px] items-center justify-center rounded-2xl border border-[#4565BF]/15 bg-white text-[#4565BF] shadow-[0_12px_30px_rgba(69,101,191,0.14)]">
              <CreditCard size={42} strokeWidth={1.6} />
              <span className="absolute -bottom-2.5 -right-2.5 flex h-9 w-9 items-center justify-center rounded-xl border-4 border-[#f2f4fb] bg-red-500 text-white shadow-sm">
                <AlertTriangle size={17} strokeWidth={2.2} />
              </span>
            </div>
          </div>
          <h2 className="inter-bold-font relative text-[25px] tracking-[-0.025em] text-slate-900 sm:text-[29px]">
            Payment Failed
          </h2>
          <p className="inter-reg-font relative mx-auto mt-2.5 max-w-md text-[13.5px] leading-relaxed text-slate-500">
            It looks like your payment wasn&apos;t completed. You can try again
            or contact us if you need help.
          </p>
        </div>

        <div className="px-6 py-6 sm:px-10 sm:py-7">
          <NextButton
            onClick={handleGoBack}
            label="Continue to Available Treatments"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 