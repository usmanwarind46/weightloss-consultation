import React, { useEffect, useState } from "react";
import { IoEye } from "react-icons/io5";
import Link from "next/link";
import Pagination from "@/Components/Pagination/Pagination";
import GetOrdersApi from "@/api/getOrders";
import { useMutation } from "@tanstack/react-query";
import useOrderId from "@/store/useOrderIdStore";
import { useRouter } from "next/router";
import usePaginationStore from "@/store/pagination";
import { useStatusStore } from "@/store/useStatusStore";

const MyOrders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setOrderList] = useState(null);
  // const [orderData] = useState(data?.myorders.allorders);
  const [searchValue, setSearchValue] = useState("");
  // const [status, setStatus] = useState("all");

  const { currentPage, setCurrentPage } = usePaginationStore(); // ✅ from Zustand
  const { status, setStatus } = useStatusStore();

  const { setOrderId } = useOrderId();

  const router = useRouter();

  console.log(data, "data");
  const getOrderList = useMutation(GetOrdersApi, {
    onSuccess: (res) => {
      const paginationData = res?.data?.myorders || {};
      setOrderList(paginationData); // ✅ Set the entire pagination object
      setIsLoading(false);
    },

    onError: (error) => {
      toast.error(error?.response?.data?.errors || "Something went wrong");
      setIsLoading(false);
    },
  });

  useEffect(() => {
    getOrderList.mutate({ data: {}, page: currentPage });
  }, [currentPage]);

  // Search handler
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  // Filter handler for status
  const handleStatusChange = (selectedStatus) => {
    setStatus(selectedStatus);
  };
  console.log(data, "dsdsdsdsdsdata");
  // Filter data based on search input and status
  // const APIORDER = data?.myorders?.allorders
  const filteredData = data?.allorders?.filter((order) => {
    const matchesSearch =
      order.order_id?.toString().includes(searchValue) ||
      order.treatment?.toLowerCase().includes(searchValue) ||
      // order.items.some((item) => item.name.toLowerCase().includes(searchValue));
      order.items.some((item) => item.product.toLowerCase().includes(searchValue));

    const matchesStatus = status === "all" || order.status.toLowerCase() === status.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "incomplete":
        return "bg-orange-100 text-orange-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSendId = (id) => {
    setOrderId(id);
    router.push("/order-detail");
  };

  return (
    <div className="md:p-6 sm:px-2 sm:bg-[#F9FAFB] sm:min-h-screen sm:rounded-md sm:shadow-md my-5 md:me-5">
      {/* Search and Filter Section */}
      <header className="p-4">
        <h1 className="md:text-3xl text-lg mb-2 headingDashBoard bold-font">My Orders</h1>
        <p className="reg-font paragraph  text-left text-sm xl:w-3/4 mt-2">View your order history</p>
      </header>
      <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/2">
          <form className="flex items-center" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="simple-search" className="sr-only">
              Search
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                value={searchValue}
                onChange={handleSearchChange}
                type="text"
                id="simple-search"
                className="reg-font bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2"
                placeholder="Search by Order ID"
              />
            </div>
          </form>
        </div>

        <div className="w-full md:w-auto flex items-center justify-between">
          <label htmlFor="status" className="text-sm reg-font text-gray-700 mr-2">
            Sort by status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`reg-font text-sm rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-[#4565BF]-500 px-4 py-2 appearance-none pr-8 transition ease-in-out duration-200 ${getStatusClasses(
                status
              )}`}
            >
              <option value="all">All</option>
              <option value="processing">Processing</option>
              <option value="incomplete">Incomplete</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {/* Custom Arrow Icon */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="my-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
        <div class="flex items-start">
          <div class="flex">
            <span>
              <svg class="w-6 h-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1 4v1m-1-1h1a1 1 0 001-1v-1h-1v1m-1-1v-4h1a1 1 0 011 1v1h1v-1a1 1 0 00-1-1h-1V9m0-1a1 1 0 10-2 0v1H9m4-1V7H9v1h1v1h1v-1h1V8z"
                ></path>
              </svg>
            </span>
            <span class="font-bold">Note</span>
            <span class="mx-2 reg-font">Changes to your shipping address will only apply to future orders and will not affect previous ones</span>
          </div>
        </div>
      </div>
      {/* Orders Table */}
      <div className="reg-font relative overflow-x-scroll lg:overflow-x-auto sm:w-full w-96 mt-6 overflow-hidden px-3">
        <table className="w-full text-sm text-left text-gray-500 table-auto">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:whitespace-nowrap">
              <th scope="col">Order ID</th>
              <th scope="col">Order Date</th>
              <th scope="col">Treatment</th>
              <th scope="col">Items</th>
              <th scope="col">Status</th>
              <th scope="col">Total</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Skeleton Loader
              [...Array(5)].map((_, index) => (
                <tr key={index} className="border-b animate-pulse">
                  <td className="px-3 py-3">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 bg-gray-300 rounded w-28"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 bg-gray-300 rounded w-10"></div>
                  </td>
                </tr>
              ))
            ) : filteredData?.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No orders found{" "}
                </td>
              </tr>
            ) : (
              filteredData?.map((order) => (
                <tr key={order.order_id} className="border-b [&>td]:px-3 [&>td]:py-3 [&>td]:whitespace-nowrap">
                  <td>{order.order_id}</td>
                  <td>
                    <span className="bg-blue-100 text-blue-800 text-xs reg-font px-2.5 py-0.5 rounded-full">{order.created_at}</span>
                  </td>
                  <td>
                    {Array.from(new Set(order.items.map((item) => item.product))).map((uniqueProduct, index) => (
                      <li className="list-none" key={index}>
                        {uniqueProduct}
                      </li>
                    ))}
                  </td>
                  {/* <td>
                    {Object.values(
                      order.items.reduce((acc, item) => {
                        const key = item.name;
                        acc[key] = acc[key] || {
                          name: item.name === "" && item.label === "Pack of 5 Needles" ? "Pack of 5 Needles" : item.name,
                          quantity: 0,
                        };
                        acc[key].quantity += item.quantity;
                        return acc;
                      }, {})
                    ).map((groupedItem, index) => (
                      <li key={index}>
                        {groupedItem.name} x {groupedItem.quantity}
                      </li>
                    ))}
                  </td> */}
                  <td>
                    <span
                      className={`${
                        order.status === "Processing"
                          ? "bg-yellow-100 border-yellow-500 text-yellow-800"
                          : order.status === "Incomplete"
                          ? "bg-orange-100 border-orange-500 text-orange-800"
                          : order.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : order.status === "Approved"
                          ? "bg-green-100 border-green-500 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      } text-xs reg-font px-2.5 py-0.5 rounded-full`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>£{order.total_price}</td>
                  <td>
                    <div className="flex items-center gap-6 justify-around">
                      <div className="group relative">
                        <button onClick={() => handleSendId(order?.id)} className="cursor-pointer">
                          <IoEye size={20} color="#4565BF" className="group-hover:opacity-75" />
                        </button>
                        <div className="-top-8 hidden group-hover:block absolute bg-gray-800 text-white p-2 rounded shadow-lg text-xs left-1/2 transform -translate-x-1/2">
                          View
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination pagination={data} setPage={setCurrentPage} />
    </div>
  );
};

export default MyOrders;
