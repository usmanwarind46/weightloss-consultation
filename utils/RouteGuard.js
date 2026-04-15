import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { loginRoute, publicRoutes } from "./routes";
import useAuthStore from "@/store/authStore";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { BASE_PATH } from "@/library/basePath";

export default function RouteGuard({ children }) {
  const router = useRouter();
  const { token, review } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = router.asPath;

    const isPublic = publicRoutes.some((route) => path.includes(route));

    const isLogin = path.includes(loginRoute);

    if (!isPublic && !token) {
      router.push(`${BASE_PATH}/login`);
    } else if (isLogin && token && review) {
      router.push(`${BASE_PATH}/review`);
    } else if (isLogin && token && review == null) {
      router.push(`${BASE_PATH}/dashboard`);
    } else {
      setLoading(false);
    }
  }, [router.asPath, token]);

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
