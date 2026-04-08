import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { HiBadgeCheck } from "react-icons/hi";
import NextButton from "../NextButton/NextButton";
import useCartStore from "@/store/useCartStore";
import { RiErrorWarningLine } from "react-icons/ri";
import useImageUploadStore from "@/store/useImageUploadStore ";
import { GetImageIsUplaod } from "@/api/mergeRoutes";
import useAuthStore from "@/store/authStore";
import Fetcher from "@/library/Fetcher";
import toast from "react-hot-toast";
import { GetUserOrderApi } from "@/api/mergeRoutes";

const ThankYou = () => {
  const { orderId, checkOut, setOrderId, setCheckOut } = useCartStore();
  const { token } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState(null);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9F6FA] px-4 sm:px-8 md:px-20 py-16">
      <div className="bg-white shadow-2xl rounded-3xl p-8 md:p-12 w-full max-w-3xl transition-all duration-300">
        <div className="text-center mb-10">
          <HiBadgeCheck className="w-20 h-20 text-gray-200 fill-[#387dcc] mx-auto mb-5" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {" "}
            Order Placed Successfully
          </h2>
          <span className="text-gray-800 font-bold text-2xl">
            {" "}
            Order #{orderId}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            {/* <h3 className="text-2xl reg-font text-gray-800 border-b border-gray-200 pb-2 mb-4 text-center">Order Summary</h3> */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="px-6 py-4 text-left bold-font">Items</th>
                    <th className="px-6 py-4 text-right bold-font">Quantity</th>
                    <th className="px-6 py-4 text-right bold-font">Amount</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items?.map((item, index) => (
                    <tr key={`addon-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-3 reg-font">
                        {item?.label || item?.product || "Add-on"}
                      </td>
                      <td className="px-6 py-3 text-center reg-font">
                        {item?.quantity}
                      </td>
                      <td className="px-6 py-3 text-right reg-font">
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
                      <td className="px-6 py-3 reg-font text-black">
                        Discount
                        {checkOut?.discount?.type &&
                          ` (${checkOut?.discount?.type})`}
                        {checkOut?.discount?.code &&
                          ` - Code: ${checkOut?.discount?.code}`}
                      </td>
                      <td></td>
                      <td className="px-6 py-3 text-right reg-font text-primary">
                        {checkOut?.discount?.type === "percentage"
                          ? `${parseFloat(checkOut?.discount?.discount).toFixed(
                              2,
                            )}%`
                          : `-£${parseFloat(
                              checkOut?.discount?.discount,
                            ).toFixed(2)}`}
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
                      <td className="px-6 py-3 text-right reg-font ">
                        £{parseFloat(checkOut?.shipment?.price).toFixed(2)}
                      </td>
                    </tr>
                  )}

                  <tr className="bg-gray-100 font-bold text-gray-900">
                    <td colSpan={2} className="px-6 py-3 text-right bold-font">
                      Total
                    </td>
                    <td className="px-6 py-3 text-right bold-font">
                      £{parseFloat(checkOut?.total).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {!imageUploaded && (
            <>
              <blockquote
                style={{
                  padding: "10px",
                  backgroundColor: "#F9F9F9",
                  borderLeft: "3px solid #ccc",
                  borderRight: "3px solid #ccc",
                  borderRadius: 15,
                  padding: 20,
                }}
                className={`${imageUploaded ? "my-6" : ""} `}
              >
                <h2 className="niba-bold-font underline text-black mb-2">
                  Photo Upload Request:
                </h2>{" "}
                <p className="thin-font text-gray-700">
                  {" "}
                  To complete your order, please upload a clear, recent
                  full-body photo as part of our prescription approval process.
                  This helps our prescribers verify your BMI and ensure the safe
                  and appropriate supply of your treatment.
                </p>
                <p className="thin-font text-gray-700 my-3">
                  {" "}
                  Once your photo has been reviewed and approved, your order
                  will be processed and dispensed by our pharmacy.
                </p>
                <p className="thin-font text-gray-700 my-3 ">
                  {" "}
                  Your privacy is important to us — all photos are stored
                  securely, encrypted, and handled in strict confidence in line
                  with data protection regulations.
                </p>
              </blockquote>

              <div className="my-6 flex justify-center ">
                <button
                  className="bg-[#f8d86e] border border-[#FFF3CD] rounded-xl sm:rounded-full  py-3 px-2 sm:px-6 text-black flex items-start sm:items-center bold-font cursor-pointer 
                w-full  text-start sm:text-center"
                  onClick={handleGoUpload}
                >
                  <RiErrorWarningLine
                    className="text-black sm:mr-0 mr-2  sm:w-14 w-14 "
                    size={20}
                  />
                  Click here to upload your full-body image to complete your
                  order
                </button>
              </div>
            </>
          )}

          <div className="text-left space-y-4 text-gray-700 text-sm leading-relaxed thin-font">
            {/* <p>
              We have received your medical consultation form which is now being
              reviewed by our prescribers. You may be contacted by a member of
              our medical team for more information prior to your medication
              being dispensed. Details of your order have been emailed to you
              and is also available to view on the "my orders" section of your
              account.
            </p> */}
            <p>
              <span className="bold-font underline text-black">Delivery:</span>{" "}
              All orders, once approved, are shipped via next-day tracked
              delivery using either DPD or Royal Mail. Orders may take longer
              than one working day to approve due to the clinical checks
              required. If you would like your order delivered on a specific
              date, please contact us before it is dispatched so we can send it
              accordingly.
            </p>
            <p>
              <span className="bold-font underline text-black">
                Changes or cancellation:
              </span>{" "}
              If there are any changes you would like to make to your order or
              to cancel it, please contact us immediately by email on{" "}
              <a
                href="mailto:contact@onlineweightlossclinic.co.uk"
                className="text-primary font-semibold underline"
              >
                contact@onlineweightlossclinic.co.uk.
              </a>{" "}
              Please note that once your medication has been dispensed you will
              not be able to cancel or return your order. This is due to
              legislation around prescription-only medication.
            </p>
          </div>
          {imageUploaded && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
