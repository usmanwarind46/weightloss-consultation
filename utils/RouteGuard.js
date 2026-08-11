import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { loginRoute, publicRoutes } from "./routes";
import useAuthStore from "@/store/authStore";
import PageLoader from "@/Components/PageLoader/PageLoader";

export default function RouteGuard({ children }) {
  const router = useRouter();
  const { token, review } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = router.pathname;
    const isPublic = publicRoutes.includes(path);
    const isLogin = path === loginRoute;

    if (!isPublic && !token) {
      router.push("/login/");
    } else if (isLogin && token && review) {
      router.push("/review");
    } else if (isLogin && token) {
      router.push("/dashboard");
    } else {
      setLoading(false);
    }
  }, [router.pathname, token, loginRoute]);

  if (loading)
    return (
      <>
        {" "}
        <PageLoader />
      </>
    );

  return children;

  // //  else if (isPublic && token) {
  //     router.push("/dashboard/");
  // }
}
