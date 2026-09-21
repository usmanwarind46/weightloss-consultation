import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import StepsHeader from "@/layout/stepsHeader";
import PageLoader from "@/Components/PageLoader/PageLoader";
import NextButton from "@/Components/NextButton/NextButton";
import BackButton from "@/Components/BackButton/BackButton";
import { useRouter } from "next/navigation";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

export default function PatientConsent() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  const { confirmationQuestions } = useConfirmationQuestionsStore();
  const { confirmationInfo, setConfirmationInfo } = useConfirmationInfoStore();
  const [questions, setQuestions] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  // Load questions → prefer confirmationInfo
  // useEffect(() => {
  //   if (confirmationInfo && confirmationInfo.length) {
  //     console.log("✅ Loading from confirmationInfo (user answers)");
  //     setQuestions(confirmationInfo);
  //   } else if (confirmationQuestions && confirmationQuestions.length) {
  //     console.log("🟡 Loading from confirmationQuestions (API fallback)");
  //     const initialized = confirmationQuestions.map((q) => ({
  //       ...q,
  //       answer: false, // default unchecked
  //       has_check_list: true, // <-- hardcoded
  //       has_checklist: true, // <-- hardcoded
  //     }));

  //     console.log(initialized, "initialized");
  //     setQuestions(initialized);
  //   } else {
  //     console.log("❌ No questions found");
  //   }
  // }, [confirmationInfo, confirmationQuestions]);

  useEffect(() => {
    if (confirmationQuestions && confirmationQuestions.length) {
      // confirmationQuestions reliable hai — hamesha question field hota hai
      const initialized = confirmationQuestions.map((q) => {
        const savedAnswer = confirmationInfo?.find((ci) => ci.id === q.id);
        return {
          ...q,
          answer: savedAnswer?.answer ?? false,
          has_check_list: true,
          has_checklist: true,
        };
      });
      setQuestions(initialized);
    } else if (confirmationInfo && confirmationInfo.length) {
      const valid = confirmationInfo.filter((q) => q?.question);
      setQuestions(valid.map((q) => ({ ...q, answer: q.answer ?? false })));
    } else {
      console.log("❌ No questions found");
    }
  }, [confirmationInfo, confirmationQuestions]);

  console.log("questions state:", questions);

  // Prefill form fields
  useEffect(() => {
    questions.forEach((q) => {
      setValue(`responses[${q.id}].answer`, q.answer ?? false);
    });
  }, [questions]);

  const handleCheckboxChange = (id, value) => {
    const updated = questions.map((q) =>
      q.id === id
        ? { ...q, answer: value, has_check_list: true, has_checklist: true }
        : q,
    );

    setQuestions(updated);
    setValue(`responses[${id}].answer`, value);
  };

  const isNextEnabled = questions.every(
    (q) => watch(`responses[${q.id}].answer`) === true,
  );

  console.log(questions, "questions");

  const onSubmit = async () => {
    setConfirmationInfo(questions);

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/gp-detail");
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}patient-consent`} />

      <StepsHeader percentage={"85"} />

      <FormWrapper heading={"Patient Consent"}>
        <PageAnimationWrapper>
          <div className="pt-2">
            <div
              className={`relative ${
                showLoader ? "pointer-events-none cursor-not-allowed" : ""
              }`}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {questions.map((q) => {
                  const selectedAnswer = watch(`responses[${q.id}].answer`);

                  return (
                    <div
                      key={q.id}
                      className="space-y-4 border rounded-xl border-slate-200 p-5"
                    >
                      {/* Question and Checkbox */}
                      <span className="inter-semibold-font text-gray-700 sm:text-lg text-sm border-b border-slate-200 pb-2 block">
                        I confirm and understand that:
                      </span>
                      {/* Checklist (if exists) */}
                      {q.checklist && (
                        <div
                          className="list-disc list-outside sm:pl-5 text-sm text-gray-700 space-y-2 inter-reg-font [&>ul]:list-disc [&>ul]:ml-6 [&>li]:mt-0.5"
                          dangerouslySetInnerHTML={{ __html: q.checklist }}
                        ></div>
                      )}

                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id={`question-${q.id}`}
                          checked={selectedAnswer}
                          onChange={(e) =>
                            handleCheckboxChange(q.id, e.target.checked)
                          }
                          className="hidden"
                        />
                        <label
                          htmlFor={`question-${q.id}`}
                          className="group flex items-start gap-2.5 cursor-pointer"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center self-center rounded-[6px] border-2 transition-all duration-150 group-hover:border-[#4565BF]/60
                              ${selectedAnswer ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}
                          >
                            {selectedAnswer && (
                              <svg
                                width="10"
                                height="8"
                                viewBox="0 0 10 8"
                                fill="none"
                              >
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <span
                            className={`inter-medium-font text-[15px] ${selectedAnswer ? "text-[#4565BF]" : "text-gray-700"}`}
                          >
                            {q.question
                              .replace("I confirm and understand that:", "")
                              .replace("below", "above")
                              .trim()}
                          </span>
                        </label>
                      </div>
                    </div>
                  );
                })}

                {/* Show error if not accepted */}
                {!isNextEnabled && (
                  <p className="inter-reg-font border-l-2 border-amber-300 pl-3 text-sm text-amber-700 mt-2">
                    You must confirm before proceeding.
                  </p>
                )}

                <div className="space-y-3 mt-6">
                  <NextButton label="Next" disabled={!isNextEnabled} />
                  <BackButton
                    label="Back"
                    onClick={() => router.push("/medical-questions")}
                  />
                </div>
              </form>

              {showLoader && (
                <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                  <PageLoader />
                </div>
              )}
            </div>
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
