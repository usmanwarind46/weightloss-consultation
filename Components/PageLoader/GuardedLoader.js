"use client";

import { useEffect, useState } from "react";
import Router from "next/router";
import PageLoader from "./PageLoader";

const SLOW_AFTER_MS = 5000;

// onRetry / onCancel are still passed by some pages but are intentionally
// ignored: the loader no longer shows "Try again" / "Back" buttons.
export default function GuardedLoader({ show = false, message = "" }) {
  const [isSlow, setIsSlow] = useState(false);

  // Block browser back while loading
  useEffect(() => {
    if (!show) return;
    Router.beforePopState(() => false);
    return () => Router.beforePopState(() => true);
  }, [show]);

  useEffect(() => {
    if (!show) {
      setIsSlow(false);
      return;
    }
    const slowTimer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(slowTimer);
  }, [show]);

  if (!show) return null;

  return (
    <PageLoader
      message={isSlow ? "Please wait, this may take a few moments…" : message}
    />
  );
}
