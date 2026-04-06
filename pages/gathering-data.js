import StepsHeader from "@/layout/stepsHeader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import getVariationsApi from "@/api/getVariationsApi";
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

export default function GatherData() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  // store addons or dose here 🔥🔥
  const { setVariation } = useVariationStore();
  const { setShipmentCountries } = useShipmentCountries();
  const { setBillingCountries } = useBillingCountries();
  const { clearCart } = useCartStore();

  const { clearPatientInfo } = usePatientInfoStore();
  const { clearAuthUserDetail } = useAuthUserDetailStore();
  const { clearBmi } = useBmiStore();
  const { clearMedicalInfo } = useMedicalInfoStore();
  const { clearConfirmationInfo } = useConfirmationInfoStore();
  const { clearGpDetails } = useGpDetailsStore();

  const { clearCheckout } = useCheckoutStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
  const { clearShipping, clearBilling } = useShippingOrBillingStore();
  const { clearToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { productId, clearProductId } = useProductId();
  const { clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();

  const { clearFirstName, clearLastName, clearEmail, clearConfirmationEmail } = useSignupStore();


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
          clearProductId();
          clearLastBmi();
          clearUserData();
          clearFirstName();
          clearLastName();
          clearEmail();
          clearConfirmationEmail();
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

  return (
    <>
      <StepsHeader />
      {showLoader && (
        <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">

          <PageLoader />
        </div>
      )}
    </>
  );
}
