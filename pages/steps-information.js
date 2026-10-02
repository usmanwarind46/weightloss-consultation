"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { userConsultationApi } from "@/api/consultationApi";
import useBmiStore from "@/store/bmiStore";
import useCheckoutStore from "@/store/checkoutStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import GuardedLoader from "@/Components/PageLoader/GuardedLoader";
import NextButton from "@/Components/NextButton/NextButton";
import BackButton from "@/Components/BackButton/BackButton";
import { getApiErrorMessage, goBackOr, isUnauthorized, useIsMounted } from "@/utils/apiError";
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
import { FoundayoProductId, meta_url, WegovyPillProductId } from "@/config/constants";
import useReturning from "@/store/useReturningPatient";
import { getMedicalQuestions } from "@/api/mergeRoutes";

export default function StepsInformation() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [loadError, setLoadError] = useState("");
  const isMounted = useIsMounted();

  const router = useRouter();

  //calling from zustand Storee
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
      if (!isMounted.current) return;
      if (data?.data?.data == null) {
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
      }

      // product already chosen -> continue (also when there is no saved consultation yet)
      if (productId && !showProductSelection) {
        router.push("/personal-details");
        return;
      }

      setShowLoader(false);
      return;
    },
    onError: (error) => {
      if (!isMounted.current) return;
      setShowLoader(false);
      if (isUnauthorized(error)) {
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
      } else {
        const message = getApiErrorMessage(error);
        toast.error(message);
        setLoadError(message);
      }
    },
  });

  /* ───────────────  medical questions mutation ────────────── */
  const medicalQuestionsMutation = useMutation(getMedicalQuestions, {
    onSuccess: (data) => {
      if (data) {
        setMedicalQuestions(data?.data?.data?.medical_question);
        setConfirmationQuestions(data?.data?.data?.confirmation_question);
      }
      setShowLoader(false);
      return;
    },
    onError: (error) => {
      if (!isMounted.current) return;
      if (error) {
        setShowLoader(false);
        if (isUnauthorized(error)) return;
        setLoadError(getApiErrorMessage(error));
      }
    },
  });

  const loadData = () => {
    const formData = {
      clinic_id: 2,
      product_id: productId,
    };
    if (productId != null) {
      setLoadError("");
      setShowLoader(true);
      consultationMutation.mutate(formData);
      if (productId == WegovyPillProductId || productId == FoundayoProductId) {

        medicalQuestionsMutation.mutate(formData);
      } else {
        medicalQuestionsMutation.mutate();
      }
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [productId]);

  useEffect(() => { }, []);

  //   setTimeout(() => {
  //     router.push("/step1");
  //   }, 3000);

  return (
    <>
      <MetaLayout canonical={`${meta_url}steps-information`} />
      <StepsHeader />

      <main className="min-h-[calc(100vh-66px)] bg-[#EEF2FA]">
        <GuardedLoader
          show={showLoader}
          onRetry={loadData}
          onCancel={() => goBackOr(router, "/")}
          cancelLabel="Back"
        />

        {loadError && !showLoader && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
            <p className="inter-reg-font text-[15px] text-slate-700">{loadError}</p>
            <div className="flex w-full flex-col gap-2">
              <NextButton type="button" label="Try again" onClick={loadData} />
              <BackButton onClick={() => goBackOr(router, "/")} label="Back" />
            </div>
          </div>
        )}

        {showProductSelection && (
          <ProductSelection showProductSelection={showProductSelection} />
        )}
      </main>

      {/* )} */}
    </>
  );
}
