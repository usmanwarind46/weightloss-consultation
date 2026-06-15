import "@/styles/globals.css";
import "@/styles/fonts.css";
import "@/styles/paymentpage.css";
import queryClient from "@/utils/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import RouteGuard from "@/utils/RouteGuard";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Script from "next/script";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      if (window.fbq) {
        window.fbq("track", "PageView");
      }
      if (window._cl) {
        window._cl.pageview();
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <QueryClientProvider client={queryClient}>
      <Script id="customerlabs-tag" strategy="afterInteractive">
        {`!function(t,e,r,c,a,n,s){t.ClAnalyticsObject=a,t[a]=t[a]||[],t[a].methods=["trackSubmit","trackClick","pageview","identify","track","trackConsent"],t[a].factory=function(e){return function(){var r=Array.prototype.slice.call(arguments);return r.unshift(e),t[a].push(r),t[a]}};for(var i=0;i<t[a].methods.length;i++){var o=t[a].methods[i];t[a][o]=t[a].factory(o)};n=e.createElement(r),s=e.getElementsByTagName(r)[0],n.async=1,n.crossOrigin="anonymous",n.src=c,s.parentNode.insertBefore(n,s)}(window,document,"script","https://cdn.js.customerlabs.co/cl8602w8wtgm8u.js","_cl");_cl.SNIPPET_VERSION="2.0.0"`}
      </Script>

      <RouteGuard>
        <Component {...pageProps} />
      </RouteGuard>

      <Toaster
        position="top-center"
        reverseOrder={false}
        containerClassName="reg-font"
      />
    </QueryClientProvider>
  );
}
