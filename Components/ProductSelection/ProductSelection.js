import React, { useEffect, useState } from "react";
import FullScreenModal from "../FullScreenModal/FullScreenModal";
import useProductId from "@/store/useProductIdStore";
import { useMutation } from "@tanstack/react-query";
import Product from "../ProductCard/Product";
import { Skeleton } from "@mui/material";
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
import useReorderButtonStore from "@/store/useReorderButton";
import useReorder from "@/store/useReorderStore";
import { GetProductsApi } from "@/api/mergeRoute";

const ProductSelection = ({ showProductSelection }) => {
  /* ───────────────  skeleton card ────────────── */
  const SkeletonCard = () => (
    <div className="p-4 my-3 bg-white rounded-lg shadow-md">
      <Skeleton
        variant="rectangular"
        height={208}
        className="mb-4 rounded-lg"
      />
      <Skeleton variant="text" sx={{ fontSize: "1rem" }} width="80%" />
      <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} width="60%" />
      <Skeleton variant="rectangular" height={40} className="mt-4 rounded-md" />
    </div>
  );
  /* ───────────────  local state ────────────── */
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [showModal, setShowModal] = useState(showProductSelection);
  const [selectedProductId, setSelectedProductId] = useState(null); // NEW
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [redirection, setRedirection] = useState("");

  /* ───────────────  stores (init only what we SET/CLEAR) ────────────── */
  const { setReorder } = useReorder();

  const { setProductId, productId } = useProductId();
  const { firstName, lastName, setFirstName, setLastName } = useSignupStore();
  const { isFromReorder } = useReorderButtonStore();

  console.log(firstName, lastName, "product selection");
  /* ───────────────  products mutation ────────────── */
  const getProducts = useMutation(GetProductsApi, {
    onSuccess: (res) => {
      const resData = res?.data?.data || {};
      setProductData(resData);
      setIsLoading(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.errors || "Something went wrong");
      setIsLoading(false);
    },
  });

  /* ───────────────  initial effects ────────────── */
  useEffect(() => {
    // fetch product list once
    getProducts.mutate({});
  }, []);

  /* ───────────────  helper ────────────── */
  const renderSkeletons = () => (
    <div className="grid grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
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
        renderSkeletons()
      ) : (
        <div className="w-full flex flex-col items-center justify-center px-4 py-2">
          <div className="w-full flex flex-col items-center justify-center gap-8">
            {/* ───── Reorder Treatments ───── */}

            {/* ───── Available Treatments ───── */}
            {productData?.products?.length ? (
              <section className="w-full flex flex-col items-center gap-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Select Treatment
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    We offer the following weight-loss injection treatments to
                    help you in your weight-loss journey…
                  </p>
                </div>

                <div
                  className={`flex flex-wrap gap-6 w-full ${
                    productData.products.filter(
                      (p) => p?.inventories?.[0]?.status === 1,
                    ).length === 1
                      ? "justify-center"
                      : "justify-center"
                  }`}
                >
                  {(Array.isArray(productData.reorder)
                    ? productData.reorder
                    : [productData.reorder]
                  )
                    .filter((item) => item?.inventories?.[0]?.status === 1)
                    .map((item) => (
                      <Product
                        key={item?.id}
                        id={item?.id}
                        title={item?.name}
                        image={item?.img}
                        price={item?.price || "N/A"}
                        status={item?.inventories?.[0]?.status}
                        lastOrderDate={item?.lastOrderDate}
                        buttonText="Reorder Treatment"
                        reorder
                        isSelected={selectedProductId === item?.id}
                        onSelect={() =>
                          handleProductSelect(item?.id, "reorder")
                        }
                      />
                    ))}
                  {productData.products
                    .filter((p) => p?.inventories?.[0]?.status === 1)
                    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                    .map((p) => (
                      <Product
                        key={p?.id}
                        id={p?.id}
                        title={p?.name}
                        image={p?.img}
                        price={p?.price || "N/A"}
                        status={p?.inventories?.[0]?.status}
                        buttonText="Start Consultation"
                        isSelected={selectedProductId === p?.id}
                        onSelect={() => handleProductSelect(p?.id, "new")}
                      />
                    ))}
                </div>
              </section>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No available treatments at the moment.
              </p>
            )}

            {/* ───── Continue Button ───── */}
            <div className="pt-6">
              <NextButton
                disabled={!selectedProductId}
                onClick={hanlePrevData}
                label="Continue"
                loading={isButtonLoading}
              />
            </div>
          </div>
        </div>
      )}
    </FullScreenModal>
  );
};

export default ProductSelection;
