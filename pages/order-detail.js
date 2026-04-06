import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TableHead,
} from "@mui/material";
import moment from "moment";
import { motion } from "framer-motion";
import StepsHeader from "@/layout/stepsHeader";
import Link from "next/link";
import useOrderId from "@/store/useOrderIdStore";
import OrdersTabs from "@/Components/Tabs/OrdersTabs";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import { getOrderByIdApi } from "@/api/mergeRoute";

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // State for active tab
  const { orderId } = useOrderId();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };
  useEffect(() => {
    if (orderId) {
      setLoading(true);
      getOrderByIdApi(orderId)
        .then((res) => {
          setOrder(res?.data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  }, [orderId]);

  // Destructure data properly
  const shippingData = order?.data?.order?.shipping;
  const bmiData = order?.data?.order?.consultation?.fields?.bmi;
  const medicalInfo =
    order?.data?.order?.consultation?.fields?.medicalInfo?.length > 0
      ? order.data.order.consultation.fields.medicalInfo
      : order?.data?.order?.consultation?.fields?.legacy_medicalInfo;

  const BillingData = order?.data?.order?.billing;
  const patientData = order?.data?.order?.consultation?.fields?.patientInfo;
  const gpDetails = order?.data?.order?.consultation?.fields?.gpdetails;
  const date = order?.data?.order?.created_at;
  const time = order?.data?.order?.created_at_time;
  const products = order?.data?.order?.items;
  const shipmentFee = order?.data?.order?.shippment_weight;
  const total = order?.data?.order?.total_price;
  const orders = order?.data?.order?.consultation?.fields?.checkout?.discount;
  const startConcent = order?.data?.order?.consultation?.start_concent;
  // const confirmationInfo = order?.consultation?.fields?.confirmationInfo;
  const confirmationInfo =
    order?.data?.order?.consultation?.fields?.confirmationInfo?.length > 0
      ? order?.data?.order?.consultation?.fields?.confirmationInfo
      : order?.data?.order?.consultation?.fields?.legacy_confirmationInfo;
  const product_terms_conditions = order?.data?.order?.product_terms_conditions;

  console.log(order?.consultation?.fields, "confirmationInfo");
  // Tab Transition Animation Variants
  const tabContentVariants = {
    initial: { opacity: 0, y: 20 }, // Start below and hidden
    animate: { opacity: 1, y: 0 }, // Animate to visible position
    exit: { opacity: 0, y: 20 }, // Fade out and move below
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  const formatHeight = (data) => {
    console.log(data, "Dattaaaaaa");
    if (data?.height_unit == "imperial") return `${data.ft} ft ${data.inch} in`;
    if (data?.height_unit == "metrics") return `${data.cm} cm`;
    return "N/A";
  };

  const formatWeight = (data) => {
    if (data?.weight_unit == "metrics") return `${data.kg} kg`;
    if (data?.weight_unit == "imperial")
      return `${data.stones} st ${data.pound} lbs`;
    return "N/A";
  };
  return (
    <>
      <MetaLayout canonical={`${meta_url}order-detail/`} />

      <ProtectedPage>
        <DashBoardLayout>
          <div className="p-3 sm:p-6 sm:bg-[#F9FAFB] sm:min-h-screen sm:rounded-md sm:shadow-md my-5 sm:m-5">
            <div className="relative flex flex-row">
              <p className="h-fit whitespace-nowrap inline-flex items-center px-6 py-2 bg-primary border border-transparent rounded-tr-full rounded-br-full font-semibold text-xs cursor-text text-white uppercase tracking-widest hover:bg-primary focus:bg-primary active:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition ease-in-out duration-150  absolute -left-4 -top-4 lg:relative lg:top-0 lg:left-0">
                {moment(date, "DD-MM-YYYY", true).isValid()
                  ? moment(date, "DD-MM-YYYY").format("DD-MM-YYYY")
                  : "N/A"}{" "}
                {time}
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center my-6">
              <h1 className="text-2xl bold-font text-[#1C1C29] my-4 sm:mb-4 md:mb-0">
                Details of Order #{" "}
                <span className="niba-bold-font">{order?.data?.order?.id}</span>
              </h1>
              {/* Tabs */}

              {/* Buttons for Order Details */}
              <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                <button className="reg-font px-5 py-3 text-black rounded-full transition duration-300 ease-in-out w-full md:w-auto">
                  <span className="mx-1 my-1">Order Status</span>
                  <span className="reg-font bg-primary text-xs p-2 rounded-lg text-white">
                    {order?.data?.order?.status}
                  </span>
                </button>

                <button className="reg-font px-5 py-3 text-black rounded-full transition duration-300 ease-in-out w-full md:w-auto">
                  <span className="mx-1 my-1">Payment Status</span>
                  <span className="reg-font bg-primary text-xs p-2 rounded-lg text-white">
                    {order?.data?.order?.payments?.status}
                  </span>
                </button>

                <button className="reg-font px-5 py-3 text-black rounded-full transition duration-300 ease-in-out w-full md:w-auto">
                  <span className="mx-1 my-1">Order Total</span>
                  <span className="reg-font bg-primary text-xs p-2 rounded-lg text-white">
                    £{order?.data?.order?.total_price}
                  </span>
                </button>
              </div>
            </div>

            <OrdersTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={["Order Details", "Patient Details"]}
            />

            {/* Tab Content with Animation */}
            <motion.div
              className="tab-content mt-6"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5 }} // Adjust transition duration
            >
              {activeTab === 0 && (
                <>
                  <div>
                    {/* Product Detail */}

                    <div className="rounded-lg ">
                      <h2 className="text-xl font-bold text-[#1C1C29] mb-4">
                        Order Details
                      </h2>

                      <TableContainer
                        component={Paper}
                        className="rounded-lg shadow"
                      >
                        <Table>
                          {/* Table Head */}
                          <TableHead className="bg-gray-100">
                            <TableRow>
                              <TableCell className="text-black font-semibold uppercase py-3">
                                <span className="font-bold ">Items</span>
                              </TableCell>
                              <TableCell className="text-black font-semibold uppercase py-3">
                                <span className="font-bold ">Qty</span>
                              </TableCell>
                              <TableCell className="text-black font-semibold uppercase py-3">
                                <span className="font-bold ">Amount</span>
                              </TableCell>
                            </TableRow>
                          </TableHead>

                          {/* Table Body */}
                          <TableBody>
                            {/* // ?.filter((product) => product.name.includes("mg")) */}
                            {products?.map((product) => (
                              <TableRow
                                key={product.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="text-gray-800 capitalize py-3">
                                  {product.label}
                                </TableCell>
                                <TableCell className="text-gray-800 py-3">
                                  {product.quantity}
                                </TableCell>
                                <TableCell className="text-gray-800 py-3">
                                  £
                                  {(
                                    parseFloat(product.price) * product.quantity
                                  ).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}

                            {/* Shipping Fee (Optional) */}
                            {orders?.discount > 0 && (
                              <>
                                <TableRow className="hover:bg-gray-50">
                                  <TableCell className="text-gray-800 py-3 reg-font">
                                    Discount Amount
                                  </TableCell>
                                  <TableCell></TableCell>
                                  <TableCell className="text-gray-800 py-3">
                                    {orders?.type === "Fixed"
                                      ? `-£${orders?.discount_value}`
                                      : `-${parseFloat(orders?.discount_value).toFixed(1)}%`}
                                  </TableCell>
                                </TableRow>

                                <TableRow className="hover:bg-gray-50">
                                  <TableCell className="text-gray-800 py-3 reg-font">
                                    Coupon Code
                                  </TableCell>
                                  <TableCell></TableCell>
                                  <TableCell className="text-gray-800 py-3">
                                    {orders?.code || "N/A"}
                                  </TableCell>
                                </TableRow>

                                <TableRow className="hover:bg-gray-50">
                                  <TableCell className="text-gray-800 py-3 reg-font">
                                    Discount Type
                                  </TableCell>
                                  <TableCell></TableCell>
                                  <TableCell className="text-gray-800 py-3">{`${orders?.type === "Fixed" ? "Fixed" : "Percentage"}`}</TableCell>
                                </TableRow>
                              </>
                            )}

                            <TableRow className="hover:bg-gray-50">
                              <TableCell className="text-gray-800 py-3">
                                Shipping Fee
                              </TableCell>
                              <TableCell></TableCell>
                              <TableCell className="text-gray-800 py-3">
                                £{shipmentFee}
                              </TableCell>
                            </TableRow>
                            {/* Total Row */}
                            <TableRow className="font-bold ">
                              <TableCell className="py-3 font-serif">
                                <span className="bold-font ">Total</span>
                              </TableCell>
                              <TableCell></TableCell>
                              <TableCell className="py-3">
                                <span className="font-bold ">£{total}</span>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 1 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                    {/* Patient Information Section */}
                    <div className="sm:bg-gray-50 rounded-lg ">
                      <h2 className="text-xl font-bold text-[#1C1C29] mb-4">
                        Patient Information
                      </h2>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font"
                              >
                                First Name
                              </TableCell>
                              <TableCell
                                style={{ width: "50%" }}
                                className="text-[#1C1C29] capitalize"
                              >
                                {patientData?.firstName || "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font">
                                Last Name
                              </TableCell>
                              <TableCell className="text-[#1C1C29] capitalize">
                                {patientData?.lastName || "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font">
                                Pregnancy
                              </TableCell>
                              <TableCell className="text-[#1C1C29] capitalize">
                                {patientData?.pregnancy || "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font">Gender</TableCell>
                              <TableCell className="text-[#1C1C29] capitalize">
                                {patientData?.gender || "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font">
                                Date of birth
                              </TableCell>
                              <TableCell className="text-[#1C1C29] capitalize">
                                {moment(
                                  patientData?.dob,
                                  "DD-MM-YYYY",
                                  true,
                                ).isValid()
                                  ? moment(
                                      patientData.dob,
                                      "DD-MM-YYYY",
                                    ).format("DD-MM-YYYY")
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font">Phone</TableCell>
                              <TableCell className="text-[#1C1C29] capitalize">
                                {patientData?.phoneNo || "N/A"}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>

                    {/* GP Details Section */}
                    {/* <div className="sm:bg-gray-50 rounded-lg p-4">
                      <h2 className="text-xl font-bold text-[#1C1C29] mb-4">GP Details</h2>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ width: "50%" }} className="reg-font">
                                Are you registered with a GP in the UK?
                              </TableCell>
                              <TableCell style={{ width: "50%" }} className="text-[#1C1C29] capitalize">
                                {gpDetails?.gpConsent || "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font">Address</TableCell>
                              <TableCell className="text-[#1C1C29] capitalize">{gpDetails?.addressLine1 || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font">City</TableCell>
                              <TableCell className="text-[#1C1C29] capitalize">{gpDetails?.city || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font">Email</TableCell>
                              <TableCell className="text-[#1C1C29] capitalize">{gpDetails?.email || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font">County</TableCell>
                              <TableCell className="text-[#1C1C29] capitalize">{gpDetails?.state || "N/A"}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div> */}

                    {/* BMI Information Section */}
                    {/* <div className="sm:bg-gray-50 rounded-lg p-4">
                      <h2 className="text-xl font-bold text-[#1C1C29] mb-4">BMI Information</h2>
                      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell>BMI</TableCell>
                              <TableCell>{bmiData?.bmi ?? "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Height Unit</TableCell>
                              <TableCell>{bmiData?.height_unit?.toUpperCase() ?? "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Height</TableCell>
                              <TableCell>{formatHeight(bmiData)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Weight Unit</TableCell>
                              <TableCell>{bmiData?.weight_unit?.toUpperCase() ?? "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Weight</TableCell>
                              <TableCell>{formatWeight(bmiData)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div> */}
                  </div>
                </>
              )}

              {activeTab === 7 && (
                <>
                  {/* Medical info */}

                  <div className="sm:bg-gray-50 rounded-lg mb-6">
                    {medicalInfo && medicalInfo.length > 0 ? (
                      <h2 className="text-xl niba-bold-font text-[#1C1C29] mb-4 p-4">
                        Medical Information
                      </h2>
                    ) : (
                      ""
                    )}
                    {medicalInfo && medicalInfo.length > 0 ? (
                      <TableContainer component={Paper} className="mb-6">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell className="font-semibold text-[#1C1C29]">
                                SNO#
                              </TableCell>
                              <TableCell className="font-semibold text-[#1C1C29]">
                                Question
                              </TableCell>
                              <TableCell className="font-semibold text-[#1C1C29]">
                                Answer
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {medicalInfo.map((item, index) => (
                              <TableRow key={item.id || index}>
                                <TableCell className="reg-font text-[#1C1C29]">
                                  {index + 1}
                                </TableCell>

                                <TableCell className="reg-font text-[#1C1C29]">
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: item.question,
                                    }}
                                  />

                                  {item.answer === "yes" &&
                                    item.has_sub_field &&
                                    item.subfield_response && (
                                      <ul className="list-disc pl-4 text-[#f59e0b] mt-1">
                                        <li>{item.subfield_response}</li>
                                      </ul>
                                    )}
                                </TableCell>

                                <TableCell className="reg-font text-[#1C1C29] capitalize">
                                  {item.answer}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <p className="text-center text-gray-500 px-4 pb-4">
                        Medical information not found.
                      </p>
                    )}
                  </div>
                </>
              )}

              {activeTab === 5 && (
                <>
                  <h1 className="text-2xl font-light my-4">
                    <span className="niba-bold-font text-black">
                      User Consent
                    </span>
                  </h1>
                  <div className="relative overflow-x-auto border rounded-lg">
                    {startConcent ? (
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="border-b text-md text-gray-700 bg-white  [&>tr:not(:last-child)]:border-b [&>tr]:border-gray-200">
                          <tr className="uppercase">
                            {/* <th scope="col" className="px-6 py-3">SNo#</th> */}

                            {/* <th scope="col" className="px-6 py-3">Answer</th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Confirmation Details */}
                          <tr className="border-b border-gray-200 bg-white  [&>tr:not(:last-child)]:border-b [&>tr]:border-gray-200">
                            {/* <td className="px-6 py-3 text-gray-700">2</td> */}
                            <td className="px-6 py-3 text-gray-700 reg-font">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html:
                                    startConcent.PatientAcknowledgment
                                      ?.question,
                                }}
                              ></div>
                            </td>
                            {/* <td className="px-16 py-3 capitalize text-end text-gray-700">
                                    {startConcent.PatientAcknowledgment?.response === "YES" ? "Yes" : "No"}
                                </td> */}
                          </tr>
                          {startConcent.PatientAcknowledgment?.confirmation && (
                            <tr className="border-b border-gray-200 bg-white">
                              <td className="px-6 py-3 text-gray-700 mt-1 reg-font">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      startConcent.PatientAcknowledgment
                                        .confirmation.confirmation_details,
                                  }}
                                />
                              </td>
                            </tr>
                          )}

                          {/* Main Question */}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        No Consent here
                      </div>
                    )}

                    {/* Additional styling for confirmation details */}
                    <style jsx>{`
                      .mt-1 ul {
                        list-style-type: disc;
                        padding-left: 1.5rem;
                      }
                      .mt-1 li {
                        margin-bottom: 0.5rem;
                        color: #4a5568;
                      }
                    `}</style>
                  </div>
                  {order?.items?.some(
                    (item) => item.product_concent !== null,
                  ) && (
                    <>
                      <h1 className="text-2xl font-light my-4">
                        <span className="niba-bold-font">
                          Product Related Consent
                        </span>
                      </h1>

                      <div className="relative overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                          <thead className="border-b text-md text-gray-700 bg-gray-50  [&>tr:not(:last-child)]:border-b [&>tr]:border-gray-200">
                            <tr className="uppercase">
                              {/* <th scope="col" className="px-6 py-3">SNo#</th> */}

                              {/* <th scope="col" className="px-6 py-3">Answer</th> */}
                            </tr>
                          </thead>
                          <tbody>
                            {order?.items?.map((item, index) => {
                              return (
                                item.product_concent != null && (
                                  <tr className="border-b border-gray-200 bg-gray-50  [&>tr:not(:last-child)]:border-b [&>tr]:border-gray-200">
                                    <td className="px-6 py-3 text-gray-700 mt-1">
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: item.product_concent,
                                        }}
                                      />
                                    </td>
                                  </tr>
                                )
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Additional styling for confirmation details */}
                        <style jsx>{`
                          .mt-1 ul {
                            list-style-type: disc;
                            padding-left: 1.5rem;
                          }
                          .mt-1 li {
                            margin-bottom: 0.5rem;
                            color: #4a5568;
                          }
                        `}</style>
                      </div>
                    </>
                  )}

                  {confirmationInfo?.length > 0 && (
                    <>
                      <h1 className="text-2xl font-light mt-8 mb-4">
                        <span className="niba-bold-font text-black">
                          Confirmation
                        </span>
                      </h1>

                      <TableContainer
                        component={Paper}
                        className="rounded-lg overflow-x-auto"
                      >
                        <Table aria-label="confirmation table">
                          <TableBody>
                            {confirmationInfo.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <div
                                    className="prose"
                                    dangerouslySetInnerHTML={{
                                      __html: `
                      <style>
                        .prose ol {
                          list-style-type: decimal;
                          padding-left: 20px;
                          margin-top: 0;
                          margin-bottom: 1em;
                        }
                        .prose ul {
                          list-style-type: disc;
                          padding-left: 20px;
                          margin-top: 0;
                          margin-bottom: 1em;
                        }
                        .prose li {
                          line-height: 2.5;
                        }
                        .prose p {
                          margin-top: 0;
                          margin-bottom: 1em;
                          line-height: 1.8;
                        }
                        .prose a {
                          color: blue;
                          text-decoration: none;
                        }
                        .prose a:hover {
                          text-decoration: underline;
                        }
                      </style>
                      ${item.question}
                    `,
                                    }}
                                  />

                                  {item.has_checklist && (
                                    <div
                                      className="prose"
                                      dangerouslySetInnerHTML={{
                                        __html: `
                        <style>
                          .prose ol {
                            list-style-type: decimal;
                            padding-left: 20px;
                            margin-top: 0;
                            margin-bottom: 1em;
                          }
                          .prose ul {
                            list-style-type: disc;
                            padding-left: 20px;
                            margin-top: 0;
                            margin-bottom: 1em;
                          }
                          .prose li {
                            line-height: 2.5;
                          }
                          .prose p {
                            margin-top: 0;
                            margin-bottom: 1em;
                            line-height: 1.8;
                          }
                          .prose a {
                            color: blue;
                            text-decoration: none;
                          }
                          .prose a:hover {
                            text-decoration: underline;
                          }
                        </style>
                        ${item.checklist}
                      `,
                                      }}
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}

                  {product_terms_conditions &&
                    product_terms_conditions !== null &&
                    product_terms_conditions !== "" && (
                      <>
                        <h1 className="text-2xl font-light mt-8 mb-4">
                          <span className="niba-bold-font text-black">
                            Medication Terms & Conditions
                          </span>
                        </h1>

                        <TableContainer
                          component={Paper}
                          sx={{ borderRadius: 2 }}
                        >
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  sx={{
                                    minWidth: 400,
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Response
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>
                                  <div
                                    className="prose"
                                    dangerouslySetInnerHTML={{
                                      __html: `
                    <style>
                      .prose ol {
                          list-style-type: decimal;
                          padding-left: 20px;
                          margin-top: 0;
                          margin-bottom: 1em;
                      }
                      .prose ul {
                          list-style-type: disc;
                          padding-left: 20px;
                          margin-top: 0;
                          margin-bottom: 1em;
                      }
                      .prose li {
                          line-height: 2.5;
                      }
                      .prose p {
                          margin-top: 0;
                          margin-bottom: 1em;
                          line-height: 1.8;
                      }
                      .prose a {
                          color: blue;
                          text-decoration: none;
                      }
                      .prose a:hover {
                          text-decoration: underline;
                      }
                    </style>
                    ${product_terms_conditions}
                  `,
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    )}
                </>
              )}

              {activeTab === 8 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Patient Information Section */}

                    <div className="sm:bg-gray-50 rounded-lg mb-6">
                      <h2 className="text-xl niba-bold-font text-[#1C1C29] mb-4">
                        Shipping Information
                      </h2>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  paragraph"
                              >
                                First Name
                              </TableCell>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  text-[#1C1C29] capitalize"
                              >
                                {shippingData?.first_name
                                  ? shippingData?.first_name
                                  : patientData?.firstName
                                    ? patientData?.firstName
                                    : "N/A"}
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  paragraph"
                              >
                                Last Name
                              </TableCell>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  text-[#1C1C29] capitalize"
                              >
                                {shippingData?.last_name
                                  ? shippingData?.last_name
                                  : patientData?.lastName
                                    ? patientData?.lastName
                                    : "N/A"}
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  paragraph"
                              >
                                Address1
                              </TableCell>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  text-[#1C1C29] capitalize"
                              >
                                {shippingData?.addressone
                                  ? shippingData?.addressone
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  paragraph"
                              >
                                Address2
                              </TableCell>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  text-[#1C1C29] capitalize"
                              >
                                {shippingData?.addresstwo
                                  ? shippingData?.addresstwo
                                  : "N/A"}
                                {/* {shippingData.addresstwo ? shippingData?.addresstwo : "N/A"} */}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font  paragraph">
                                City
                              </TableCell>
                              <TableCell className="reg-font  text-[#1C1C29] capitalize">
                                {shippingData?.city
                                  ? shippingData?.city
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font  paragraph">
                                County / Province / Region:
                              </TableCell>
                              <TableCell className="reg-font  text-[#1C1C29] capitalize">
                                {shippingData?.state
                                  ? shippingData?.state
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font  paragraph">
                                Postalcode
                              </TableCell>
                              <TableCell className="reg-font  text-[#1C1C29] capitalize">
                                {shippingData?.postalcode
                                  ? shippingData?.postalcode
                                  : "N/A"}
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="reg-font  paragraph">
                                Country
                              </TableCell>
                              <TableCell className="reg-font  text-[#1C1C29] capitalize">
                                {shippingData?.country
                                  ? shippingData?.country
                                  : "N/A"}
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="reg-font  paragraph">
                                Phone Number
                              </TableCell>
                              <TableCell className="reg-font  text-[#1C1C29] capitalize">
                                {patientData?.phoneNo
                                  ? patientData?.phoneNo
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>

                    <div className="sm:bg-gray-50 rounded-lg mb-6">
                      <h2 className="text-xl niba-bold-font text-[#1C1C29] mb-4">
                        Billing Information
                      </h2>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  paragraph"
                              >
                                Address1
                              </TableCell>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  text-[#1C1C29] capitalize"
                              >
                                {BillingData?.addressone
                                  ? BillingData?.addressone
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  paragraph"
                              >
                                Address2
                              </TableCell>
                              <TableCell
                                style={{ width: "50%" }}
                                className="reg-font  text-[#1C1C29] capitalize"
                              >
                                {BillingData?.addresstwo
                                  ? BillingData?.addresstwo
                                  : "N/A"}
                                {/* {shippingData.addresstwo ? shippingData?.addresstwo : "N/A"} */}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font  paragraph">
                                City
                              </TableCell>
                              <TableCell className="reg-font  text-[#1C1C29] capitalize">
                                {BillingData?.city ? BillingData?.city : "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font  paragraph">
                                County / Province / Region:
                              </TableCell>
                              <TableCell className="reg-font  text-[#1C1C29] capitalize">
                                {BillingData?.state
                                  ? BillingData?.state
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="reg-font  paragraph">
                                Postalcode
                              </TableCell>
                              <TableCell className="reg-font  text-[#1C1C29] capitalize">
                                {BillingData?.postalcode
                                  ? BillingData?.postalcode
                                  : "N/A"}
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="reg-font  paragraph">
                                Country
                              </TableCell>
                              <TableCell className="reg-font  text-[#1C1C29] capitalize">
                                {BillingData?.country
                                  ? BillingData?.country
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            <div className="flex justify-start my-3">
              <Link href="/orders/">
                <button className="reg-font px-6 py-2 bg-primary cursor-pointer text-white rounded-md hover:bg-primary transition">
                  Back
                </button>
              </Link>
            </div>
          </div>
        </DashBoardLayout>
      </ProtectedPage>
    </>
  );
};

export default OrderDetail;
