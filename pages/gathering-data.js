import StepsHeader from "@/layout/stepsHeader";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getVariationsApi } from "@/api/mergeRoutes";
import toast from "react-hot-toast";
import Fetcher from "@/library/Fetcher";
import useVariationStore from "@/store/useVariationStore";
import PageLoader from "@/Components/PageLoader/PageLoader";
import useShipmentCountries from "@/store/useShipmentCountriesStore";
import useBillingCountries from "@/store/useBillingCountriesStore";
import useCartStore from "@/store/useCartStore";
import useProductId from "@/store/useProductIdStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useCheckoutStore from "@/store/checkoutStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useAuthStore from "@/store/authStore";
import usePasswordReset from "@/store/usePasswordReset";
import useLastBmi from "@/store/useLastBmiStore";
import useSignupStore from "@/store/signupStore";
import useBmiStore from "@/store/bmiStore";
import useUserDataStore from "@/store/userDataStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useAbandonCardStore from "@/store/abandonCardStore";
import { userConsultationApi } from "@/api/consultationApi";
import useReturning from "@/store/useReturningPatient";
import lastOrderStore from "@/store/lastOrderStore";

export default function GatherData() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  // store addons or dose here 🔥🔥
  const { setVariation } = useVariationStore();
  const { setShipmentCountries } = useShipmentCountries();
  const { setBillingCountries } = useBillingCountries();
  const { clearCart } = useCartStore();

  const { setPatientInfo, clearPatientInfo } = usePatientInfoStore();
  const { setAuthUserDetail, clearAuthUserDetail } = useAuthUserDetailStore();
  const { setBmi, clearBmi } = useBmiStore();
  const { setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { setConfirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();
  const { setGpDetails, clearGpDetails } = useGpDetailsStore();

  const { setCheckout, clearCheckout } = useCheckoutStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
  const {
    billing,
    setBilling,
    shipping,
    setShipping,
    setCheckShippingForAccordion,
    clearShipping,
    clearBilling,
    setCheckBillingForAccordion,
  } = useShippingOrBillingStore();
  const { clearToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { productId, clearProductId } = useProductId();
  const { setLastBmi, clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();
  const { abandonCard, setExtra, clearAbandonCard } = useAbandonCardStore();
  const {
    clearFirstName,
    clearLastName,
    clearEmail,
    setFirstName,
    setLastName,
    clearConfirmationEmail,
  } = useSignupStore();
  const { setIsReturningPatient } = useReturning();
  const { setLastOrder, clearLastOrder } = lastOrderStore();
  // Variations fetch mutation
  const variationMutation = useMutation(getVariationsApi, {
    onSuccess: (data) => {
      console.log(data, "getVariationsApi");
      if (data) {
        clearCart();
        // toast.success("User registered successfully!");
        const variations = data?.data?.data || [];
        setVariation(variations);
        setShipmentCountries(data?.data?.data?.shippment_countries);
        setBillingCountries(data?.data?.data?.billing_countries);
        // Redirect
        router.push("/dosage-selection");
      }
    },
    onError: (error) => {
      if (error) {
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
          // clearProductId();
          clearLastBmi();
          clearUserData();
          clearFirstName();
          clearLastName();
          clearEmail();
          clearConfirmationEmail();
          clearAbandonCard();
          router.push("/login");
        } else {
          setShowLoader(false);
          toast.error(error?.response?.data?.errors?.Product);
        }
      }
    },
  });

  // Call mutation on mount
  useEffect(() => {
    setShowLoader(true);
    if (productId != null) {
      // console.log("Api Run");
      variationMutation.mutate({ id: productId, data: {} });
    }
  }, [productId]);

  // Abandoned cart post api call

  const consultationMutation = useMutation(userConsultationApi, {
    onSuccess: (data) => {
      console.log(data, "Dataaaaaaaaaa");
      console.log(data?.data?.data?.extra, "extraextra");
      setExtra(data?.data?.data?.extra);

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
        clearLastOrder();
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
        setFirstName(data?.data?.data?.auth_user?.fname);
        setLastName(data?.data?.data?.auth_user?.lname);
        setIsReturningPatient(data?.data?.data?.isReturning);
        setLastOrder(data?.data?.data?.last_order);
      }

      setShowLoader(false);
      return;
    },
    onError: (error) => {
      // setLoading(false);
      console.log("error", error?.response?.data?.errors?.email);
      if (error) {
        setShowLoader(false);
      }
    },
  });

  useEffect(() => {
    if (!abandonCard?.type) return;

    if (abandonCard.type === "abandoned-cart") {
      setShowLoader(true);

      consultationMutation.mutate({
        clinic_id: 1,
        product_id: abandonCard.productId,
        type: abandonCard.type,
        eid: Number(abandonCard.eid),
      });
    }
  }, [abandonCard]);

  return (
    <>
      <MetaLayout canonical={`${meta_url}gathering-data/`} />
      <StepsHeader />
      {showLoader && (
        <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
          <PageLoader />
        </div>
      )}
    </>
  );
}
