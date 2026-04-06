"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import useBmiStore from "@/store/bmiStore";
import useCheckoutStore from "@/store/checkoutStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import PageLoader from "@/Components/PageLoader/PageLoader";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useProductId from "@/store/useProductIdStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useLastBmi from "@/store/useLastBmiStore";
import toast from "react-hot-toast";
import useAuthStore from "@/store/authStore";
import usePasswordReset from "@/store/usePasswordReset";
import useUserDataStore from "@/store/userDataStore";
import useSignupStore from "@/store/signupStore";
import ProductSelection from "@/Components/ProductSelection/ProductSelection";
import useReorderButtonStore from "@/store/useReorderButton";
import StepsHeader from "@/layout/stepsHeader";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReturning from "@/store/useReturningPatient";
import { getMedicalQuestions, userConsultationApi } from "@/api/mergeRoute";

export default function StepsInformation() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const router = useRouter();

  //calling from zustand Store
  const { setBmi, clearBmi } = useBmiStore();
  const { isFromReorder } = useReorderButtonStore();
  const { setCheckout, clearCheckout } = useCheckoutStore();
  const { setConfirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();
  const { setGpDetails, clearGpDetails } = useGpDetailsStore();
  const { setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { setPatientInfo, clearPatientInfo } = usePatientInfoStore();
  const { setMedicalQuestions, clearMedicalQuestions } =
    useMedicalQuestionsStore();
  const { setConfirmationQuestions, clearConfirmationQuestions } =
    useConfirmationQuestionsStore();
  const { setAuthUserDetail, clearAuthUserDetail, authUserDetail } =
    useAuthUserDetailStore();
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
  const { clearToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { productId, clearProductId } = useProductId();
  const { setLastBmi, clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();
  const { clearFirstName, clearLastName, clearEmail, clearConfirmationEmail } =
    useSignupStore();

  /* ───────────────  stores (init only what we SET/CLEAR) ────────────── */
  const { setIsReturningPatient } = useReturning();
  const showProductSelection = isFromReorder || (!isFromReorder && !productId);

  /* ───────────────  product id store ────────────── */
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
        setIsReturningPatient(data?.data?.data?.isReturning);
        if (productId && !showProductSelection) {
          if (authUserDetail?.isReturning) {
          }
          router.push("/personal-details");
        } else {
          return;
        }
      }

      return;
    },
    onError: (error) => {
      // setLoading(false);
      console.log("error", error?.response?.data?.message);
      if (error?.response?.data?.message == "Unauthenticated.") {
        toast.error("Session Expired");
        clearBmi();
        clearCheckout();
        clearConfirmationInfo();
        clearGpDetails();
        clearMedicalInfo();
        clearPatientInfo();
        clearBilling();
        clearShipping();
        clearAuthUserDetail();
        clearMedicalQuestions();
        clearConfirmationQuestions();
        clearToken();
        setIsPasswordReset(true);
        clearProductId();
        clearLastBmi();
        clearUserData();
        clearFirstName();
        clearLastName();
        clearEmail();
        clearConfirmationEmail();
        router.push("/login");
      }
    },
  });

  console.log(showProductSelection, "showProductSelection");

  /* ───────────────  medical questions mutation ────────────── */
  const medicalQuestionsMutation = useMutation(getMedicalQuestions, {
    onSuccess: (data) => {
      console.log(data, "Medical Questions");

      if (data) {
        setMedicalQuestions(data?.data?.data?.medical_question);
        setConfirmationQuestions(data?.data?.data?.confirmation_question);
      }
      return;
    },
    onError: (error) => {
      // setLoading(false);
      if (error) {
        setShowLoader(false);
      }
    },
  });

  useEffect(() => {
    const formData = {
      clinic_id: 2,
      product_id: productId,
    };
    setShowLoader(true);
    if (productId != null) {
      consultationMutation.mutate(formData);
      medicalQuestionsMutation.mutate();
    }
  }, [productId]);

  useEffect(() => {}, []);

  //   setTimeout(() => {
  //     router.push("/step1");
  //   }, 3000);

  return (
    <>
      <MetaLayout canonical={`${meta_url}steps-information`} />
      <StepsHeader />
      {showLoader && (
        <div className="absolute inset-0 z-20 flex justify-center items-center bg-black/30 rounded-lg cursor-not-allowed">
          <PageLoader />
        </div>
      )}

      {showProductSelection && (
        <ProductSelection showProductSelection={showProductSelection} />
      )}

      {/* )} */}
    </>
  );
}
