import { useEffect, useRef } from "react";

export const NETWORK_ERROR_MESSAGE =
  "Your internet connection seems slow or unavailable. Please try again.";
export const GENERIC_ERROR_MESSAGE = "Something went wrong.";

// axios 0.27 sets error.response to the XHR object on network errors, so check the HTTP status instead
export const isNetworkError = (error) =>
  !!error &&
  !error.response?.status &&
  (error.code === "ERR_NETWORK" ||
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT" ||
    /network|timeout/i.test(error.message || ""));

export const isUnauthorized = (error) =>
  error?.response?.status === 401 ||
  error?.response?.data?.message === "Unauthenticated.";

const firstString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return firstString(value[0]);
  if (typeof value === "object") return firstString(Object.values(value)[0]);
  return null;
};

// network error -> connection message, else server message, else generic
export const getApiErrorMessage = (error) => {
  if (isNetworkError(error)) return NETWORK_ERROR_MESSAGE;
  const data = error?.response?.data;
  return firstString(data?.errors) || firstString(data?.message) || GENERIC_ERROR_MESSAGE;
};

// true while the component is mounted; use it to ignore late API responses
export const useIsMounted = () => {
  const ref = useRef(true);
  useEffect(() => {
    ref.current = true;
    return () => {
      ref.current = false;
    };
  }, []);
  return ref;
};

// router.back() when there is history, otherwise go to a fallback route
export const goBackOr = (router, fallback = "/") => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
  } else {
    router.push(fallback);
  }
};
