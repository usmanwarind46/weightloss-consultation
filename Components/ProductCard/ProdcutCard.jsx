import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useProductId from "@/store/useProductIdStore";
import usePatientStatus from "@/store/useReorderStore";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useBmiStore from "@/store/bmiStore";
import useCheckoutStore from "@/store/checkoutStore";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useReorder from "@/store/useReorderStore";
import useLastBmi from "@/store/useLastBmiStore";
import useCouponStore from "@/store/couponStore";
import useSignupStore from "@/store/signupStore";
import useReturning from "@/store/useReturningPatient";
import { userConsultationApi } from "@/api/mergeRoute";

const ProductCard = ({
  id,
  title,
  image,
  price,
  status,
  buttonText,
  lastOrderDate,
  reorder,
}) => {
  const router = useRouter();
  const { productId, setProductId } = useProductId();
  const { setReorder } = useReorder();
  const { clearCoupon } = useCouponStore();
  console.log(productId, "productId");
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const { setBmi, clearBmi } = useBmiStore();
  const { setCheckout, clearCheckout } = useCheckoutStore();
  const { setConfirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();
  const { setGpDetails, clearGpDetails } = useGpDetailsStore();
  const { setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { setPatientInfo, clearPatientInfo } = usePatientInfoStore();
  const { setAuthUserDetail, clearAuthUserDetail } = useAuthUserDetailStore();
  const {
    billing,
    setBilling,
    shipping,
    setShipping,
    clearShipping,
    clearBilling,
    setCheckShippingForAccordion,
    setCheckBillingForAccordion,
  } = useShippingOrBillingStore();
  const { setLastBmi } = useLastBmi();
  const { firstName, lastName, setFirstName, setLastName } = useSignupStore();
  const { setIsReturningPatient } = useReturning();

  //Get Consultation Data
  const consultationMutation = useMutation(userConsultationApi, {
    onSuccess: (data) => {
      console.log(data, "Dataaaaaaaaaa");

      if (data?.data?.data == null) {
        console.log("true");
        clearBmi();
        clearCheckout();
        clearConfirmationInfo();
        clearGpDetails();
        clearMedicalInfo();
        clearPatientInfo();
        clearBilling();
        clearShipping();
        clearAuthUserDetail();
      } else if (data?.data) {
        setBmi(data?.data?.data?.bmi);
        setCheckout(data?.data?.data?.checkout);
        setConfirmationInfo(data?.data?.data?.confirmationInfo);
        setGpDetails(data?.data?.data?.gpdetails);
        setMedicalInfo(data?.data?.data?.medicalInfo);
        setPatientInfo(data?.data?.data?.patientInfo);
        setShipping(data?.data?.data?.shipping);
        setCheckShippingForAccordion(data?.data?.data?.shipping);
        setBilling(data?.data?.data?.billing);
        setCheckBillingForAccordion(data?.data?.data?.billing);
        setAuthUserDetail(data?.data?.data?.auth_user);
        setLastBmi(data?.data?.data?.bmi);
        setFirstName(data?.data?.data?.patientInfo?.firstName);
        setLastName(data?.data?.data?.patientInfo?.lastName);

        setIsReturningPatient(data?.data?.data?.isReturning);
      }

      if (reorder) {
        router.push("/re-order");
        setReorder(true);
        clearCoupon();
      } else {
        setReorder(false);
        router.push("/acknowledgment");
      }

      setIsButtonLoading(false);
      return;
    },
    onError: (error) => {
      // setLoading(false);
      console.log("error", error?.response?.data?.errors?.email);
      if (error) {
        setIsButtonLoading(false);
      }
    },
  });

  const handleClick = () => {
    setProductId(id);
    setIsButtonLoading(true);
    const formData = {
      clinic_id: 2,
      product_id: id,
    };
    consultationMutation.mutate(formData);
  };

  // No need for this effect if setReorderPatient() is already called in handleClick
  // useEffect(() => {
  //   if (reorder == true) {
  //     setReorderPatient(true);
  //   }
  // }, [reorder]); // Make sure this only runs when `reorder` changes

  return (
    <>
      <div className="relative bg-white rounded-lg rounded-b-2xl overflow-hidden transition-transform shadow-md">
        {/* Out of Stock Overlay */}
        {!status && (
          <div className="h-full w-full left-0 absolute bg-[rgba(119,136,153,0.4)] cursor-not-allowed z-10 reg-font"></div>
        )}

        {/* Out of Stock Ribbon */}
        {!status && (
          <div className="absolute -left-8 top-7 bg-red-500 text-white px-[30px] text-xs py-1 rounded-tl -rotate-45 z-20 reg-font">
            Out of stock
          </div>
        )}

        {/* Price Ribbon */}
        {price && (
          <div className="absolute -right-8 top-7 bg-blue-500 text-white text-xs px-[30px] py-1 rounded-tr rotate-45 z-20 reg-font">
            From £{price}
          </div>
        )}

        {/* Product Image */}
        <div className="h-52 overflow-hidden bg-white">
          <img
            src={image}
            alt={title}
            className="w-full p-5 h-52 object-contain"
            // onError={(e) => (e.target.src = "/images/default.png")}
          />
        </div>

        {/* Product Details */}
        <div className="bg-[#E0EDFF] p-5 text-center rounded-2xl">
          <h2 className="text-lg bold-font mb-3 text-gray-900">{title}</h2>

          <p className="mb-3 text-sm font-semibold text-gray-700">
            {lastOrderDate && `Last Ordered: ${lastOrderDate}`}
          </p>

          <div className="w-full text-center">
            <button
              onClick={handleClick}
              type="button"
              className={
                status === false
                  ? "cursor-pointer reg-font bg-[#897bba] text-white py-2 px-6 rounded-full text-sm text-center"
                  : "cursor-pointer reg-font bg-primary text-white reg-font py-2 px-6 rounded-full text-sm text-center hover:bg-violet-400  transition-colors duration-200"
              }
            >
              {isButtonLoading == true ? (
                <div className="px-12 w-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="w-6 h-6 border-4 border-t-transparent rounded-full text-white"
                  />
                </div>
              ) : (
                <>{buttonText}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
