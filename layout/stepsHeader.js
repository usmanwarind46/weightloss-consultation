import React, { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import ApplicationLogo from "@/config/ApplicationLogo";
import ApplicationUser from "@/config/ApplicationUser";
import Link from "next/link";
import useSignupStore from "@/store/signupStore";
import useAuthStore from "@/store/authStore";
import LoginModal from "@/Components/LoginModal/LoginModal";
import useLoginModalStore from "@/store/useLoginModalStore";
import { Login } from "@/api/loginApi";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Fetcher from "@/library/Fetcher";
import { useRouter } from "next/router";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useCheckoutStore from "@/store/checkoutStore";
import useBmiStore from "@/store/bmiStore";
import usePasswordReset from "@/store/usePasswordReset";
import { usePathname } from "next/navigation";
import useProductId from "@/store/useProductIdStore";
import { Menu, MenuItem } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import useLastBmi from "@/store/useLastBmiStore";
import useUserDataStore from "@/store/userDataStore";
import useImpersonate from "@/store/useImpersonateStore";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import useReturning from "@/store/useReturningPatient";
import UploadTopPrompt from "@/Components/UploadTopPrompt/UploadTopPrompt";
import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import useExplanationEvidenceStore from "@/pages/useExplanationEvidenceStore";
import useReorder from "@/store/useReorderStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import { GetIdVerification } from "@/api/IdVerificationApi";
import { GetImageIsUplaod } from "@/api/mergeRoutes";
import { GetPrescriptionEvidence } from "@/api/PrescriptionEvidenceApi";
import useAbandonCardStore from "@/store/abandonCardStore";
import lastOrderStore from "@/store/lastOrderStore";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";
import { BASE_PATH } from "@/library/basePath";

const StepsHeader = ({ isOpen, toggleSidebar, percentage }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { showLoginModal, closeLoginModal, openLoginModal } =
    useLoginModalStore();
  const { clearLastOrder } = lastOrderStore();
  const { abandonCard, clearAbandonCard } = useAbandonCardStore();

  const [showLoader, setShowLoader] = useState(false);
  const { setIsReturningPatient } = useReturning();
  const { clearBmi } = useBmiStore();
  const { clearCheckout } = useCheckoutStore();
  const { clearConfirmationInfo } = useConfirmationInfoStore();
  const { clearGpDetails } = useGpDetailsStore();
  const { clearMedicalInfo } = useMedicalInfoStore();
  const { clearPatientInfo } = usePatientInfoStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
  const { authUserDetail, clearAuthUserDetail, setAuthUserDetail } =
    useAuthUserDetailStore();
  const { token, clearToken, setToken, setIsImpersonationLogout, clearReview } =
    useAuthStore();
  const { clearShipping, clearBilling } = useShippingOrBillingStore();
  const { clearProductId } = useProductId();
  const { clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();
  const { impersonate, setImpersonate } = useImpersonate();

  const { reorder } = useReorder();
  const { imageUploaded, setImageUploaded } = useImageUploadStore();
  const { idVerificationUpload, setIdVerificationUpload } =
    useIdVerificationUploadStore();
  const {
    explainenationEvidence,
    setExplainenationEvidence,
    setExplainenationEvidenceDetails,
  } = useExplanationEvidenceStore();

  const {
    firstName,
    setFirstName,
    setLastName,
    setEmail,
    clearFirstName,
    clearLastName,
    clearEmail,
    clearConfirmationEmail,
  } = useSignupStore();
  const pathname = usePathname();

  const router = useRouter();
  const { setIsPasswordReset, setShowResetPassword } = usePasswordReset();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const handleLogout = () => {
    setAnchorEl(null);
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
    setShowResetPassword(true);
    setImpersonate(false);
    setIsReturningPatient(false);
    clearLastOrder();
    clearAbandonCard();
    clearReview();
    router.push(`${BASE_PATH}/login`);
  };

  const validPathDashboard =
    pathname === "/dashboard/" ||
    pathname === "/profile/" ||
    pathname === "/orders/" ||
    pathname === "/address/" ||
    pathname === "/change-password/" ||
    pathname === "/order-detail/" ||
    pathname === "/weight-loss-journey/";

  const loginMutation = useMutation(Login, {
    onSuccess: (data) => {
      const user = data?.data?.data;
      setAuthUserDetail(user);
      console.log(data?.data?.data, "data?.data?.data");
      setToken(user.token);
      toast.success("Login Successfully");
      Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
      setShowLoader(false);
      closeLoginModal();
      setFirstName(data?.data?.data?.fname);
      setLastName(data?.data?.data?.lname);
      setEmail(data?.data?.data?.email);
      if (abandonCard?.type === "abandoned-cart") {
        router.push(`${BASE_PATH}/gathering-data`);
      } else {
        router.push(`${BASE_PATH}/dashboard`);
      }
      setIsPasswordReset(false);
      setShowResetPassword(data?.data?.data?.show_password_reset);
      setIsReturningPatient(user?.isReturning);
    },
    onError: (error) => {
      const errors = error?.response?.data?.errors;
      if (errors && typeof errors === "object") {
        Object.values(errors).forEach((err) => {
          if (Array.isArray(err)) {
            err.forEach((msg) => toast.error(msg));
          } else {
            toast.error(err);
          }
        });
      }
      setShowLoader(false);
    },
  });

  const handleRemovedImpersonate = () => {
    setIsReturningPatient(false);
    setAnchorEl(null);
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
    setIsPasswordReset(true);
    clearProductId();
    clearLastBmi();
    clearUserData();
    clearFirstName();
    clearLastName();
    clearEmail();
    clearConfirmationEmail();
    setShowResetPassword(true);
    clearToken();
    setIsImpersonationLogout(true);
    setImpersonate(false);
    clearLastOrder();
    clearAbandonCard();
    clearReview();
    window.location.href = "https://app.onlineweightlossclinic.co.uk/dashboard";
  };
  const loginPath = pathname === "/login/";

  const specialRoutes = [
    "/dashboard/",
    "/orders/",
    "/address/",
    "/change-password/",
    "/order-detail/",
    "/profile/",
    "/weight-loss-journey/",
  ];

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({ reorder });
        console.log("Image Upload Response", res);
        setImageUploaded(res?.data?.status);
      } catch (error) {
        console.error("Failed to fetch image status:", error);
      }
    };

    fetchImageStatus();
  }, [reorder]);

  // here isExplanationEvidence store
  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetIdVerification({ reorder });
        console.log("Verification Image Status", res);
        setIdVerificationUpload(res?.data?.status);
      } catch (error) {
        console.error("Failed to fetch image status:", error);
      }
    };

    fetchImageStatus();
  }, [reorder]);
  const GetEvidence = async () => {
    try {
      const res = await GetPrescriptionEvidence({ token });
      console.log("Prescription Evidence Status", res);
      setExplainenationEvidence(res?.data?.require_evidence);
      setExplainenationEvidenceDetails(res?.data);
    } catch (error) {
      console.error("Failed to fetch prescription evidence status:", error);
    }
  };
  useEffect(() => {
    GetEvidence();
  }, []);
  const handleLogoClick = () => {
    if (specialRoutes.includes(pathname)) {
      setShowConfirmModal(false);
      window.location.href = "https://www.onlineweightlossclinic.co.uk/";
    } else {
      setShowConfirmModal(true);
    }
  };
  // if user click the logo modal open
  const handleConfirmNavigation = () => {
    setShowConfirmModal(false);
    window.location.href = "https://www.onlineweightlossclinic.co.uk/";
  };

  const handleCancelNavigation = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      {(!imageUploaded || !idVerificationUpload) &&
        specialRoutes.includes(pathname) && <UploadTopPrompt />}

      {impersonate && (
        <div className="bg-gray-100">
          <div className="bg-red-500 text-white text-center p-2 flex flex-col sm:flex-row justify-center items-center gap-2 text-sm sm:text-base reg-font">
            <div className="flex items-center gap-2">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                className="text-xl"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H8v-1.5c0-1.99 4-3 6-3s6 1.01 6 3V16z"></path>
              </svg>
              <span>You are impersonating another user.</span>
            </div>
            <button
              className="ml-0 sm:ml-2 underline flex items-center gap-1 text-xs sm:text-sm reg-font cursor-pointer"
              onClick={handleRemovedImpersonate}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                className="text-xl"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H8v-1.5c0-1.99 4-3 6-3s6 1.01 6 3V16z"></path>
              </svg>
              <span>Stop Impersonation</span>
            </button>
          </div>
        </div>
      )}
      <header className="bg-white w-full py-2 sm:px-4 px-4">
        <div
          className={`flex py-2 sm:px-3 lg:px-3 ${
            loginPath && !token ? "justify-center" : "justify-between"
          }`}
        >
          {/* Hamburger (Mobile) */}
          {validPathDashboard && (
            <button
              onClick={toggleSidebar}
              className="text-2xl text-primary sm:hidden"
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          )}

          {/* Logo */}
          {/* <div
            className={`w-2 ${token
                ? loginPath
                  ? "sm:w-36"
                  : "sm:w-32"
                : "sm:w-48"
              }`}
          >


          </div> */}
          <div
            className="w-32 sm:w-auto cursor-pointer"
            onClick={handleLogoClick}
          >
            <ApplicationLogo width={140} height={120} />
          </div>

          {/* User Info or Login CTA */}
          <div className="relative">
            {!pathname?.startsWith("/login") && token && (
              <>
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <ApplicationUser className="w-10 h-10 rounded-full" />
                  <span className="reg-font text-[#1C1C29] truncate">
                    {authUserDetail?.fname?.trim()
                      ? authUserDetail.fname
                      : firstName}
                  </span>
                  <IoIosArrowDown
                    className={`text-gray-700 transform transition-transform duration-200 ${Boolean(anchorEl) ? "rotate-180" : ""}`}
                    size={20}
                  />
                </div>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{ style: { width: 200 } }}
                >
                  <MenuItem
                    onClick={() => {
                      router.push(`${BASE_PATH}/dashboard`);
                      setAnchorEl(null);
                    }}
                    className="reg-font"
                  >
                    My Account
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      router.push(`${BASE_PATH}/orders`);
                      setAnchorEl(null);
                    }}
                    className="reg-font"
                  >
                    My Orders
                  </MenuItem>
                  <MenuItem onClick={handleLogout} className="reg-font">
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}

            {!pathname?.startsWith("/login") && !token && (
              <div className="w-1/2 items-center justify-end lg:w-[100%] sm:flex mt-2">
                <p className="md:block text-black reg-font lg:w-[100%] sm:flex hidden">
                  Already have an account?
                </p>
                <span
                  className="cursor-pointer inline-flex items-center px-6 py-2 bg-primary border border-transparent rounded-full font-semibold text-xs text-white uppercase tracking-widest hover:bg-[#4565BF] focus:bg-bg-[#4565BF] active:bg-primary focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition ease-in-out duration-150 ml-4"
                  onClick={openLoginModal}
                >
                  Login
                </span>
              </div>
            )}
          </div>
        </div>
      </header>
      {percentage && percentage !== "0" && percentage !== "100" && (
        <ProgressBar percentage={percentage} />
      )}

      <LoginModal
        modes="login"
        show={showLoginModal}
        onClose={closeLoginModal}
        onLogin={(data) => {
          setEmail(data.email);
          setShowLoader(true);
          loginMutation.mutate({ ...data, company_id: 2 });
        }}
        isLoading={showLoader}
      />

      <ConfirmationModal
        label="Are you sure you want to leave this consultation? You’ll need to restart the process."
        showModal={showConfirmModal}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
    </>
  );
};

export default StepsHeader;
