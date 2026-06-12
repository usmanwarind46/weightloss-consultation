import BackButton from "@/Components/BackButton/BackButton";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useRouter } from "next/router";
import React, { useState } from "react";
import StepsHeader from "@/layout/stepsHeader";
import PageLoader from "@/Components/PageLoader/PageLoader";
import usePatientInfoStore from "@/store/patientInfoStore";
import useBmiStore from "@/store/bmiStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import { sendStepData } from "@/api/mergeRoutes";
import { useMutation } from "@tanstack/react-query";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useProductId from "@/store/useProductIdStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useSignupStore from "@/store/signupStore";
import useLastBmi from "@/store/useLastBmiStore";
import toast from "react-hot-toast";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useAuthStore from "@/store/authStore";
import usePasswordReset from "@/store/usePasswordReset";
import useUserDataStore from "@/store/userDataStore";
import useCheckoutStore from "@/store/checkoutStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";
import { trackCustomerLabsLead } from "@/library/CustomerLabs";

const ConfirmationSummary = () => {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  // Zustand States
  const { patientInfo, setPatientInfo, clearPatientInfo } =
    usePatientInfoStore();
  const { authUserDetail, setAuthUserDetail, clearAuthUserDetail } =
    useAuthUserDetailStore();
  const { bmi, setBmi, clearBmi } = useBmiStore();
  const { medicalInfo, setMedicalInfo, clearMedicalInfo } =
    useMedicalInfoStore();
  const { confirmationInfo, setConfirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();
  const { gpdetails, setGpDetails, clearGpDetails } = useGpDetailsStore();
  const { reorderBackProcess } = useReorderBackProcessStore();

  const { clearCheckout } = useCheckoutStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
  const { clearShipping, clearBilling } = useShippingOrBillingStore();
  const { clearToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { productId, clearProductId } = useProductId();
  const { setLastBmi, clearLastBmi } = useLastBmi();
  const { clearUserData, userData } = useUserDataStore();

  //To get firstname and lastName from signup store
  const {
    clearFirstName,
    clearLastName,
    clearEmail,
    clearConfirmationEmail,
    firstName,
    lastName,
  } = useSignupStore();

  console.log(bmi);

  // const getProductNameById = (id) => {
  //   const normalizedId = String(id || "");

  //   if (normalizedId === "1") return "Wegovy";
  //   if (normalizedId === "4") return "Mounjaro";

  //   return "Weight Loss Treatment";
  // };

  // const trackCustomerLabsConsultationSubmit = (responseData) => {
  //   console.log("CustomerLabs: function calledd");

  //   if (typeof window === "undefined") return;

  //   if (!window._cl) {
  //     console.log("CustomerLabs: _cl not loaded");
  //     return;
  //   }

  //   const consultationId = responseData?.data?.lastConsultation?.id || "";

  //   const selectedProductId = productId || "";
  //   const selectedProductName = getProductNameById(selectedProductId);

  //   const fname = userData?.fname || firstName || patientInfo?.firstName || "";
  //   const lname = userData?.lname || lastName || patientInfo?.lastName || "";
  //   const email = userData?.email || "";
  //   const phone = userData?.phone || patientInfo?.phoneNo || "";
  //   const userId = userData?.id || "";

  //   const uniqueKey = consultationId
  //     ? `customerlabs_lead_${consultationId}`
  //     : null;

  //   if (uniqueKey && localStorage.getItem(uniqueKey)) {
  //     console.log("CustomerLabs: duplicate event stopped", uniqueKey);
  //     return;
  //   }

  //   const userTraits = {
  //     first_name: {
  //       t: "string",
  //       v: fname,
  //     },
  //     last_name: {
  //       t: "string",
  //       v: lname,
  //     },
  //   };

  //   if (email) {
  //     userTraits.email = {
  //       t: "string",
  //       v: email,
  //     };
  //   }

  //   if (phone) {
  //     userTraits.phone = {
  //       t: "string",
  //       v: String(phone),
  //     };
  //   }

  //   if (userId) {
  //     userTraits.user_id = {
  //       t: "string",
  //       v: String(userId),
  //     };
  //   }

  //   const customProperties = {
  //     user_traits: {
  //       t: "Object",
  //       v: userTraits,
  //     },

  //     form_name: {
  //       t: "string",
  //       v: "Consultation Form",
  //     },

  //     form_id: {
  //       t: "string",
  //       v: "mayfair_consultation_form",
  //     },

  //     page_url: {
  //       t: "string",
  //       v: window.location.href,
  //     },

  //     consultation_id: {
  //       t: "string",
  //       v: String(consultationId),
  //     },

  //     user_id: {
  //       t: "string",
  //       v: String(userId),
  //     },

  //     product_id: {
  //       t: "string",
  //       v: String(selectedProductId),
  //     },

  //     product_name: {
  //       t: "string",
  //       v: selectedProductName,
  //     },

  //     treatment_name: {
  //       t: "string",
  //       v: selectedProductName,
  //     },

  //     event_source: {
  //       t: "string",
  //       v: "confirmation_summary_success",
  //     },
  //   };

  //   if (email) {
  //     customProperties.identify_by_email = {
  //       t: "string",
  //       v: email,
  //       ib: true,
  //     };
  //   }

  //   if (phone) {
  //     customProperties.external_ids = {
  //       t: "Object",
  //       v: {
  //         identify_by_phone: {
  //           t: "string",
  //           v: String(phone),
  //         },
  //       },
  //     };
  //   }

  //   const properties = {
  //     customProperties,
  //   };

  //   if (email || phone) {
  //     window._cl.identify(properties);
  //     console.log("CustomerLabs: identify fired", properties);
  //   }

  //   window._cl.trackSubmit("Lead", properties);
  //   console.log("CustomerLabs: Lead fired", properties);

  //   if (uniqueKey) {
  //     localStorage.setItem(uniqueKey, "true");
  //   }
  // };

  const stepsDataMutation = useMutation(sendStepData, {
    onSuccess: (data) => {
      console.log(data, "dataaaaaaaaaaaaaa");

      if (data?.data?.lastConsultation) {
        console.log(data?.data?.lastConsultation?.fields, "data?.data?.data");
        setBmi(data?.data?.lastConsultation?.fields?.bmi);
        setConfirmationInfo(
          data?.data?.lastConsultation?.fields?.confirmationInfo,
        );
        setGpDetails(data?.data?.lastConsultation?.fields?.gpdetails);
        setMedicalInfo(data?.data?.lastConsultation?.fields?.medicalInfo);
        setPatientInfo(data?.data?.lastConsultation?.fields?.patientInfo);
        setLastBmi(data?.data?.lastConsultation?.fields?.bmi);
      }

      // trackCustomerLabsConsultationSubmit(data);

      trackCustomerLabsLead({
        formName: "Consultation Form",
        formId: "mayfair_consultation_form",
        dedupeKey: data?.data?.lastConsultation?.id
          ? `customerlabs_lead_${data.data.lastConsultation.id}`
          : null,
        identity: {
          firstName: userData?.fname || firstName || patientInfo?.firstName,
          lastName: userData?.lname || lastName || patientInfo?.lastName,
          email: userData?.email,
          phone: userData?.phone || patientInfo?.phoneNo,
          userId: userData?.id,
        },
        properties: {
          consultation_id: data?.data?.lastConsultation?.id || "",
          product_id: productId || "",
          product_name:
            { 1: "Wegovy", 4: "Mounjaro" }[productId] ||
            "Weight Loss Treatment",
          treatment_name:
            { 1: "Wegovy", 4: "Mounjaro" }[productId] ||
            "Weight Loss Treatment",
          event_source: "confirmation_summary_success",
        },
      });

      router.push("/gathering-data");
      return;
    },
    onError: (error) => {
      // setLoading(false);
      setShowLoader(false);
      if (error) {
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
        } else if (error?.response?.data?.original?.errors) {
          console.log(error?.response?.data?.original?.errors, "error");
          // toast.error("Something went wrong");
          // toast.error(error?.response?.data?.original?.errors);
          const errorMessages = error?.response?.data?.original?.errors;
          Object.keys(errorMessages).forEach((key) => {
            const errorMessage = errorMessages[key];
            Array.isArray(errorMessage)
              ? errorMessage.forEach((msg) => toast.error(msg))
              : toast.error(errorMessage);
          });
        } else if (error?.response?.data?.errors) {
          const errorMessages = error?.response?.data?.original?.errors;
          Object.keys(errorMessages).forEach((key) => {
            const errorMessage = errorMessages[key];
            Array.isArray(errorMessage)
              ? errorMessage.forEach((msg) => toast.error(msg))
              : toast.error(errorMessage);
          });
        }
      }
    },
  });

  //handle Confirm
  const hanldeConfirm = async () => {
    setShowLoader(true);

    const formattedMedicalInfo = medicalInfo.map((item) => ({
      question: item.question,
      qsummary: item.qsummary,
      answer: item.answer,
      subfield_response: item.subfield_response,
      sub_field_prompt: item.sub_field_prompt,
      has_sub_field: item.has_sub_field,
    }));

    const fname = firstName ? firstName : patientInfo?.firstName;
    const lname = lastName ? lastName : patientInfo?.lastName;

    const formData = {
      // patientInfo: patientInfo,
      patientInfo: {
        firstName: fname,
        lastName: lname,
        dob: patientInfo?.dob,
        ethnicity: patientInfo?.ethnicity,
        gender: patientInfo?.gender,
        phoneNo: patientInfo?.phoneNo,
        pregnancy: patientInfo?.pregnancy,
        address: patientInfo?.address,
      },
      bmi: bmi,
      gpdetails: gpdetails,
      confirmationInfo: confirmationInfo,
      medicalInfo: formattedMedicalInfo,
      pid: productId,
    };
    stepsDataMutation.mutate(formData);
    // await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    // router.push("/gathering-data");
  };
  const reviewAll = () => {
    router.push("/review-answers");
  };

  const back = () => {
    if (reorderBackProcess == true) {
      router.push("/bmi-detail");
    } else {
      router.push("/gp-detail");
    }
  };
  return (
    <>
      <MetaLayout canonical={`${meta_url}confirmation-summary/`} />

      <StepsHeader percentage={95} />
      <FormWrapper
        className={"!pb-0"}
        heading="Consultation Form Summary"
        description="It’s important your answers are accurate, as we’ll use them to determine your suitability for the treatment."
      >
        <PageAnimationWrapper>
          <div className="relative">
            <div className="space-y-6 ">
              {/* Summary Box */}
              <div className="bg-[#E9F6FA] border border-green-100 rounded-md p-5 text-sm text-gray-800">
                <p className="bold-font text-black mb-1">
                  <span className="bold-font paragraph capitalize">
                    Full Name:{" "}
                  </span>
                  {firstName ? (
                    <>
                      {" "}
                      <span className="bold-font paragraph !text-black capitalize">
                        {firstName} {lastName}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="bold-font paragraph capitalize">
                        {patientInfo?.firstName} {patientInfo?.lastName}
                      </span>
                    </>
                  )}
                </p>
                {/* <hr className="border-gray-300 mb-3" /> */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                  <p className="bold-font text-black">
                    <span className="bold-font paragraph">Post code: </span>
                    <span className="bold-font paragraph !text-black capitalize">
                      {patientInfo?.address?.postalcode}
                    </span>
                  </p>
                  <p className="bold-font text-black">
                    <span className="bold-font paragraph">Date of Birth:</span>{" "}
                    {patientInfo?.dob}
                  </p>
                  <p className="bold-font text-black">
                    <span className="bold-font paragraph">Height:</span>{" "}
                    {bmi?.height_unit == "imperial" ? (
                      <span className="bold-font paragraph !text-black capitalize">
                        {bmi?.ft} ft {bmi?.inch} inch
                      </span>
                    ) : (
                      <span className="bold-font paragraph !text-black capitalize">
                        {bmi?.cm} cm
                      </span>
                    )}
                  </p>
                  <p className="bold-font text-black">
                    <span className="bold-font paragraph">Gender:</span>{" "}
                    <span className="bold-font paragraph !text-black capitalize">
                      {patientInfo?.gender}
                    </span>
                  </p>
                  <p className="bold-font text-black">
                    <span className="bold-font paragraph">Weight:</span>{" "}
                    {bmi?.weight_unit == "metrics" ? (
                      <span className="bold-font paragraph !text-black capitalize">
                        {bmi?.kg} kg
                      </span>
                    ) : (
                      <span className="bold-font paragraph !text-black capitalize">
                        {bmi?.stones} stones {bmi?.pound} pound
                      </span>
                    )}
                  </p>
                  <p className="bold-font text-black paragraph">
                    <span className="paragraph mt-1">BMI: </span>
                    <span className="bold-font paragraph !text-black capitalize">
                      {bmi?.bmi?.toFixed(1)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Confirm & Review Buttons */}
              <div className="space-y-3 flex justify-between items-center relative mt-6">
                <BackButton label="Back" onClick={back} />

                <NextButton label="Next" onClick={hanldeConfirm} />
              </div>
              {showLoader && (
                <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                  <PageLoader />
                </div>
              )}
            </div>
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
      <div className="flex justify-center items-center mt-4 mb-6">
        <button onClick={reviewAll}>
          <span className="text-xs sm:text-sm reg-font text-primary underline hover:text-blue-600 cursor-pointer">
            Review all answers
          </span>
        </button>
      </div>
    </>
  );
};

export default ConfirmationSummary;
