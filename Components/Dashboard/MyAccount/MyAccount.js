import React, { useEffect, useState } from "react";
import ProductCard from "@/Components/ProductCard/ProdcutCard";
import { Skeleton } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";
import { GetProductsApi } from "@/api/mergeRoutes";

const SkeletonCard = () => (
  <div className="p-4 my-3 bg-white rounded-lg shadow-md">
    <Skeleton variant="rectangular" height={208} className="mb-4 rounded-lg" />
    <Skeleton variant="text" sx={{ fontSize: "1rem" }} width="80%" />
    <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} width="60%" />
    <Skeleton variant="rectangular" height={40} className="mt-4 rounded-md" />
  </div>
);

const MyAccount = () => {
  const { setIsReturning } = useAuthUserDetailStore();

  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const { setReorderBackProcess } = useReorderBackProcessStore();

  // Dummy function; replace with your real implementation
  const clearCart = () => {
    console.log("Cart cleared");
  };

  useEffect(() => {
    setReorderBackProcess(false);
  }, []);

  const getProducts = useMutation(GetProductsApi, {
    onSuccess: (res) => {
      const product = res?.data?.data || {};
      setProductData(product);
      clearCart();
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.errors || "Something went wrong");
      setIsLoading(false);
    },
  });

  useEffect(() => {
    getProducts.mutate({ data: {} });
  }, []);

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
  useEffect(() => {
    setIsReturning(productData?.reorder != null);
  }, [productData?.reorder, setIsReturning]);
  return (
    <div className="p-5 sm:p-10 sm:bg-gray-50 sm:min-h-screen sm:rounded-lg sm:shadow-md my-3">
      {/* Reorder Treatments */}
      {isLoading ? (
        renderSkeletons()
      ) : productData?.reorder ? (
        <div className="mb-8">
          <h1 className="text-left headingDashBoard bold-font mb-4">
            Reorder Treatment
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(productData.reorder) ? (
              productData.reorder.map((item, index) => (
                <ProductCard
                  key={item?.id || index}
                  id={item?.id}
                  title={item?.name}
                  image={item?.img}
                  price={item?.price || "N/A"}
                  status={item?.inventories?.[0]?.status}
                  lastOrderDate={item?.lastOrderDate}
                  buttonText="Reorder Treatment"
                  reorder={true}
                />
              ))
            ) : (
              <ProductCard
                id={productData.reorder?.id}
                title={productData.reorder?.name}
                image={productData.reorder?.img}
                price={productData.reorder?.price || "N/A"}
                status={productData.reorder?.inventories?.[0]?.status}
                lastOrderDate={productData.reorder?.lastOrderDate}
                buttonText="Reorder Treatment"
                reorder={true}
              />
            )}
          </div>
        </div>
      ) : null}

      {/* Available Treatments */}
      {isLoading ? (
        renderSkeletons()
      ) : productData?.products?.length > 0 ? (
        <>
          <header className="pb-9">
            <h1 className="text-left headingDashBoard bold-font ">
              Available Treatments
            </h1>
            <p className="paragraph reg-font text-left  mt-2">
              We offer the following weight loss injections treatment options to
              help you in your weight loss journey...
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productData.products
              .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
              .map((product) => (
                <ProductCard
                  key={product?.id || product?.sequence}
                  id={product?.id}
                  title={product?.name}
                  image={product?.img}
                  price={product?.price || "N/A"}
                  status={product?.inventories?.[0]?.status}
                  buttonText="Start Consultation"
                  reorder={false}
                />
              ))}
          </div>
        </>
      ) : (
        <p className="text-start reg-font text-sm text-gray-600">
          No available treatments at the moment.
        </p>
      )}
    </div>
  );
};

export default MyAccount;
