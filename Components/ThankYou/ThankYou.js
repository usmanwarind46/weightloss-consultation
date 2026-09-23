import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { HiBadgeCheck } from "react-icons/hi";
import NextButton from "../NextButton/NextButton";
import useCartStore from "@/store/useCartStore";
import {
  ChevronRight,
  UploadCloud,
  Camera,
  IdCard,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";
import useImageUploadStore from "@/store/useImageUploadStore ";
import { GetImageIsUplaod } from "@/api/mergeRoutes";
import useAuthStore from "@/store/authStore";
import Fetcher from "@/library/Fetcher";
import toast from "react-hot-toast";
import { GetUserOrderApi, patientSource } from "@/api/mergeRoutes";
import { trackCustomerLabsPurchased } from "@/config/CustomerLabs";
import useUserDataStore from "@/store/userDataStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useProductId from "@/store/useProductIdStore";
import { GetIdVerification } from "@/api/IdVerificationApi";
import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";

const VerificationCard = ({
  icon: Icon,
  title,
  description,
  label,
  onClick,
}) => (
  <section className="w-full overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50/40 shadow-[0_1px_4px_rgba(180,83,9,0.06)]">
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <Icon aria-hidden="true" size={18} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="inter-medium-font inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-amber-600">
              Action required
            </span>
          </div>
          <h3 className="inter-semibold-font text-[14px] leading-snug text-slate-900">
            {title}
          </h3>
          <p className="inter-reg-font mt-0.5 text-[12.5px] text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="inter-medium-font group inline-flex min-h-[38px] w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-2 text-[12.5px] text-amber-600 transition-all duration-150 hover:bg-amber-100 active:scale-[0.98] lg:w-auto lg:min-w-[140px]"
      >
        <UploadCloud aria-hidden="true" size={14} strokeWidth={2.2} />
        <span>{label}</span>
        <ChevronRight
          aria-hidden="true"
          size={13}
          strokeWidth={2.5}
          className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </button>
    </div>
  </section>
);

const ThankYou = () => {
  const { orderId, checkOut, setOrderId, setCheckOut } = useCartStore();
  const { userData } = useUserDataStore();
  const { patientInfo } = usePatientInfoStore();
  const { productId } = useProductId();
  const { token } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState(null);
  const { idVerificationUpload, setIdVerificationUpload } =
    useIdVerificationUploadStore();

  // useEffect(() => {

  //   if (!checkOut || Object.keys(checkOut).length === 0) {
  //     router.replace("/dashboard");
  //   }
  // }, [checkOut, router]);

  // if (!checkOut || Object.keys(checkOut).length === 0) {
  //   return null;
  // }
  const GO = useRouter();
  const { imageUploaded, setImageUploaded } = useImageUploadStore();
  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({ order_id: orderId });

        setImageUploaded(res?.data?.status);
      } catch (error) {
        console.error(
          "Failed to fetch image status:",
          error?.response?.data?.errors?.Order,
        );
      }
    };

    if (orderId) fetchImageStatus();
  }, [orderId]);

  useEffect(() => {
    const fetchUserOrder = async () => {
      try {
        if (!token) {
          toast.error("User not authenticated");
          router.replace("/login");
          return;
        }
        Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${token}`;

        const res = await GetUserOrderApi();
        setOrderId(res?.data?.id);
        setItems(res?.data?.items);
        setCheckOut(res?.data?.consultation?.fields?.checkout);

        // CustomerLabs — fire Lead event on successful order
        const clOrderId = res?.data?.id;
        const clItems = res?.data?.items || [];
        const clCheckout = res?.data?.consultation?.fields?.checkout;

        // Main product = item where product and name are different (dose item)
        // Addon = item where product and name are the same
        const mainItem = clItems.find((item) => item?.product !== item?.name);
        const addonItems = clItems.filter(
          (item) => item?.product === item?.name,
        );

        const productName = mainItem?.product || "Weight Loss Treatment";
        const doseName = mainItem?.name || "";
        const doseQuantity = mainItem?.quantity || 1;

        const addonsString =
          addonItems.length > 0
            ? addonItems
                .map((item) => `${item?.name} x${item?.quantity || 1}`)
                .join(", ")
            : "None";

        const productProperties = clItems.map((item) => {
          const isMainProduct = item?.product !== item?.name;
          return {
            product_id: {
              t: "string",
              v: String(item?.extra_id || item?.id || ""),
            },
            product_name: { t: "string", v: item?.product || item?.name || "" },
            product_quantity: { t: "number", v: item?.quantity || 1 },
            product_price: { t: "number", v: parseFloat(item?.price) || 0 },
            ...(isMainProduct && {
              product_variant: { t: "string", v: item?.name || "" },
            }),
          };
        });

        const stored = JSON.parse(
          localStorage.getItem("owlc_attribution") || "null",
        );

        console.log("First Touch Data:", stored?.first_touch);
        console.log("Last Touch Data:", stored?.last_touch);

        if (stored) {
          try {
            await patientSource({
              user_id: userData?.id,
              order_id: clOrderId,
              type: "order",
              first_touch: {
                channel: stored.first_touch?.channel || "Direct",
                source: stored.first_touch?.source || "direct",
                medium: stored.first_touch?.medium || "none",
                paid_status: stored.first_touch?.paid_status || "unknown",
              },
              last_touch: {
                channel: stored.last_touch?.channel || "Direct",
                source: stored.last_touch?.source || "direct",
                medium: stored.last_touch?.medium || "none",
                paid_status: stored.last_touch?.paid_status || "unknown",
              },
            });

            // Clear karo
            localStorage.removeItem("owlc_attribution");
            localStorage.removeItem("utm_source");
            localStorage.removeItem("utm_medium");
            localStorage.removeItem("utm_campaign");

            console.log("✅ Attribution sent");
          } catch (attributionError) {
            console.error("Attribution API failed:", attributionError);
          }
        }

        trackCustomerLabsPurchased({
          formName: "Thank You - Order Placed",
          formId: "onlineweightlossclinic_thankyou_order",
          dedupeKey: clOrderId
            ? `customerlabs_purchased_thankyou_${clOrderId}`
            : null,
          identity: {
            firstName: userData?.fname || patientInfo?.firstName || "",
            lastName: userData?.lname || patientInfo?.lastName || "",
            email: userData?.email || "",
            phone: userData?.phone || patientInfo?.phoneNo || "",
            userId: userData?.id || "",
          },
          properties: {
            event_source: "thank_you_page",
            currency: "GBP",
            value: clCheckout?.total || 0,
            transaction_id: String(clOrderId || ""),
            order_id: String(clOrderId || ""),
            product_name: productName,
            treatment_name: productName,
            dose: `${doseName} x${doseQuantity}`,
            addons: addonsString,
          },
          productProperties,
        });
      } catch (error) {
        toast.error(
          error?.response?.data?.errors?.Order || "An error occurred",
        );
        router.replace("/dashboard");
        console.error("Failed to fetch user order:", error);
      }
    };

    fetchUserOrder();
  }, [token]);

  useEffect(() => {
    const fetchIdVerificationStatus = async () => {
      try {
        const res = await GetIdVerification({ order_id: orderId });
        console.log("ID Verification Response", res);

        setIdVerificationUpload(res?.data?.status);
      } catch (error) {
        console.error("Failed to fetch ID verification status:", error);
      }
    };

    if (orderId) fetchIdVerificationStatus();
  }, [orderId]);

  const handleGoBack = () => {
    // if ( !imageUploaded) {

    //   GO.push("/photo-upload");

    // } else {

    GO.push("/dashboard");
    // }
  };

  const handleGoUpload = () => {
    GO.push("/photo-upload");
  };

  const handleGoIdVerification = () => {
    GO.push("/id-verification");
  };

  return (
    <div className="min-h-screen bg-[#EEF2FA] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[#4565BF]/10 bg-white shadow-[0_18px_55px_rgba(69,101,191,0.10)] transition-all duration-300">
        <div className="mb-0 border-b border-[#4565BF]/[0.08] bg-[#f2f4fb] px-6 py-8 text-center sm:px-10">
          <HiBadgeCheck className="mx-auto mb-4 h-14 w-14 fill-[#4565BF] text-white" />
          <h2 className="inter-bold-font mb-2 text-[24px] tracking-[-0.02em] text-slate-900 sm:text-[30px]">
            {" "}
            Order Placed Successfully
          </h2>
          <span className="inter-semibold-font text-[15px] text-[#4565BF] sm:text-[16px]">
            {" "}
            Order #{orderId}
          </span>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
          <div>
            {/* <h3 className="text-2xl reg-font text-gray-800 border-b border-gray-200 pb-2 mb-4 text-center">Order Summary</h3> */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="inter-reg-font min-w-full divide-y divide-slate-100 text-sm text-slate-700">
                <thead className="inter-semibold-font bg-[#4565BF]/[0.05] text-slate-700">
                  <tr>
                    <th className="inter-semibold-font px-6 py-4 text-left">
                      Items
                    </th>
                    <th className="inter-semibold-font px-6 py-4 text-right">
                      Quantity
                    </th>
                    <th className="inter-semibold-font px-6 py-4 text-right">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items?.map((item, index) => (
                    <tr
                      key={`addon-${index}`}
                      className="transition-colors hover:bg-[#4565BF]/[0.02]"
                    >
                      <td className="inter-medium-font px-6 py-3 text-slate-900">
                        {item?.label || item?.product || "Add-on"}
                      </td>
                      <td className="inter-reg-font px-6 py-3 text-center">
                        {item?.quantity}
                      </td>
                      <td className="inter-reg-font px-6 py-3 text-right">
                        £
                        {(
                          parseFloat(item?.price) * (item?.quantity || 1)
                        ).toFixed(2)}
                        <span className="text-gray-500 text-sm ml-1">
                          {/* (£{parseFloat(item?.price).toFixed(2)} each) */}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* {items.addons.length > 0 &&
                    items.addons.map((item, index) => (
                      <tr key={`addon-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-3 reg-font">
                          {item?.product || item?.name || "Add-on"}
                        </td>
                        <td className="px-6 py-3 text-center reg-font">
                          {item?.qty}
                        </td>
                        <td className="px-6 py-3 text-right reg-font">
                          £
                          {(
                            parseFloat(item?.price) * (item?.qty || 1)
                          ).toFixed(2)}
                          <span className="text-gray-500 text-sm ml-1">
                          </span>
                        </td>
                      </tr>
                    ))} */}

                  {checkOut?.discount?.discount !== null && (
                    <tr className="hover:bg-gray-50">
                      <td className="inter-reg-font px-6 py-3 text-slate-900">
                        Discount
                        {checkOut?.discount?.type === "Percent"
                          ? ` (${parseInt(checkOut?.discount?.discount)}%)`
                          : checkOut?.discount?.type &&
                            ` (${checkOut?.discount?.type})`}
                        {checkOut?.discount?.code &&
                          ` - Code: ${checkOut?.discount?.code}`}
                      </td>
                      <td></td>
                      <td className="inter-medium-font px-6 py-3 text-right text-[#4565BF]">
                        {checkOut?.discount?.type === "Percent"
                          ? `-£${parseFloat(checkOut?.discount?.discount_value || 0).toFixed(2)}`
                          : `-£${parseFloat(checkOut?.discount?.discount).toFixed(2)}`}
                      </td>
                    </tr>
                  )}

                  {checkOut?.shipment && (
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 reg-font text-black">
                        Shipping{" "}
                        <span className="text-black mx-2">
                          ({checkOut?.shipment?.name})
                        </span>
                      </td>
                      <td></td>
                      <td className="inter-reg-font px-6 py-3 text-right">
                        £{parseFloat(checkOut?.shipment?.price).toFixed(2)}
                      </td>
                    </tr>
                  )}

                  <tr className="bg-[#4565BF]/[0.055] font-bold text-slate-900">
                    <td
                      colSpan={2}
                      className="inter-semibold-font px-6 py-3 text-right"
                    >
                      Total
                    </td>
                    <td className="inter-semibold-font px-6 py-3 text-right text-[#4565BF]">
                      £{parseFloat(checkOut?.total).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {!imageUploaded && (
            <blockquote className="rounded-xl border border-[#4565BF]/10 bg-[#f2f4fb] px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="inter-semibold-font mb-2 text-[14px] text-slate-900">
                Photo Upload Request
              </h2>
              <p className="inter-reg-font text-[13px] leading-relaxed text-slate-600">
                As part of our ongoing commitment to patient safety and
                compliance with current regulatory requirements, we are required
                to verify your BMI as part of our prescribing process.
              </p>
              <p className="inter-reg-font mt-3 text-[13px] leading-relaxed text-slate-600">
                Please upload a clear, recent full-body photograph. This is one
                of the methods we use to verify your BMI and ensure that your
                treatment remains safe and appropriate for you.
              </p>
              <p className="inter-reg-font mt-3 text-[13px] leading-relaxed text-slate-600">
                Once your photo has been reviewed and approved by our clinical
                team, your order will be processed and dispensed by our
                pharmacy.
              </p>
              <p className="inter-reg-font mt-3 text-[13px] leading-relaxed text-slate-600">
                Your privacy is important to us, therefore all photos are stored
                securely, encrypted, and handled in strict confidence in
                accordance with applicable data protection regulations.
              </p>
            </blockquote>
          )}

          {(!imageUploaded || !idVerificationUpload) && (
            <section
              aria-labelledby="verification-heading"
              className="space-y-4"
            >
              <div className="flex items-start gap-3">
                <ClipboardCheck
                  aria-hidden="true"
                  size={22}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-[#4565BF]"
                />
                <div>
                  <h2
                    id="verification-heading"
                    className="inter-semibold-font text-[18px] tracking-[-0.02em] text-slate-900"
                  >
                    Your next step: verification
                  </h2>
                  <p className="inter-reg-font mt-1 text-[13px] leading-relaxed text-slate-500">
                    Please complete the uploads below so our clinical team can
                    review your order.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {!imageUploaded && (
                  <VerificationCard
                    icon={Camera}
                    title="Upload your photo"
                    description="Please upload your full-body photo to complete your order."
                    label="Upload photo"
                    onClick={handleGoUpload}
                  />
                )}
                {!idVerificationUpload && (
                  <VerificationCard
                    icon={IdCard}
                    title="Verify Your Identity"
                    description="Please upload your ID verification to complete your order."
                    label="Upload ID"
                    onClick={handleGoIdVerification}
                  />
                )}
              </div>

              <p className="inter-reg-font flex items-start gap-2 text-[12px] leading-relaxed text-slate-500">
                <ShieldCheck
                  aria-hidden="true"
                  size={17}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-teal-800"
                />
                Your uploads are stored securely and handled confidentially as
                part of your clinical review.
              </p>
            </section>
          )}

          <div className="inter-reg-font space-y-4 text-left text-[13px] leading-relaxed text-slate-600">
            {/* <p>
              We have received your medical consultation form which is now being
              reviewed by our prescribers. You may be contacted by a member of
              our medical team for more information prior to your medication
              being dispensed. Details of your order have been emailed to you
              and is also available to view on the "my orders" section of your
              account.
            </p> */}
            <p>
              <span className="inter-semibold-font text-slate-900">
                Delivery:
              </span>{" "}
              All orders, once approved, are shipped via next-day tracked
              delivery using either DPD or Royal Mail. Orders may take longer
              than one working day to approve due to the clinical checks
              required. If you would like your order delivered on a specific
              date, please contact us before it is dispatched so we can send it
              accordingly.
            </p>
            <p>
              <span className="inter-semibold-font text-slate-900">
                Changes or cancellation:
              </span>{" "}
              If there are any changes you would like to make to your order or
              to cancel it, please contact us immediately by email on{" "}
              <a
                href="mailto:contact@onlineweightlossclinic.co.uk"
                className="inter-medium-font text-[#4565BF] underline underline-offset-2"
              >
                contact@onlineweightlossclinic.co.uk.
              </a>{" "}
              Please note that once your medication has been dispensed you will
              not be able to cancel or return your order. This is due to
              legislation around prescription-only medication.
            </p>
          </div>

          <>
            <div className="">
              <NextButton
                className=""
                onClick={handleGoBack}
                label="Continue to view order details"
                // disabled={!imageUploaded}
              />
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
