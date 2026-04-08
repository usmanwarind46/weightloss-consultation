import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import StepsHeader from "@/layout/stepsHeader";
import NextButton from "@/Components/NextButton/NextButton";
import Image from "next/image";
import useProductId from "@/store/useProductIdStore";
import { useSearchParams } from "next/navigation";
import useReorder from "@/store/useReorderStore";
import useAuthStore from "@/store/authStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useReorderButtonStore from "@/store/useReorderButton";

export default function Index() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  //Search Param to get product ID
  const searchParams = useSearchParams();

  //From zustand Store
  const { productId, setProductId } = useProductId();
  const { reorder, setReorder } = useReorder();
  const { token } = useAuthStore();
  const { authUserDetail } = useAuthUserDetailStore();

  const { setIsFromReorder } = useReorderButtonStore();
  useEffect(() => {
    const param = searchParams.get("product_id");
    if (param) {
      const parsedId = parseInt(param, 10);
      if (!isNaN(parsedId)) {
        setProductId(parsedId); // ✅ store in Zustand + localStorage
      }
    }
  }, [searchParams, setProductId]);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  const onSubmit = async (data, e) => {
    const action = e.nativeEvent.submitter.value;

    if (action === "Accept and re-order") {
      if (token && authUserDetail?.isReturning) {
        router.push("/steps-information");
        setIsFromReorder(true);
      } else {
        router.push("/dashboard");
      }
    } else {
      setReorder(false);
      setIsFromReorder(false);
      router.push("/acknowledgment");
    }

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  console.log("Comming from Vercel Consultation");

  return (
    <>
      <MetaLayout canonical={`${meta_url}`} />

      <StepsHeader />

      <section className="my-16 mx-6 sm:mx-0">
        <div className="bg-white max-w-xl mx-auto rounded-3xl p-10 shadow-lg border border-gray-100 relative">
          {/* Icon */}
          <div className="flex justify-center">
            <Image
              src="images/intro.svg"
              alt="Online Weight Loss Icon"
              width={200}
              height={50}
              className="rounded-lg"
            />
          </div>

          {/* Heading */}
          <h2 className=" bold-font paragraph text-xl text-start mb-3 p-0">
            Let's get you started on your weight loss journey.
          </h2>

          <p className="reg-font text-start text-sm paragraph mb-8">
            We’ll now ask a few questions about you and your health.
          </p>

          {/* Good to know */}
          <div className="mb-10">
            <p className="bold-font paragraph mb-4">Good to know:</p>
            <ul className="reg-font list-disc list-inside space-y-3 paragraph text-[15px] leading-relaxed">
              <li>
                Your consultation will take about five minutes to complete.
              </li>
              <li>All your responses are confidential and securely stored.</li>
              <li>
                We’ll show suitable treatment options based on the information
                you provide.
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <NextButton
              type="submit"
              label="New Patient"
              disabled={!isValid}
              subLabel="Click here to start online consultation"
            />

            <button
              type="submit"
              name="action"
              value="Accept and re-order"
              disabled={!isValid}
              className=" w-full px-12   bold-font text-sm border-in duration-150 ease-in-out hover:bg-primary  py-3 rounded-md bold-font  transition my-3 border-2 text-primary hover:text-white border-[#4565BF] cursor-pointer"
            >
              Returning Patient
              <p className="reg-font paragraph !text-[13px] text-primary">
                Click here - your previous details will be saved
              </p>
            </button>
          </form>

          {showLoader && (
            <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
              <PageLoader />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
