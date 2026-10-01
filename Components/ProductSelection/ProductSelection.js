import React, { useEffect, useState } from "react";
import FullScreenModal from "../FullScreenModal/FullScreenModal";
import { GetProductsApi } from "@/api/mergeRoutes";
import useProductId from "@/store/useProductIdStore";
import { useMutation } from "@tanstack/react-query";
import ModalProductListCard from "./ModalProductListCard";
import toast from "react-hot-toast";
import { userConsultationApi } from "@/api/consultationApi";
import useCheckoutStore from "@/store/checkoutStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useLastBmi from "@/store/useLastBmiStore";
import useReturning from "@/store/useReturningPatient";
import useSignupStore from "@/store/signupStore";
import useBmiStore from "@/store/bmiStore";
import Router from "next/router";
import NextButton from "../NextButton/NextButton";
import BackButton from "../BackButton/BackButton";
import useReorderButtonStore from "@/store/useReorderButton";
import useReorder from "@/store/useReorderStore";
import { getApiErrorMessage, goBackOr, isUnauthorized, useIsMounted } from "@/utils/apiError";
import useAuthStore from "@/store/authStore";

const ProductSelection = ({ showProductSelection }) => {
  /* ───────────────  skeleton card ────────────── */
  const SkeletonCard = () => (
    <div className="flex h-full select-none flex-col items-stretch gap-2 rounded-2xl border border-slate-200/70 bg-white px-3 py-3 sm:h-auto sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3.5">
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-[#4565BF]/[0.07] sm:h-[64px] sm:w-[64px]" />

      <div className="min-w-0 sm:flex-1">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#4565BF]/[0.08]" />
      </div>

      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
        <div className="flex flex-col items-end gap-1.5">
          <div className="h-2.5 w-8 animate-pulse rounded-full bg-[#4565BF]/[0.05]" />
          <div className="h-4 w-14 animate-pulse rounded-full bg-[#4565BF]/[0.08]" />
        </div>
        <div className="h-9 w-full shrink-0 animate-pulse rounded-xl bg-[#4565BF]/[0.06] sm:w-[142px]" />
      </div>
    </div>
  );
  /* ───────────────  local state ────────────── */
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [showModal, setShowModal] = useState(showProductSelection);
  const [selectedProductId, setSelectedProductId] = useState(null); // NEW
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [redirection, setRedirection] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isSlow, setIsSlow] = useState(false);
  const isMounted = useIsMounted();

  /* ───────────────  stores (init only what we SET/CLEAR) ────────────── */
  const { setReorder } = useReorder();
  const { clearToken } = useAuthStore();

  const { setProductId, productId } = useProductId();
  const { firstName, lastName, setFirstName, setLastName } = useSignupStore();
  const { isFromReorder } = useReorderButtonStore();

  console.log(firstName, lastName, "product selection");
  /* ───────────────  products mutation ────────────── */
  const getProducts = useMutation(GetProductsApi, {
    onSuccess: (res) => {
      if (!isMounted.current) return;
      const resData = res?.data?.data || {};
      setProductData(resData);
      setLoadError("");
      setIsLoading(false);
    },
    onError: (err) => {
      if (!isMounted.current) return;
      if (isUnauthorized(err)) {
        toast.error("Session Expired");
        clearToken();
        Router.replace("/login");
        return;
      }
      const message = getApiErrorMessage(err);
      toast.error(message);
      setLoadError(message);
      setIsLoading(false);
    },
  });

  // tell the user when loading takes unusually long
  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return;
    }
    const timer = setTimeout(() => setIsSlow(true), 5000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const fetchProducts = () => {
    setLoadError("");
    setIsLoading(true);
    getProducts.mutate({});
  };

  /* ───────────────  initial effects ────────────── */
  useEffect(() => {
    // fetch product list once
    getProducts.mutate({});
  }, []);

  /* ───────────────  helper ────────────── */
  const renderSkeletons = () => (
    <div className="w-full flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-44 animate-pulse rounded-full bg-[#4565BF]/[0.08]" />
        <div className="h-3 w-72 max-w-full animate-pulse rounded-full bg-[#4565BF]/[0.05]" />
      </div>

      <div className="grid w-full grid-cols-1 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );

  /* ───────────────  mutation for consultation ────────────── */

  /* ───────────────  product selection handler ────────────── */
  const handleProductSelect = (id, treatment) => {
    console.log(id, "id: check");
    if (isFromReorder) {
      if (treatment == "reorder") {
        setReorder(true);
        setRedirection("/re-order");
      } else {
        setReorder(false);
        setRedirection("/acknowledgment");
      }
    } else {
      setRedirection("/personal-details");
      setReorder(false);
    }
    console.log(treatment, "treatment-name");
    setSelectedProductId((prev) => (prev === id ? null : id));
  };

  //   useEffect(() => {
  //     if (!productId) {
  //       setShowModal(true);
  //     }
  //   }, [productId]);

  /* ───────────────  continue handler ────────────── */
  const hanlePrevData = () => {
    // setShowModal(false);
    setIsButtonLoading(true);
    setProductId(selectedProductId);

    Router.push(redirection);
  };
  return (
    <FullScreenModal isOpen={showModal} onClose={() => setShowModal(false)}>
      {isLoading ? (
        <div className="w-full flex flex-col items-center justify-center gap-3 px-4 py-2">
          {isSlow && (
            <p className="inter-medium-font w-full rounded-xl bg-amber-50 px-3 py-2 text-center text-[13px] text-amber-800">
              Your internet connection seems slow. Please wait…
            </p>
          )}
          {renderSkeletons()}
        </div>
      ) : loadError ? (
        <div className="flex w-full flex-col items-center justify-center gap-4 px-4 py-8 text-center">
          <p className="inter-reg-font text-[15px] text-slate-700">{loadError}</p>
          <div className="flex w-full max-w-xs flex-col gap-2">
            <NextButton type="button" label="Try again" onClick={fetchProducts} />
            <BackButton onClick={() => goBackOr(Router, "/")} label="Back" />
          </div>
        </div>
      ) : (
        <>
        <div className="w-full flex flex-col items-center justify-center px-4 py-2">
          <div className="w-full flex flex-col items-center justify-center gap-5">
            {/* ───── Reorder Treatments ───── */}

            {/* ───── Available Treatments ───── */}
            {productData?.products?.length ? (
              <section className="flex w-full flex-col items-center gap-5">
                <div className="text-center">
                  <h2 className="inter-bold-font text-[21px] tracking-[-0.02em] text-slate-900 sm:text-[24px]">
                    Select Treatment
                  </h2>
                  <p className="inter-reg-font mx-auto mt-1.5 max-w-md text-[12.5px] leading-5 text-slate-500 sm:text-[13px]">
                    We offer the following weight-loss injection treatments to
                    help you in your weight-loss journey…
                  </p>
                </div>

                <div className="grid w-full grid-cols-1 gap-2.5 sm:gap-3">
                  {(Array.isArray(productData.reorder)
                    ? productData.reorder
                    : [productData.reorder]
                  )
                    .filter((item) => item?.inventories?.[0]?.status === 1)
                    .map((item) => (
                      <ModalProductListCard
                        key={item?.id}
                        id={item?.id}
                        title={item?.name}
                        image={item?.img}
                        originalPrice={item?.price || "N/A"}
                        isOutOfStock={!item?.inventories?.[0]?.status}
                        isLoading={false}
                        buttonText={
                          selectedProductId === item?.id
                            ? "Selected"
                            : "Reorder Treatment"
                        }
                        isSelected={selectedProductId === item?.id}
                        onClick={() =>
                          handleProductSelect(item?.id, "reorder")
                        }
                      />
                    ))}
                  {[...productData.products]
                    .sort((a, b) => {
                      // in-stock first, then by sequence
                      const aOut = a?.inventories?.[0]?.status === 1 ? 0 : 1;
                      const bOut = b?.inventories?.[0]?.status === 1 ? 0 : 1;
                      if (aOut !== bOut) return aOut - bOut;
                      return (a.sequence || 0) - (b.sequence || 0);
                    })
                    .map((p) => (
                      <ModalProductListCard
                        key={p?.id}
                        id={p?.id}
                        title={p?.name}
                        image={p?.img}
                        originalPrice={p?.price || "N/A"}
                        isOutOfStock={!p?.inventories?.[0]?.status}
                        isLoading={false}
                        buttonText={
                          selectedProductId === p?.id
                            ? "Selected"
                            : "Select Treatment"
                        }
                        isSelected={selectedProductId === p?.id}
                        onClick={() => handleProductSelect(p?.id, "new")}
                      />
                    ))}
                </div>
              </section>
            ) : (
              <p className="inter-reg-font text-center text-sm text-slate-500">
                No available treatments at the moment.
              </p>
            )}

          </div>
        </div>

        {/* ───── Continue Button (solid, full-bleed sticky bar) ───── */}
        <div className="sticky -bottom-4 z-10 -mx-4 -mb-4 w-[calc(100%+2rem)] bg-white px-4 pb-4 pt-4 sm:-bottom-8 sm:-mx-8 sm:-mb-8 sm:w-[calc(100%+4rem)] sm:px-8 sm:pb-8">
          <NextButton
            disabled={!selectedProductId}
            onClick={hanlePrevData}
            label="Continue"
            loading={isButtonLoading}
          />
        </div>
        </>
      )}
    </FullScreenModal>
  );
};

export default ProductSelection;
