import React, { useEffect, useState } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import SectionHeader from "./SectionHeader";
import { useRouter } from "next/router";
import useCartStore from "@/store/useCartStore";
import toast from "react-hot-toast";
import useCouponStore from "@/store/couponStore";
import { motion, AnimatePresence } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
import NextButton from "../NextButton/NextButton";
import { GoCheckCircleFill } from "react-icons/go";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import usePatientInfoStore from "@/store/patientInfoStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useBmiStore from "@/store/bmiStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import PaymentPage from "../PaymentSection/PaymentPage";
import { useMutation } from "@tanstack/react-query";
import useSignupStore from "@/store/signupStore";
import useProductId from "@/store/useProductIdStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useCheckoutStore from "@/store/checkoutStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useAuthStore from "@/store/authStore";
import usePasswordReset from "@/store/usePasswordReset";
import useLastBmi from "@/store/useLastBmiStore";
import useUserDataStore from "@/store/userDataStore";
import OrderSummaryHeader from "./OrderSummaryHeader";
import useNeedleConsent from "@/store/needleConsent";
import { CouponApi, sendStepData } from "@/api/mergeRoute";

const OrderSummary = ({
  isConcentCheck,
  isShippingCheck,
  isBillingCheck,
  onComplete,
  isCompleted,
}) => {
  const router = useRouter();
  const [discountCode, setDiscountCode] = useState("");
  // Get some data to store✌✌
  const { items, totalAmount, setCheckOut, setOrderId } = useCartStore();
  const { Coupon, setCoupon, clearCoupon } = useCouponStore();
  const {
    shipping,
    billing,
    billingSameAsShipping,
    clearShipping,
    clearBilling,
  } = useShippingOrBillingStore();

  const { patientInfo, clearPatientInfo } = usePatientInfoStore();
  const { medicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { gpdetails, clearGpDetails } = useGpDetailsStore();
  const { bmi, clearBmi } = useBmiStore();
  const { confirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();
  const { email } = useSignupStore();
  const { productId, clearProductId } = useProductId();

  // store addons or dose here 🔥🔥
  const { needleMessage } = useNeedleConsent();

  const { clearAuthUserDetail } = useAuthUserDetailStore();

  const { clearCheckout } = useCheckoutStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();

  const { clearToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();

  const { clearFirstName, clearLastName, clearEmail, clearConfirmationEmail } =
    useSignupStore();

  const isApplyEnabled = discountCode.trim().length > 0;
  const handleEdit = () => {
    router.push("dosage-selection");
  };
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    try {
      const res = await CouponApi({ coupon_code: discountCode });
      if (res?.data?.status === true) {
        toast.success("Coupon applied successfully!");
        console.log(res, "coupon");
        setCoupon(res.data);
        setDiscountCode("");
      }
    } catch (error) {
      const err = error?.response?.data?.errors?.Coupon;
      if (err) {
        console.log(err, "coupon error");
        toast.error(err);
        clearCoupon();
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    clearCoupon();
    toast("Coupon removed");
  };

  let discountAmount = 0;

  const shippingPrice = Number(shipping?.country_price) || 0;

  // Start calculation
  let finalTotal = totalAmount + shippingPrice;

  // Calculate discount
  if (Coupon?.Data?.type === "Percent") {
    discountAmount = (totalAmount / 100) * Coupon?.Data?.discount;
  } else {
    discountAmount = Coupon?.Data?.discount || 0;
  }

  // Apply discount if available
  if (discountAmount) {
    finalTotal = totalAmount - discountAmount + shippingPrice;
  }

  // handle Payment ✌✌
  const checkoutMutation = useMutation(sendStepData, {
    onSuccess: (data) => {
      if (data) {
        setPaymentData(data?.data?.paymentData);
        setOrderId(data?.data?.paymentData?.order_id);
        clearCoupon();
      }
    },
    onError: (error) => {
      console.log(error, "dsfdsdsdfsdf");
      const errors = error?.response?.data?.original?.errors;
      const product_error = error?.response?.data?.errors?.Product;
      const singleOutOfStock = error?.response?.data?.errors?.OutOfStock;

      if (error?.response?.data?.message == "Unauthenticated.") {
        console.log("error here");
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
        setIsButtonLoading(false);
        router.push("/login");
      } else if (errors && typeof errors === "object") {
        setIsButtonLoading(false);
        Object.keys(errors).forEach((key) => {
          const errorMessage = errors[key];
          Array.isArray(errorMessage)
            ? errorMessage.forEach((msg) => toast.error(msg))
            : toast.error(errorMessage);
        });
      } else if (singleOutOfStock && typeof singleOutOfStock === "object") {
        setIsButtonLoading(false);
        Object.keys(singleOutOfStock).forEach((key) => {
          const errorMessage = singleOutOfStock[key];
          Array.isArray(errorMessage)
            ? errorMessage.forEach((msg) => toast.error(msg))
            : toast.error(errorMessage);
        });
        router.push("/gathering-data");
      } else if (singleOutOfStock && typeof singleOutOfStock != "object") {
        toast.error(singleOutOfStock);
        console.log("from single Out Of stock");
        router.push("/gathering-data");
        setIsButtonLoading(false);
      } else {
        console.log("from other errors");
        toast.error(product_error);
        setIsButtonLoading(false);
      }
    },
  });
  // hanlde payment ✔✔✔✌✌
  const handlePayment = () => {
    setIsButtonLoading(true);
    const checkout = {
      firstName: shipping?.first_name,
      lastName: shipping?.last_name,
      email: email,
      phoneNo: patientInfo?.phoneNo,
      shipping: {
        postalcode: shipping?.postalcode,
        addressone: shipping?.addressone,
        addresstwo: shipping?.addresstwo,
        city: shipping?.city,
        state: shipping?.state,
        country: shipping?.country_name,
      },
      terms: true,
      sameAddress: billingSameAsShipping,
      billing: {
        postalcode: billing?.postalcode,
        addressone: billing?.addressone,
        addresstwo: billing?.addresstwo,
        city: billing?.city,
        state: billing?.state,
        country: billing?.country_name,
      },
      discount: {
        code: Coupon?.Data?.code ? Coupon?.Data?.code : null,
        discount: Coupon?.Data?.discount ? Coupon?.Data?.discount : null,
        type: Coupon?.Data?.type ? Coupon?.Data?.type : null,
        discount_value: discountAmount ? discountAmount : null,
      },
      subTotal: parseFloat(totalAmount),
      total: parseFloat(finalTotal),
      shipment: {
        id: shipping?.id,
        name: shipping?.country_name,
        price: parseFloat(shipping?.country_price),
        status: 1,
        taggable_type: "App\\Models\\Product",
        taggable_id: "1",
      },
      needles_concent: needleMessage,
    };

    setCheckOut(checkout);

    const formData = {
      checkout,
      patientInfo,
      items: (items?.doses || []).map((d) => ({
        ...d,
        quantity: d.quantity || d.qty || 1,
      })),
      addons: (items?.addons || []).map((a) => ({
        ...a,
        quantity: a.quantity || a.qty || 1,
      })),
      pid: productId,
      medicalInfo,
      gpdetails,
      bmi,
      confirmationInfo,
      reorder_concent: null,
      product_id: productId,
    };

    checkoutMutation.mutate(formData);
  };

  return (
    <>
      {paymentData ? (
        <PaymentPage paymentData={paymentData} />
      ) : (
        <>
          <div className="col-span-12 sm:col-span-4 mb-3">
            <div className="mb-24 sm:mb-0">
              <div className="bg-white p-6 rounded-2xl shadow-lg font-inter">
                <div className="relative">
                  <OrderSummaryHeader
                    stepNumber={4}
                    title="Order Summary"
                    isCompleted={onComplete}
                  />
                  <div className="absolute right-14 bottom-2 w-20">
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex justify-around align-middle cursor-pointer ml-2 p-2 w-30 rounded-lg bg-white hover:bg-gray-100 text-primary shadow transition"
                    >
                      <span className="reg-font text-sm text-gray-500">
                        Edit order
                      </span>
                      <HiOutlinePencilAlt className="w-4 h-4" color="#4565BF" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto">
                  <ul className="space-y-4 overflow-y-auto max-h-[250px] pr-1 pb-4">
                    {items?.doses?.map((dose, index) => (
                      <React.Fragment key={index}>
                        {/* Standard dose item */}
                        <li className="group flex items-center justify-between rounded-lg bg-[#E9F6FA] hover:bg-blue-50 p-4 shadow-md transition-all duration-200">
                          <div className="flex flex-col">
                            <span className="text-base bold-font text-gray-900 truncate">
                              {dose?.product} {dose?.name}
                            </span>
                            <span className="bold-font text-sm text-gray-600 mt-1">
                              Quantity: x{dose?.qty}
                            </span>
                          </div>

                          <span className="text-base bold-font text-black px-4 py-1 rounded-full">
                            £{dose?.price?.toFixed(2)}
                          </span>
                        </li>

                        {/* Additional item if product is Mounjaro */}
                        {/* {dose?.product === "Mounjaro (Tirzepatide)" && (
                          <li className="group flex items-center justify-between rounded-lg bg-[#ececec] hover:bg-blue-50 p-4 shadow-md transition-all duration-200 mt-2">
                            <div className="flex flex-col">
                              <span className="text-base bold-font text-gray-900 truncate">Pack of 5 Needle</span>
                              <span className="bold-font text-sm text-gray-600 mt-1">Quantity: x{dose.qty}</span>
                            </div>

                            <span className="text-base bold-font text-black px-4 py-1 rounded-full">£0.00</span>
                          </li>
                        )} */}
                      </React.Fragment>
                    ))}

                    {items?.addons?.map((addon, index) => (
                      <li
                        key={index}
                        className="group flex items-center justify-between rounded-lg bg-[#E9F6FA] hover:bg-blue-50  p-4 shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col">
                          <span className="text-base bold-font text-gray-900  truncate">
                            {addon?.name}
                          </span>
                          <span className="bold-font text-sm text-gray-600 mt-1">
                            Quantity: x{addon?.qty}
                          </span>
                        </div>

                        <span className="text-base bold-font  text-black px-4 py-1 rounded-full">
                          £{addon?.price?.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between items-center mt-8">
                    <p className="bold-font paragraph !text-black">Subtotal</p>
                    <p className="bold-font text-black">
                      £{totalAmount?.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <p className="bold-font paragraph !text-black">VAT</p>
                    <p className="bold-font text-black">£0.00</p>
                  </div>

                  {Coupon && (
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-[#1f9e8c] bold-font">
                        Discount
                      </p>
                      <p className="text-sm text-[#1f9e8c] bold-font">
                        -£{discountAmount?.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {shipping?.country_name && (
                    <div className="flex justify-between items-center mt-4">
                      <p className="bold-font paragraph !text-black">
                        Shipping
                        <span className="reg-font paragraph ms-2">
                          ({shipping?.country_name})
                        </span>
                      </p>
                      <p className="bold-font text-black">
                        £{shipping?.country_price}
                      </p>
                    </div>
                  )}
                  <hr className="my-4 border-gray-200" />

                  <div className="flex justify-between items-center">
                    <p className="bold-font text-xl text-black">Total</p>
                    <p className="bold-font text-xl text-black">
                      £{finalTotal?.toFixed(2)}
                    </p>
                  </div>

                  <hr className="my-4 border-gray-200" />

                  {/* Discount Section */}
                  <AnimatePresence>
                    {Coupon ? (
                      <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="relative mt-6 rounded-lg border-2 border-[#1f9e8c] bg-green-50 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center  border-[#1f9e8c] text-[#1f9e8c]">
                            <GoCheckCircleFill size={32} />
                          </div>

                          <div>
                            <p className="niba-bold-font text-[#1f9e8c]">
                              {Coupon?.Data?.code}{" "}
                              <span className="reg-font paragraph">
                                Applied
                              </span>
                            </p>
                            <p className="text-gray-700 text-md  reg-font">
                              - £{Coupon?.Data?.discount}{" "}
                              {Coupon?.Data?.type === "Percent" &&
                                `(${Coupon?.Data?.discount}% off)`}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-red-500 text-sm reg-font hover:underline cursor-pointer"
                        >
                          <RxCross2 className="bold-font " size={24} />
                        </button>
                      </motion.div>
                    ) : (
                      <div className="flex mt-6 rounded-lg shadow-sm overflow-hidden">
                        <input
                          type="text"
                          placeholder="Enter discount code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="flex-1 text-sm text-gray-800 bg-gray-100 placeholder-gray-400 p-4 focus:outline-none reg-font"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={!isApplyEnabled}
                          className={`cursor-pointer px-6 text-sm bold-font text-white transition-all duration-200 ${
                            isApplyEnabled
                              ? "bg-primary hover:bg-primary"
                              : "bg-gray-300 cursor-not-allowed"
                          }`}
                        >
                          {couponLoading ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="my-5">
                  <NextButton
                    disabled={
                      !(isConcentCheck && isShippingCheck && isBillingCheck)
                    }
                    label="Proceed to Payment "
                    onClick={handlePayment}
                    loading={isButtonLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OrderSummary;
