import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";

import { userConsultationApi } from "@/api/consultationApi";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useBmiStore from "@/store/bmiStore";
import useCheckoutStore from "@/store/checkoutStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useCouponStore from "@/store/couponStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useLastBmi from "@/store/useLastBmiStore";
import lastOrderStore from "@/store/lastOrderStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useProductId from "@/store/useProductIdStore";
import useReorder from "@/store/useReorderStore";
import useReturning from "@/store/useReturningPatient";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useSignupStore from "@/store/signupStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useAbandonCardStore from "@/store/abandonCardStore";

import ProductGridCard from "./ProductGridCard";
import ProductListCard from "./ProductListCard";

const ProductCard = ({
  id,
  title,
  image,
  description,
  price,
  status,
  buttonText,
  reorder = false,
  pre_launch_price,
  viewMode = "list",
}) => {
  const router = useRouter();

  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const shouldResetConsentRef = useRef(false);

  const { productId: currentProductId, setProductId } = useProductId();
  const { setReorder } = useReorder();
  const { clearCoupon } = useCouponStore();

  const { setBmi, clearBmi } = useBmiStore();
  const { setCheckout, clearCheckout } = useCheckoutStore();

  const {
    setConfirmationInfo,
    clearConfirmationInfo,
    setConsentResetProductId,
  } =
    useConfirmationInfoStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();

  const { setGpDetails, clearGpDetails } = useGpDetailsStore();
  const { setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { setPatientInfo, clearPatientInfo } = usePatientInfoStore();

  const { setAuthUserDetail, clearAuthUserDetail } = useAuthUserDetailStore();

  const { setLastOrder, clearLastOrder } = lastOrderStore();

  const {
    setBilling,
    setShipping,
    setCheckShippingForAccordion,
    clearShipping,
    clearBilling,
    setCheckBillingForAccordion,
  } = useShippingOrBillingStore();

  const { setLastBmi } = useLastBmi();
  const { setFirstName, setLastName } = useSignupStore();
  const { setIsReturningPatient } = useReturning();
  const { clearAbandonCard } = useAbandonCardStore();

  const consultationMutation = useMutation(userConsultationApi, {
    onSuccess: (data) => {
      if (data?.data?.data == null) {
        clearBmi();
        clearCheckout();
        clearConfirmationInfo();
        clearConfirmationQuestions();
        clearGpDetails();
        clearMedicalInfo();
        clearPatientInfo();
        clearBilling();
        clearShipping();
        clearAuthUserDetail();
        clearLastOrder();
      } else if (data?.data) {
        setBmi(data?.data?.data?.bmi);
        setCheckout(data?.data?.data?.checkout);
        if (shouldResetConsentRef.current) {
          clearConfirmationInfo();
          clearConfirmationQuestions();
        } else {
          setConfirmationInfo(data?.data?.data?.confirmationInfo);
        }
        setGpDetails(data?.data?.data?.gpdetails);
        setMedicalInfo(data?.data?.data?.medicalInfo);
        setPatientInfo(data?.data?.data?.patientInfo);
        setShipping(data?.data?.data?.shipping);
        setCheckShippingForAccordion(data?.data?.data?.shipping);
        setBilling(data?.data?.data?.billing);
        setCheckBillingForAccordion(data?.data?.data?.billing);
        setAuthUserDetail(data?.data?.data?.auth_user);
        setLastBmi(data?.data?.data?.bmi);
        setFirstName(data?.data?.data?.auth_user?.fname);
        setLastName(data?.data?.data?.auth_user?.lname);
        setIsReturningPatient(data?.data?.data?.isReturning);
        setLastOrder(data?.data?.data?.last_order);
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
      shouldResetConsentRef.current = false;
    },

    onError: (error) => {
      setIsButtonLoading(false);
      shouldResetConsentRef.current = false;
    },
  });

  const handleClick = () => {
    if (!id || isButtonLoading) {
      return;
    }

    clearAbandonCard();
    shouldResetConsentRef.current =
      currentProductId != null && String(currentProductId) !== String(id);
    if (shouldResetConsentRef.current) {
      setConsentResetProductId(id);
    }
    setProductId(id);
    setIsButtonLoading(true);

    consultationMutation.mutate({
      clinic_id: 2,
      product_id: id,
    });
  };

  const isOutOfStock = !status;

  const displayPrice = price;
  const hasPrice =
    displayPrice !== null &&
    displayPrice !== undefined &&
    displayPrice !== "" &&
    displayPrice !== "N/A";

  const sharedProps = {
    title,
    image,
    description,
    originalPrice: hasPrice ? displayPrice : null,
    isOutOfStock,
    isLoading: isButtonLoading,
    buttonText,
    onClick: handleClick,
  };

  if (viewMode === "grid") {
    return <ProductGridCard {...sharedProps} />;
  }

  return <ProductListCard {...sharedProps} />;
};

export default ProductCard;
