import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Camera,
  ChevronRight,
  IdCard,
  UploadCloud,
} from "lucide-react";

import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import useImageUploadStore from "@/store/useImageUploadStore ";

const AlertBanner = ({
  icon: Icon,
  title,
  description,
  buttonText,
  href,
}) => {
  return (
    <section className="w-full overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50/40 shadow-[0_1px_4px_rgba(180,83,9,0.06)]">
      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Content */}
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Icon size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inter-medium-font inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-amber-600">
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

        {/* Action */}
        <Link
          href={href}
          className="inter-medium-font group inline-flex min-h-[38px] w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border bg-amber-50 border border-amber-200 px-5 py-2 text-[12.5px] text-amber-600 no-underline transition-all duration-150 hover:bg-amber-100 active:scale-[0.98] lg:w-auto lg:min-w-[140px]"
        >
          <UploadCloud size={14} strokeWidth={2.2} />
          <span>{buttonText}</span>
          <ChevronRight size={13} strokeWidth={2.5} className="transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
};

const UploadTopPrompt = ({ isLoading = false }) => {
  const router = useRouter();

  const [uploadStoresHydrated, setUploadStoresHydrated] = useState(() =>
    typeof window !== "undefined" &&
    useImageUploadStore.persist.hasHydrated() &&
    useIdVerificationUploadStore.persist.hasHydrated(),
  );

  const { imageUploaded } = useImageUploadStore();
  const { idVerificationUpload } = useIdVerificationUploadStore();

  useEffect(() => {
    const updateHydrationState = () => {
      setUploadStoresHydrated(
        useImageUploadStore.persist.hasHydrated() &&
          useIdVerificationUploadStore.persist.hasHydrated(),
      );
    };

    updateHydrationState();

    const unsubscribeImage =
      useImageUploadStore.persist.onFinishHydration(updateHydrationState);
    const unsubscribeId =
      useIdVerificationUploadStore.persist.onFinishHydration(updateHydrationState);

    return () => {
      unsubscribeImage?.();
      unsubscribeId?.();
    };
  }, []);

  const isDashboardRoute = router.pathname === "/dashboard";

  if (!isDashboardRoute || !uploadStoresHydrated) return null;

  // Dono upload ho chuke hain — banner aayega hi nahi, skeleton bhi nahi
  if (imageUploaded && idVerificationUpload) return null;

  // Prompt eligibility API se confirm hone tak optional area render na karo.
  // Is se first visit par default `false` store values ki wajah se false skeleton flash nahi hota.
  if (isLoading) return null;

  if (!imageUploaded) {
    return (
      <div className="w-full">
        <AlertBanner
          icon={Camera}
          title="Upload your photo"
          description="Please upload your Photo verification to complete your order."
          buttonText="Upload photo"
          href="/photo-upload"
        />
      </div>
    );
  }

  if (!idVerificationUpload) {
    return (
      <div className="w-full">
        <AlertBanner
          icon={IdCard}
          title="Verify Your Identity"
          description="Please upload a valid ID to verify your identity and complete your order."
          buttonText="Upload ID"
          href="/id-verification"
        />
      </div>
    );
  }

  return null;
};

export default UploadTopPrompt;
