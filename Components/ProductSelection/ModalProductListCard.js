import React from "react";
import { Loader2, PackageX, Pill } from "lucide-react";

const ModalProductListCard = ({
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
      onClick={() => {
        if (!isOutOfStock && !isLoading) onClick?.();
      }}
      onKeyDown={(event) => {
        if (
          !isOutOfStock &&
          !isLoading &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={isOutOfStock || isLoading ? -1 : 0}
      className={`
        group flex h-full select-none flex-col items-stretch gap-2 rounded-2xl border bg-white
        px-3 py-3 transition-none sm:h-auto sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3.5 2xl:px-5 2xl:py-4
        ${isSelected
          ? "border-[#4565BF] bg-[#4565BF]/[0.025] shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
          : isOutOfStock
          ? "cursor-not-allowed border-slate-200/70 opacity-60"
          : "cursor-pointer border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
        }
      `}
      aria-selected={isSelected}
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#4565BF]/[0.07] sm:h-[64px] sm:w-[64px] 2xl:h-[76px] 2xl:w-[76px]">
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

      <div className="min-w-0 sm:flex-1">
        {isOutOfStock && (
          <span className="inter-medium-font mb-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-500">
            Out of stock
          </span>
        )}
        <h3 className="inter-semibold-font break-words text-[13px] leading-[19px] text-slate-900 sm:truncate sm:text-[14px] sm:leading-snug lg:text-[14px] 2xl:text-[16px]">
          {title}
        </h3>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-start sm:gap-4 2xl:gap-5">
        <div className="flex items-baseline gap-1.5 text-left sm:block sm:text-right">
          <p className="inter-reg-font text-[10px] uppercase tracking-[0.1em] text-slate-400">From</p>
          <span className="inter-bold-font text-[16px] leading-tight text-[#4565BF] lg:text-[16px] 2xl:text-[20px]">
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
          aria-pressed={isSelected}
          className={`inter-medium-font inline-flex h-[34px] w-full shrink-0 items-center justify-center gap-1.5 overflow-hidden
            whitespace-nowrap rounded-xl px-2 text-[10.5px] transition-none sm:h-9 sm:w-[142px] sm:px-4 sm:text-[12.5px] 2xl:h-[42px] 2xl:w-[160px] 2xl:px-6 2xl:text-[13.5px]
            ${isOutOfStock
              ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
              : isSelected
                ? "cursor-pointer border border-[#4565BF] bg-[#4565BF] text-white"
                : "cursor-pointer border border-[#d6def2] bg-[#eaeffb] text-[#4565BF] hover:border-[#c3cfec] hover:bg-[#dfe7f9]"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={12} strokeWidth={2.5} className="animate-spin" />
              Processing
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </article>
  );
};

export default ModalProductListCard;
