import "@/styles/globals.css";
import "@/styles/fonts.css";
import "@/styles/paymentpage.css";
import queryClient from "@/utils/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast"; // <-- ✅ YEH IMPORT KARO
import RouteGuard from "@/utils/RouteGuard";

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouteGuard>

        <Component {...pageProps} />
      </RouteGuard>

      {/* ✅ Toaster yehin lagana hai taake saari app me kaam kare */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerClassName="reg-font"
      />
    </QueryClientProvider>
  );
}
