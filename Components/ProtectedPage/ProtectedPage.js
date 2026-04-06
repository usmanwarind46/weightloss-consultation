import { useRouter } from "next/router";
import { useEffect } from "react";
import useAuthStore from "@/store/authStore";

export default function ProtectedPage({ children }) {
  const { token, hasHydrated, isImpersonationLogout, setIsImpersonationLogout } = useAuthStore();

  const router = useRouter();

  console.log("token", token);
  console.log("hasHydrated", hasHydrated);

  useEffect(() => {
    if (isImpersonationLogout) {
      setIsImpersonationLogout(false); // reset flag after use
      return; // Skip login redirect
    }

    if (hasHydrated && !token) {
      router.replace("/login");
    }
  }, [hasHydrated, token]);

  if (!hasHydrated || !token) return null;

  return children;
}
