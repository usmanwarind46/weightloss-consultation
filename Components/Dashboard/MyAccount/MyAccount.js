import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarDays, Grid2X2, List, Pill, RefreshCcw, User } from "lucide-react";

import { GetProductsApi, GetImageIsUplaod } from "@/api/mergeRoutes";
import { GetIdVerification } from "@/api/IdVerificationApi";
import { GetPrescriptionEvidence } from "@/api/PrescriptionEvidenceApi";
import ProductCard from "@/Components/ProductCard/ProdcutCard";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";
import useProductId from "@/store/useProductIdStore";
import useReorder from "@/store/useReorderStore";
import useCouponStore from "@/store/couponStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import useExplanationEvidenceStore from "@/store/useExplanationEvidenceStore";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";
import useSignupStore from "@/store/signupStore";
import UploadTopPrompt from "@/Components/UploadTopPrompt/UploadTopPrompt";
import { userConsultationApi } from "@/api/consultationApi";
import useBmiStore from "@/store/bmiStore";
import useCheckoutStore from "@/store/checkoutStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useLastBmi from "@/store/useLastBmiStore";
import lastOrderStore from "@/store/lastOrderStore";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useReturning from "@/store/useReturningPatient";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";

/* ── Skeleton ── */
const SkeletonCard = ({ viewMode = "list" }) => {
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4">
        <div className="h-[68px] w-[68px] shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-[30%] animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-[55%] animate-pulse rounded-full bg-slate-100" />
          <div className="h-3 w-[70%] animate-pulse rounded-full bg-slate-100/70" />
        </div>
        <div className="h-9 w-[130px] shrink-0 animate-pulse rounded-xl bg-[#4565BF]/[0.07]" />
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="h-[170px] w-full animate-pulse bg-slate-100" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-[65%] animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-[90%] animate-pulse rounded-full bg-slate-100" />
        <div className="mt-3 h-9 w-full animate-pulse rounded-xl bg-[#4565BF]/[0.07]" />
      </div>
    </div>
  );
};

/* ── Reorder Card Skeleton ── */
const ReorderSkeletonCard = () => (
  <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white sm:flex-row">
    <div className="flex h-[150px] w-full shrink-0 items-center justify-center bg-slate-100/60 sm:h-auto sm:w-[160px] lg:w-[120px] xl:w-[160px] 2xl:w-[200px]">
      <div className="h-[100px] w-[100px] animate-pulse rounded-2xl bg-slate-200" />
    </div>
    <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5 lg:flex-col lg:items-stretch lg:p-4 xl:flex-row xl:items-center 2xl:p-6">
      <div className="flex-1 space-y-2.5">
        <div className="h-3 w-28 animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-[65%] animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-[80%] animate-pulse rounded-full bg-slate-100/70" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-3">
        <div className="h-3 w-10 animate-pulse rounded-full bg-slate-100" />
        <div className="h-7 w-16 animate-pulse rounded-full bg-slate-100" />
        <div className="h-9 w-[150px] animate-pulse rounded-xl bg-[#4565BF]/[0.07]" />
      </div>
    </div>
  </div>
);

/* ── Page Header ── */
export const PageHeader = ({ label, title, subtitle, right }) => (
  <div className="relative overflow-hidden rounded-2xl border border-[#e0e6f7] px-5 py-5 sm:px-7 sm:py-6 2xl:px-9 2xl:py-8"
    style={{ backgroundImage: "radial-gradient(120% 140% at 88% 0, #e8ecfb 0%, #f2f4fc 42%, #FBFBFD 78%)" }}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="inter-semibold-font text-[10px] lg:text-[10px] 2xl:text-[11px] uppercase tracking-[0.16em] text-[#4565BF]/70 mb-2">
          {label}
        </p>
        <h1 className="inter-bold-font text-[21px] leading-tight tracking-[-0.025em] text-slate-900 sm:text-[25px] lg:text-[25px] 2xl:text-[31px] capitalize">
          {title}
        </h1>
        {subtitle && (
          <p className="inter-reg-font mt-1.5 text-[12.5px] lg:text-[13px] 2xl:text-[14px] text-slate-500">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  </div>
);

/* ── View toggle ── */
const ViewToggle = ({ productView, setProductView }) => (
  <div className="flex shrink-0 flex-col items-end gap-1.5">
    <span className="inter-medium-font text-[11px] uppercase tracking-[0.1em] text-slate-400">View as</span>
    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 gap-0.5">
      {[
        { mode: "list", Icon: List, label: "List" },
        { mode: "grid", Icon: Grid2X2, label: "Grid" },
      ].map(({ mode, Icon, label }) => (
        <button
          key={mode}
          type="button"
          onClick={() => setProductView(mode)}
          aria-pressed={productView === mode}
          className={`inter-semibold-font inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] transition-all duration-150 cursor-pointer
            ${productView === mode
              ? "bg-white text-[#4565BF] shadow-sm border border-slate-200/80 ring-1 ring-[#4565BF]/10"
              : "text-slate-400 hover:text-slate-700"
            }`}
        >
          <Icon size={15} strokeWidth={productView === mode ? 2.5 : 2} />
          {label}
        </button>
      ))}
    </div>
  </div>
);

/* ── Empty treatments ── */
const EmptyTreatments = () => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
    <Pill size={20} strokeWidth={1.5} className="mx-auto text-slate-300" />
    <p className="inter-medium-font mt-3 text-[13px] text-slate-600">No treatments available</p>
    <p className="inter-reg-font mt-1 text-[12px] text-slate-400">Treatments will appear here when available.</p>
  </div>
);

/* ── My Account ── */
const MyAccount = () => {
  const { imageUploaded, setImageUploaded } = useImageUploadStore();
  const { reorder } = useReorder();
  const { token } = useAuthStore();
  const { idVerificationUpload, setIdVerificationUpload } = useIdVerificationUploadStore();
  const { setExplainenationEvidence, setExplainenationEvidenceDetails } = useExplanationEvidenceStore();

  const router = useRouter();
  const pathname = usePathname();
  const normalizedPathname = pathname?.endsWith("/") ? pathname : `${pathname || "/"}/`;

  const dashboardRoutes = ["/dashboard/", "/orders/", "/address/", "/change-password/", "/order-detail/", "/profile/", "/weight-loss-journey/"];
  const isDashboardRoute = dashboardRoutes.includes(normalizedPathname);

  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [productView, setProductView] = useState("list");
  const [isReorderLoading, setIsReorderLoading] = useState(false);
  const [uploadStatusLoading, setUploadStatusLoading] = useState(true);
  const [cachedHasReorder, setCachedHasReorder] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("mf_has_reorder") === "true";
    return false;
  });

  const {
    authUserDetail,
    setAuthUserDetail,
    clearAuthUserDetail,
    setIsReturning,
  } = useAuthUserDetailStore();
  const { setReorderBackProcess } = useReorderBackProcessStore();
  const { setProductId } = useProductId();
  const { setReorder } = useReorder();
  const { clearCoupon } = useCouponStore();
  const { setBmi, clearBmi } = useBmiStore();
  const { setCheckout, clearCheckout } = useCheckoutStore();
  const { setConfirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
  const { setGpDetails, clearGpDetails } = useGpDetailsStore();
  const { setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { setPatientInfo, clearPatientInfo } = usePatientInfoStore();
  const { setLastBmi } = useLastBmi();
  const { setLastOrder, clearLastOrder } = lastOrderStore();
  const { setIsReturningPatient } = useReturning();
  const {
    setBilling,
    setShipping,
    setCheckShippingForAccordion,
    setCheckBillingForAccordion,
    clearShipping,
    clearBilling,
  } = useShippingOrBillingStore();

  useEffect(() => { setReorderBackProcess(false); }, [setReorderBackProcess]);
  const getProducts = useMutation(GetProductsApi, {
    onSuccess: (response) => {
      const data = response?.data?.data || {};
      setProductData(data);
      const hasReorder = !!(data?.reorder);
      setCachedHasReorder(hasReorder);
      localStorage.setItem("mf_has_reorder", String(hasReorder));
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.errors || "Something went wrong");
      setIsLoading(false);
    },
  });

  useEffect(() => { getProducts.mutate({ data: {} }); }, []);
  useEffect(() => { setIsReturning(productData?.reorder != null); }, [productData?.reorder, setIsReturning]);

  const reorderProducts = useMemo(() => {
    if (Array.isArray(productData?.reorder)) return productData.reorder;
    return productData?.reorder ? [productData.reorder] : [];
  }, [productData?.reorder]);

  const currentTreatment = reorderProducts[0] || null;

  const reorderProductIds = useMemo(() =>
    new Set(reorderProducts.map((p) => p?.id).filter(Boolean).map(String)),
    [reorderProducts]
  );

  const availableProducts = useMemo(() => {
    if (!Array.isArray(productData?.products)) return [];
    return [...productData.products]
      .filter((p) => p?.id == null || !reorderProductIds.has(String(p.id)))
      .sort((a, b) => (a?.sequence || 0) - (b?.sequence || 0));
  }, [productData?.products, reorderProductIds]);

  const { firstName, setFirstName, setLastName } = useSignupStore();
  const displayName = authUserDetail?.fname?.trim() || firstName?.trim() || "Patient";
  const displayEmail = authUserDetail?.email?.trim() || "Not available";
  const lastOrderDate = currentTreatment?.lastOrderDate || currentTreatment?.last_order_date || currentTreatment?.last_order?.created_at || "Not available";
  const currentTreatmentDisplayPrice = currentTreatment?.pre_launch_price || currentTreatment?.price || null;

  const reorderConsultationMutation = useMutation(userConsultationApi, {
    onSuccess: (response) => {
      const consultationData = response?.data?.data;

      if (consultationData == null) {
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
      } else {
        setBmi(consultationData?.bmi);
        setCheckout(consultationData?.checkout);
        setConfirmationInfo(consultationData?.confirmationInfo);
        setGpDetails(consultationData?.gpdetails);
        setMedicalInfo(consultationData?.medicalInfo);
        setPatientInfo(consultationData?.patientInfo);
        setShipping(consultationData?.shipping);
        setCheckShippingForAccordion(consultationData?.shipping);
        setBilling(consultationData?.billing);
        setCheckBillingForAccordion(consultationData?.billing);
        setAuthUserDetail(consultationData?.auth_user);
        setLastBmi(consultationData?.bmi);
        setFirstName(consultationData?.auth_user?.fname);
        setLastName(consultationData?.auth_user?.lname);
        setIsReturning(consultationData?.isReturning);
        setIsReturningPatient(consultationData?.isReturning);
        setLastOrder(consultationData?.last_order);
      }

      setReorder(true);
      clearCoupon();
      setReorderBackProcess(false);
      setIsReorderLoading(false);
      router.push("/re-order");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.errors?.email ||
          "Unable to load your previous consultation. Please try again.",
      );
      setIsReorderLoading(false);
    },
  });

  const handleReorder = (productId) => {
    if (!productId || isReorderLoading) return;

    setIsReorderLoading(true);
    setProductId(productId);
    reorderConsultationMutation.mutate({
      clinic_id: 2,
      product_id: productId,
    });
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [imgRes, idRes] = await Promise.all([
          GetImageIsUplaod({ reorder }),
          GetIdVerification({ reorder }),
        ]);
        if (!cancelled) {
          setImageUploaded(imgRes?.data?.status);
          setIdVerificationUpload(idRes?.data?.status);
        }
      } catch { } finally {
        if (!cancelled) setUploadStatusLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [reorder]);

  useEffect(() => {
    const run = async () => {
      try {
        const r = await GetPrescriptionEvidence({ token });
        setExplainenationEvidence(r?.data?.require_evidence);
        setExplainenationEvidenceDetails(r?.data);
      } catch { }
    };
    run();
  }, []);

  return (
    <main className="inter-reg-font min-w-0 flex-1 bg-[#E8EDFA]">
      <div className="flex w-full flex-col gap-6 p-4 sm:p-5 lg:p-6 2xl:p-8 2xl:gap-8">

        {/* Header */}
        <PageHeader
          label="My Account"
          title={`Welcome, ${displayName}`}
          subtitle="Here's an overview of your account."
          right={
            <div className="flex items-center gap-3 rounded-xl border border-[#e0e6f7] bg-white/80 px-4 py-2.5">
              <div className="min-w-0">
                <p className="inter-medium-font text-[9.5px] lg:text-[10px] uppercase tracking-[0.1em] text-slate-400 leading-none mb-1">Logged in as</p>
                <p className="inter-semibold-font text-[12px] lg:text-[12px] 2xl:text-[13px] text-slate-800 truncate max-w-[160px]">{displayEmail}</p>
              </div>
            </div>
          }
        />
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-6">
            {isDashboardRoute && <UploadTopPrompt isLoading={uploadStatusLoading} />}
          </div>
        </div>

        {isLoading ? (
          cachedHasReorder ? (
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-6">
              <div className="flex flex-col gap-3 lg:col-span-6">
                <div>
                  <div className="h-5 w-40 animate-pulse rounded-full bg-[#4565BF]/[0.08]" />
                  <div className="mt-2 h-3 w-[65%] animate-pulse rounded-full bg-[#4565BF]/[0.05]" />
                </div>
                <ReorderSkeletonCard />
              </div>
              <div className="flex flex-col gap-3 lg:col-span-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="h-5 w-44 animate-pulse rounded-full bg-[#4565BF]/[0.08]" />
                    <div className="mt-2 h-3 w-[75%] animate-pulse rounded-full bg-[#4565BF]/[0.05]" />
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <div className="h-3 w-12 animate-pulse rounded-full bg-[#4565BF]/[0.05]" />
                    <div className="h-10 w-[88px] animate-pulse rounded-xl bg-[#4565BF]/[0.07]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[0, 1, 2].map((i) => <SkeletonCard key={i} viewMode="list" />)}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12">
              <div className="col-span-12 flex flex-col gap-3 lg:col-span-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="h-5 w-44 animate-pulse rounded-full bg-[#4565BF]/[0.08]" />
                    <div className="mt-2 h-3 w-[75%] animate-pulse rounded-full bg-[#4565BF]/[0.05]" />
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <div className="h-3 w-12 animate-pulse rounded-full bg-[#4565BF]/[0.05]" />
                    <div className="h-10 w-[88px] animate-pulse rounded-xl bg-[#4565BF]/[0.07]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[0, 1, 2].map((i) => <SkeletonCard key={i} viewMode="list" />)}
                </div>
              </div>
            </div>
          )
        ) : currentTreatment ? (
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:gap-6">
            <div className="contents">
              <div className="order-1 lg:col-span-6">
                <h2 className="inter-bold-font text-[15px] lg:text-[16px] 2xl:text-[19px] text-slate-900">Reorder Treatment</h2>
                <p className="inter-reg-font mt-0.5 text-[12px] lg:text-[12.5px] 2xl:text-[13.5px] text-slate-500">
                  Continue your latest clinician-approved treatment.
                </p>
              </div>
              <div className="order-3 block sm:flex items-center justify-between gap-3 lg:order-2 lg:col-span-6">
                <div>
                  <h2 className="inter-bold-font text-[15px] lg:text-[16px] 2xl:text-[19px] text-slate-900">Available Treatments</h2>
                  <p className="inter-reg-font mt-0.5 text-[12px] lg:text-[12.5px] 2xl:text-[13.5px] text-slate-500">
                    We offer the following weight loss injections treatment options to help you in your weight loss journey.
                  </p>
                </div>
                <ViewToggle productView={productView} setProductView={setProductView} />
              </div>
            </div>

            <div className="contents">
              <div className="order-2 flex flex-col pb-5 lg:order-3 lg:col-span-6 lg:pb-0">
                <div className="flex flex-col overflow-hidden rounded-2xl border border-[#4565BF]/[0.12] bg-white shadow-[0_4px_20px_rgba(69,101,191,0.08)] sm:flex-row lg:h-[210px] 2xl:h-[220px]">
                  <div className="flex h-[150px] w-full shrink-0 items-center justify-center border-b border-[#4565BF]/[0.08] bg-[#f2f4fb] sm:h-auto sm:w-[150px] sm:border-b-0 sm:border-r lg:w-[130px] xl:w-[150px] 2xl:w-[170px]">
                    {currentTreatment?.img ? (
                      <img
                        src={currentTreatment.img}
                        alt={currentTreatment?.name}
                        className="h-[110px] w-[110px] object-contain lg:h-[96px] lg:w-[96px] xl:h-[110px] xl:w-[110px] 2xl:h-[120px] 2xl:w-[120px]"
                      />
                    ) : (
                      <Pill size={48} strokeWidth={1.5} className="text-slate-300" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col items-stretch justify-between gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5 lg:p-4 xl:p-5 2xl:gap-6">
                    <div className="min-w-0">
                      <span className="inter-semibold-font mb-2 inline-flex items-center rounded-full bg-[#4565BF]/[0.09] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#4565BF]">
                        Your treatment
                      </span>
                      <div className="flex items-center gap-1.5 mb-3 mt-1.5">
                        <CalendarDays size={11} strokeWidth={2} className="text-slate-400" />
                        <span className="inter-reg-font text-[11.5px] text-slate-400">
                          Last ordered: <span className="inter-medium-font text-slate-600">{lastOrderDate}</span>
                        </span>
                      </div>
                      <h3 className="inter-bold-font break-words text-[16px] leading-tight text-slate-900 xl:truncate 2xl:text-[17px]">
                        {currentTreatment?.name}
                      </h3>
                      <p className="inter-reg-font mt-1 text-[12px] text-slate-500">
                        Your latest clinician-approved treatment.
                      </p>
                    </div>

                    <div className="flex shrink-0 items-end justify-between gap-3 sm:flex-col sm:justify-start">
                      {currentTreatmentDisplayPrice && (
                        <div className="text-right">
                          <p className="inter-reg-font text-[10px] uppercase tracking-[0.1em] text-slate-400">From</p>
                          <p className="inter-bold-font text-[22px] 2xl:text-[24px] text-[#4565BF] leading-none mt-0.5">
                            £{currentTreatmentDisplayPrice}
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleReorder(currentTreatment?.id)}
                        disabled={!currentTreatment?.id || isReorderLoading}
                        className={`inter-medium-font inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] text-white transition-all duration-150 whitespace-nowrap
                          ${!currentTreatment?.id || isReorderLoading
                            ? "cursor-not-allowed bg-slate-200 text-slate-400"
                            : "cursor-pointer bg-[#4565BF] hover:bg-[#3550a0] active:scale-[0.98]"
                          }`}
                      >
                        {isReorderLoading ? (
                          <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Processing...</>
                        ) : (
                          <><RefreshCcw size={13} strokeWidth={2.2} />Reorder treatment</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-4 flex flex-col gap-3 lg:col-span-6">
                {isLoading ? (
                  <div className={productView === "list" ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
                    {[0, 1, 2].map((i) => <SkeletonCard key={i} viewMode={productView} />)}
                  </div>
                ) : availableProducts.length > 0 ? (
                  <div className={productView === "list" ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
                    {availableProducts.map((product, index) => (
                      <ProductCard
                        key={product?.id || product?.sequence || index}
                        id={product?.id}
                        title={product?.name}
                        description={product?.short_description || product?.description || product?.subtitle}
                        image={product?.img}
                        price={product?.price || "N/A"}
                        pre_launch_price={product?.pre_launch_price || null}
                        status={product?.inventories?.[0]?.status}
                        buttonText="Start Consultation"
                        reorder={false}
                        viewMode={productView}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyTreatments />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12">
            <section className="col-span-12 lg:col-span-6">
              <div className="mb-3 block sm:flex items-center justify-between gap-3">
                <div>
                  <h2 className="inter-bold-font text-[15px] lg:text-[16px] 2xl:text-[19px] text-slate-900">Available Treatments</h2>
                  <p className="inter-reg-font mt-0.5 text-[12px] lg:text-[12.5px] 2xl:text-[13.5px] text-slate-500">
                    We offer the following weight loss injections treatment options to help you in your weight loss journey.
                  </p>
                </div>
                <ViewToggle productView={productView} setProductView={setProductView} />
              </div>

              {availableProducts.length > 0 ? (
                <div className={productView === "list" ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                  {availableProducts.map((product, index) => (
                    <ProductCard
                      key={product?.id || product?.sequence || index}
                      id={product?.id}
                      title={product?.name}
                      description={product?.short_description || product?.description || product?.subtitle}
                      image={product?.img}
                      price={product?.price || "N/A"}
                      pre_launch_price={product?.pre_launch_price || null}
                      status={product?.inventories?.[0]?.status}
                      buttonText="Start Consultation"
                      reorder={false}
                      viewMode={productView}
                    />
                  ))}
                </div>
              ) : (
                <EmptyTreatments />
              )}
            </section>
          </div>
        )}

      </div>
    </main>
  );
};

export default MyAccount;
