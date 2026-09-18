import React from "react";
import { Loader2, PackageX, Pill } from "lucide-react";

const ProductListCard = ({
  title,
  image,
  originalPrice,
  isOutOfStock,
  isLoading,
  buttonText,
  onClick,
  isSelected = false,
}) => {
  return (
    <article
      className={`
        group grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-2xl border bg-white
        px-3 py-3 sm:flex sm:flex-nowrap sm:gap-4 sm:px-4 sm:py-3.5 2xl:px-5 2xl:py-4 transition-all duration-200
        ${isSelected
          ? "border-[#4565BF] shadow-[0_0_0_3px_rgba(71,49,124,0.10)]"
          : isOutOfStock
          ? "border-slate-200/70 opacity-60"
          : "border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
        }
      `}
      aria-selected={isSelected}
    >
      {/* Image box */}
      <div className="relative row-span-2 flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#4565BF]/[0.07] sm:h-[64px] sm:w-[64px] 2xl:h-[76px] 2xl:w-[76px]">
        {isOutOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <PackageX size={16} strokeWidth={1.8} className="text-red-400" />
          </span>
        )}
        {image ? (
          <img
            src={image}
            alt={title || "Treatment"}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <Pill size={20} strokeWidth={1.5} className="text-slate-300" />
        )}
      </div>

      {/* Title */}
      <div className="min-w-0 flex-1">
        {isOutOfStock && (
          <span className="inter-medium-font mb-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-500">
            Out of stock
          </span>
        )}
        <h3 className="inter-semibold-font break-words text-[14px] leading-snug text-slate-900 sm:truncate lg:text-[14px] 2xl:text-[16px]">
          {title}
        </h3>
      </div>

      {/* Price + Button */}
      <div className="col-start-2 flex w-full shrink-0 flex-wrap items-center justify-between gap-2 sm:w-auto sm:flex-nowrap sm:justify-start sm:gap-4 2xl:gap-5">
        <div className="flex items-baseline gap-1.5 text-right sm:block">
          <p className="inter-reg-font text-[10px] uppercase tracking-[0.1em] text-slate-400">From</p>
          <span className="inter-bold-font text-[16px] lg:text-[16px] 2xl:text-[20px] leading-tight text-[#4565BF]">
            £{originalPrice}
          </span>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClick?.();
          }}
          disabled={isOutOfStock || isLoading}
          className={`inter-medium-font inline-flex min-h-[36px] lg:min-h-[36px] 2xl:min-h-[42px] items-center justify-center gap-1.5
            rounded-xl px-3 text-[12px] sm:px-4 sm:text-[12.5px] lg:px-4 lg:text-[12.5px] 2xl:px-6 2xl:text-[13.5px]
            whitespace-nowrap transition-all duration-150
            ${isOutOfStock
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "cursor-pointer bg-[#4565BF] text-white hover:bg-[#3550a0] active:scale-[0.97]"
            }`}
        >
          {isLoading
            ? <><Loader2 size={12} strokeWidth={2.5} className="animate-spin" />Processing</>
            : buttonText
          }
        </button>
      </div>
    </article>
  );
};

export default ProductListCard;
