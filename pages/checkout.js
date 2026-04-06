import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import StepsHeader from "@/layout/stepsHeader";
import SetAPassword from "@/Components/checkout/SetAPassword";
import ShippingAddress from "@/Components/checkout/ShippingAddress";
import BillingAddress from "@/Components/checkout/BillingAddress";
import ProductConsent from "@/Components/checkout/ProductConsent";
import OrderSummary from "@/Components/checkout/OrderSummary";
import usePasswordReset from "@/store/usePasswordReset";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useCartStore from "@/store/useCartStore";
import { Inter } from "next/font/google";
import useReorder from "@/store/useReorderStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReturning from "@/store/useReturningPatient";

const inter = Inter({ subsets: ["latin"] });

const Checkout = () => {

  const [closeShipping, setCloseShipping] = useState(false);
  const [closeBilling, setCloseBilling] = useState(false);
  const { isReturningPatient } = useReturning();
  const { isPasswordReset, showResetPassword } = usePasswordReset();
  // const [isCompleted, setCompleted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const { reorder } = useReorder();
  const { billingSameAsShipping } = useShippingOrBillingStore();
  const [isConcentCheck, setIsConcentCheck] = useState(false);
  const [isShippingCheck, setIsShippingCheck] = useState(false);
  const [isBillingCheck, setIsBillingCheck] = useState(false);

  const [showThankYouModal, setShowThankYouModal] = useState(false);
  console.log(isShippingCheck, "isShippingCheck")
  const router = useRouter();

  const personalRef = useRef(null);
  const addressRef = useRef(null);
  const billingRef = useRef(null);
  const paymentRef = useRef(null);
  const summaryRef = useRef(null);
  const headingRef = useRef(null);

  const [refIndex, setRefIndex] = useState(0);

  useEffect(() => {
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getStepRefs = () => {
    return [isPasswordReset && personalRef, addressRef, !billingSameAsShipping && billingRef, paymentRef, summaryRef].filter(Boolean);
  };
  const stepRefs = getStepRefs();

  const goToNextStep = (stepIndexOverride) => {
    const currentIndex = typeof stepIndexOverride === "number" ? stepIndexOverride : refIndex;
    const nextIndex = currentIndex + 1;

    // ✅ Mark correct step as complete
    setCompletedSteps((prev) => ({
      ...prev,
      [currentIndex]: true,
    }));

    // ✅ Go to next step
    if (stepRefs[nextIndex]) {
      setRefIndex(nextIndex);
      scrollToRef(stepRefs[nextIndex]);
    }
  };

  const back = () => {
    router.push("/dosage-selection");
  };



  return (
    <>
      <MetaLayout canonical={`${meta_url}checkout/`} />

      <StepsHeader />

      <div className="bottom-[30px] fixed left-10 cursor-pointer py-2 rounded-full border-2 border-[#4565BF] sm:block hidden">
        <button
          onClick={back}
          className="text-primary reg-font px-6 cursor-pointer"
        >
          <span>Back</span>
        </button>
      </div>

      <AnimatePresence>
        {showThankYouModal && (
          <motion.div
            key="thank-you-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 flex items-center justify-center bg-opacity-40 backdrop-blur-sm z-50"
            onClick={() => setShowThankYouModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-green-600">Thank You!</h2>
              <p className="text-gray-600 text-sm">
                Your order has been successfully processed.
              </p>
              <button
                type="button"
                onClick={() => setShowThankYouModal(false)}
                className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-[#4565BF] transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 pb-10 space-y-10">
        <div ref={headingRef} className="sm:px-6 px-0 pt-10 text-center">
          <h1 className="text-2xl niba-reg-font heading mb-2 text-gray-900">
            {reorder ? (
              <>
                Confirm your treatment
                <br />
                re-order
              </>
            ) : (
              "Checkout to kick-start your weight loss journey"
            )}
          </h1>
          <p className="text-sm reg-font paragraph mb-6">
            {reorder
              ? "You're almost done. Complete your checkout to continue your weight loss journey without interruption."
              : "Complete your details below to secure your consultation. If you decide not to proceed after your consult for any reason, you will be fully refunded."}
          </p>
        </div>

        {/* Sections */}
        {showResetPassword && !isReturningPatient && (
          <div ref={personalRef}>
            <SetAPassword onComplete={() => goToNextStep(0)} isCompleted={completedSteps[0] || !isPasswordReset} />
          </div>
        )}

        <div ref={addressRef}>
          <ShippingAddress
            onComplete={() => goToNextStep(1)}
            isCompleted={completedSteps[1] || closeShipping}
            setIsShippingCheck={setIsShippingCheck}
            setIsBillingCheck={setIsBillingCheck}
            setCloseShipping={setCloseShipping}
          />
        </div>

        {!billingSameAsShipping && (
          <div ref={billingRef}>
            <BillingAddress
              onComplete={() => goToNextStep(2)}
              isCompleted={completedSteps[2] || closeBilling}
              setCloseBilling={setCloseBilling}
              setIsBillingCheck={setIsBillingCheck} />
          </div>
        )}

        <div ref={paymentRef}>
          <ProductConsent
            onComplete={() => goToNextStep(billingSameAsShipping ? 2 : 3)}
            setIsConcentCheck={setIsConcentCheck}
            isCompleted={setIsConcentCheck}
          />
        </div>

        <div ref={summaryRef}>
          <OrderSummary
            onComplete={isConcentCheck}
            isConcentCheck={isConcentCheck}
            isShippingCheck={isShippingCheck}
            isBillingCheck={isBillingCheck}
          />
        </div>
      </div>
    </>
  );
};

export default Checkout;
