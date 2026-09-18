import React from "react";
import { Loader2, PackageX, Pill } from "lucide-react";

const ProductGridCard = ({
  title,
  image,
  originalPrice,
  isOutOfStock,
  isLoading,
  buttonText,
  onClick,
}) => {
  return (
    <article
      className={`
        group relative flex h-full flex-col overflow-hidden rounded-2xl border
        bg-white transition-all duration-200
        ${isOutOfStock
          ? "border-slate-200/70 opacity-60 cursor-not-allowed"
          : "border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)] cursor-pointer"
        }
      `}
    >
      {/* Image */}
      <div className="relative h-[145px] 2xl:h-[160px] [@media(min-width:1921px)]:h-[200px] overflow-hidden bg-[#4565BF]/[0.07]">
        {isOutOfStock && (
          <span className="inter-medium-font absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full border border-red-100 bg-white px-2 py-0.5 text-[10px] text-red-500 shadow-sm">
            <PackageX size={9} strokeWidth={2} />
            Out of stock
          </span>
        )}
        {image ? (
          <img
            src={image}
            alt={title || "Treatment"}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Pill size={20} strokeWidth={1.5} className="text-slate-300" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3 2xl:p-4">
        <h3 className="inter-semibold-font text-[12.5px] lg:text-[13px] 2xl:text-[14px] leading-snug text-slate-900">
          {title}
        </h3>

        <div className="mt-2.5 border-t border-slate-100 pt-2.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="inter-reg-font text-[10px] uppercase tracking-[0.08em] text-slate-400">
              Starting from
            </p>
            <span className="inter-bold-font text-[14px] lg:text-[15px] 2xl:text-[16px] leading-none text-[#4565BF]">
              £{originalPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={onClick}
            disabled={isOutOfStock || isLoading}
            className={`inter-medium-font inline-flex min-h-[32px] lg:min-h-[33px] 2xl:min-h-[36px] w-full items-center
              justify-center gap-2 rounded-xl px-3
              text-[11.5px] lg:text-[12px] 2xl:text-[12.5px] transition-all duration-150
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
      </div>
    </article>
  );
};

export default ProductGridCard;
