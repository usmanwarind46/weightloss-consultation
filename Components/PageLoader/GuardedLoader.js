"use client";

import { useEffect, useState } from "react";
import Router from "next/router";
import PageLoader from "./PageLoader";

const SLOW_AFTER_MS = 5000;
const ACTIONS_AFTER_MS = 15000;

export default function GuardedLoader({
  show = false,
  message = "",
  onRetry,
  onCancel,
  retryLabel = "Try again",
  cancelLabel = "Cancel",
}) {
  const [isSlow, setIsSlow] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Block browser back while loading
  useEffect(() => {
    if (!show) return;
    Router.beforePopState(() => false);
    return () => Router.beforePopState(() => true);
  }, [show]);

  useEffect(() => {
    if (!show) {
      setIsSlow(false);
      setShowActions(false);
      return;
    }
    const slowTimer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
    const actionsTimer = setTimeout(() => setShowActions(true), ACTIONS_AFTER_MS);
    return () => {
      clearTimeout(slowTimer);
      clearTimeout(actionsTimer);
    };
  }, [show]);

  if (!show) return null;

  return (
    <PageLoader
      message={isSlow ? "Your internet connection seems slow. Please wait…" : message}
    >
      {showActions && (onRetry || onCancel) && (
        <div className="mt-2 flex w-full flex-col gap-2 px-3 sm:flex-row sm:justify-center">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inter-medium-font cursor-pointer rounded-lg bg-[#4565BF] px-6 py-2 text-[15px] text-white transition-colors hover:bg-[#3550a0]"
            >
              {retryLabel}
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inter-medium-font cursor-pointer rounded-lg border border-[#4565BF] bg-white px-6 py-2 text-[15px] text-[#4565BF] transition-colors hover:bg-slate-50"
            >
              {cancelLabel}
            </button>
          )}
        </div>
      )}
    </PageLoader>
  );
}
