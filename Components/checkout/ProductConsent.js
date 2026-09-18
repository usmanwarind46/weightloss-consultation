import React, { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import SectionWrapper from "./SectionWrapper";
import SectionHeader from "./SectionHeader";
import useVariationStore from "@/store/useVariationStore";
import { GoInfo } from "react-icons/go";
import { BsInfoLg } from "react-icons/bs";

const ProductConsent = ({ isCompleted, onComplete, onConsentChange, setIsConcentCheck }) => {
  const [isValid, setIsValid] = useState();
  const [isChecked, setIsChecked] = useState(false);

  const { variation } = useVariationStore();

  // const handleSubmit = () => {
  //   onComplete();
  // };

  console.log(variation, "variation");

  useEffect(() => {
    setIsValid(isChecked);

    if (isChecked) {
      onComplete();
    }

    console.log(isValid, "isValid");
    setIsConcentCheck(isChecked);
  }, [isChecked]);

  return (
    <SectionWrapper>
      <SectionHeader
        stepNumber={<BsInfoLg />}
        title="Treatment Consent"
        description="Please review the important information below regarding your treatment:"
        isCompleted={isChecked}
      >

        <div>
          {/* Consent List */}
          <div
            className="list-disc list-outside pl-5 text-sm text-gray-700 space-y-2 reg-font paragraph my-3 product-concent-list concent-anchor"
            dangerouslySetInnerHTML={{ __html: variation?.terms_and_conditon }}
          ></div>
          {/* {variation?.terms_and_conditon} */}

          {/* Terms Checkbox */}
          <div className="mt-8 font-inter mb-5">
            <label
              className="flex items-center gap-3 text-[15px] text-gray-900 font-semibold cursor-pointer select-none"
              onClick={(e) => {
                e.preventDefault();
                const checked = !isChecked;
                setIsChecked(checked);
                onConsentChange?.(checked);
              }}
            >
              {/* Custom Checkbox */}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2 transition-all duration-150
                  ${isChecked ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}
              >
                {isChecked && (
                  <svg width="13" height="10" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Checkbox Label */}
              <span className="leading-snug bold-font paragraph">
                I confirm that I have read, understood and accepted all of the above information.
              </span>
            </label>

            {/* Error Message */}
            {!isChecked && <p className="text-xs text-red-600 mt-2">You must accept the terms to continue.</p>}
          </div>
          {/* <NextButton label="Continue" onClick={handleSubmit} disabled={!isValid} /> */}
        </div>
      </SectionHeader>
    </SectionWrapper>
  );
};

export default ProductConsent;
