import React, { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { FiCheck } from "react-icons/fi";
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
            <label className="flex items-center gap-3 text-[15px] text-gray-900 font-semibold cursor-pointer select-none">
              {/* Custom Checkbox */}
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsChecked(checked);

                    // ✅ Notify parent
                    onConsentChange?.(checked);
                  }}
                  className="peer w-6 h-6 cursor-pointer appearance-none rounded-sm border-2 border-gray-300 bg-white 
  checked:bg-[#4565BF] checked:border-[#4565BF] focus:outline-none transition-all duration-300
  checked:shadow-md checked:shadow-green-50 bold-font paragraph"
                />
                {/* Check Icon */}
                <FiCheck size={16} className="text-white absolute" />
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
