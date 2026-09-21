import React from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaInfoCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import moment from "moment/moment";
import ConfirmationModal from "../Modal/ConfirmationModal";
import useCartStore from "@/store/useCartStore";
import { getNotified } from "@/api/mergeRoutes";
import useProductId from "@/store/useProductIdStore";
import { FoundayoProductId } from "@/config/constants";

const Dose = ({
  doseData,
  onAdd,
  onIncrement,
  onDecrement,
  isSelected,
  qty,
  allow,
  totalSelectedQty,
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { removeItemCompletely } = useCartStore();

  const allowed = parseInt(allow || 100);
  const doseStatus = doseData?.stock?.status;
  const isOutOfStock = doseStatus === 0 || doseData?.stock?.quantity === 0;
  const isAllowExceeded = totalSelectedQty() >= allowed;
  const { productId } = useProductId();

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!isSelected) {
      onAdd();
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();

    const totalQty = totalSelectedQty() + 1;

    // Check if global total quantity exceeded
    if (totalQty > allowed) {
      toast.error(`You can only select up to ${allowed} units in total.`);
      return;
    }

    // Check if this product's own qty exceeded its stock
    if (doseData.qty >= doseData.stock.quantity) {
      toast.error(`Only ${doseData.stock.quantity} units are available.`);
      return;
    }

    // Check if this product's qty exceeded allowed
    if (qty >= allowed) {
      toast.error(
        `You cannot select more than ${allowed} units for this option.`,
      );
      return;
    }

    // All okay, increment
    onIncrement(doseData?.id);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (qty > 1) {
      onDecrement();
    } else {
      setShowModal(true);
    }
  };

  const handleDelete = () => {
    setShowModal(false);
    removeItemCompletely(doseData?.id, "doses");
  };

  const handleNotifiedClick = async (dose) => {
    setIsLoading(true);
    try {
      // ✅ Replace in your Dose.js:
      const response = await getNotified({
        eid: dose.pivot?.eid,
        pid: dose.pivot?.pid,
      });

      console.log(response, "response from get notified");

      if (response?.data?.status === true) {
        toast.success(response?.data?.message);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.errors?.Notification ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isWegovyPill =
    doseData?.product_name?.toLowerCase().trim() === "Foundayo (Orforglipron)" ||
    doseData?.name?.toLowerCase().trim() === "Foundayo (Orforglipron)";

  const price = Number(doseData?.price || 0);

  const isPriceComingSoon = isWegovyPill && price == 0;

  return (
    <>
      <div className="relative">
        {doseStatus === 0 && Number(productId) !== FoundayoProductId && (
          <div className="group absolute -top-3.5 right-3 z-20 inline-block">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNotifiedClick(doseData);
              }}
              disabled={isLoading}
              className="inter-semibold-font inline-flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-[11.5px] text-emerald-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-emerald-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span className="whitespace-nowrap">Loading...</span>
                </>
              ) : (
                <>
                  <FaInfoCircle className="text-[12px]" />
                  <span className="whitespace-nowrap">Get Notified</span>
                </>
              )}
            </button>

            <div className="inter-reg-font pointer-events-none absolute right-0 top-9 z-30 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
              You'll be notified when this item is back in stock.
            </div>
          </div>
        )}

        <div
          onClick={isOutOfStock || isAllowExceeded ? undefined : handleAdd}
          className={`relative mt-5 flex justify-between rounded-[14px] border-2 p-3.5 transition-all duration-200 sm:p-4
            ${isSelected ? "flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-0" : "flex-row items-center gap-3"}
            ${
              isOutOfStock
                ? "cursor-not-allowed border-slate-200 bg-slate-50/80"
                : isSelected
                  ? "cursor-pointer border-[#4565BF] bg-white shadow-[0_4px_16px_rgba(69,101,191,0.16)]"
                  : isAllowExceeded
                    ? "cursor-not-allowed border-slate-200 bg-slate-50/80"
                    : "cursor-pointer border-slate-200 bg-white hover:border-[#4565BF]/40 hover:bg-[#4565BF]/[0.02]"
            }`}
        >
          {isOutOfStock && (
            <>
              <div className="absolute inset-0 z-10 cursor-not-allowed rounded-[14px] bg-slate-100/20" />
              <div className="inter-semibold-font absolute -top-3.5 left-3 z-20 inline-flex h-7 items-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-[11.5px] text-rose-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                {Number(productId) == FoundayoProductId ? "Coming Soon" : "Out of stock"}
              </div>
            </>
          )}

          {!isOutOfStock && !isSelected && isAllowExceeded && (
            <div className="inter-semibold-font absolute -top-3.5 left-3 z-20 inline-flex h-7 items-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-[11.5px] text-amber-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              Selection limit reached
            </div>
          )}

          {/* Left Side */}
          <div className={`flex min-w-0 items-start gap-2.5 transition-opacity sm:items-center sm:gap-3 ${isSelected ? "w-full sm:w-auto" : "w-auto flex-1"} ${isOutOfStock || (!isSelected && isAllowExceeded) ? "opacity-60 grayscale" : ""}`}>
            <div className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-all duration-150 sm:h-5 sm:w-5
              ${isSelected ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}>
              {isSelected && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="inter-semibold-font break-words text-[14px] capitalize leading-snug text-slate-900 sm:text-[15px]">
                {doseData?.product_name}
              </p>
              <p className={`inter-medium-font text-[13px] ${isSelected ? "text-[#4565BF]" : "text-slate-500"}`}>
                {doseData.name}
              </p>
              {doseData?.expiry && (
                <p className="inter-reg-font mt-0.5 text-[12.5px] text-slate-500">
                  Expiry: {moment(doseData?.expiry).format("DD/MM/YYYY")}
                </p>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className={`flex items-center gap-2 transition-opacity sm:w-auto sm:gap-3 ${isSelected ? "w-full justify-between" : "w-auto justify-end"} ${isOutOfStock || (!isSelected && isAllowExceeded) ? "opacity-60 grayscale" : ""}`}>
            <span
              className={`inter-semibold-font shrink-0 text-[16px] ${isSelected ? "text-[#4565BF]" : "text-slate-700"}`}
            >
              {isPriceComingSoon ? (
                <span className="text-[13px]">Price coming soon</span>
              ) : (
                <>£{parseFloat(doseData?.price).toFixed(2)}</>
              )}
            </span>
            {isSelected && (
              <>
                <div className="ml-auto flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-1 shadow-sm sm:ml-0 sm:gap-1">
                  <button type="button" onClick={handleDecrement}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors">
                    <FaMinus size={9} className="text-slate-600" />
                  </button>
                  <span className="inter-semibold-font w-6 text-center text-[13px] text-slate-900">{qty}</span>
                  <button type="button" onClick={handleIncrement}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors
                      ${qty >= allowed ? "cursor-not-allowed bg-slate-100 opacity-40" : "bg-slate-100 hover:bg-slate-200 cursor-pointer"}`}>
                    <FaPlus size={9} className="text-slate-600" />
                  </button>
                </div>

                <button type="button"
                  onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition-colors hover:border-red-200 hover:bg-red-100">
                  <MdDelete size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal
        showModal={showModal}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
};

export default Dose;
