import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";
import NextButton from "@/Components/NextButton/NextButton";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

const MedicalQuestions = () => {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  // ✅ FROM 2 STORES
  const { medicalQuestions } = useMedicalQuestionsStore();
  const { medicalInfo, setMedicalInfo } = useMedicalInfoStore();
  const [questions, setQuestions] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid },
  } = useForm({ mode: "onChange" });

  // Load questions → prefer medicalInfo first
  useEffect(() => {
    if (medicalInfo && medicalInfo.length) {
      console.log("✅ Loading questions from medicalInfo (saved user answers)");
      setQuestions(medicalInfo);
    } else if (medicalQuestions && medicalQuestions.length) {
      console.log(
        "🟡 Loading questions from medicalQuestions (API or fallback)",
      );
      const initialized = medicalQuestions.map((q) => ({
        ...q,
        subfield_response: "",
      }));
      setQuestions(initialized);
    } else {
      console.log("❌ No questions found");
    }
  }, [medicalQuestions, medicalInfo]);

  // Prefill form fields
  useEffect(() => {
    questions.forEach((q) => {
      if (q.answer) {
        setValue(`responses[${q.id}].answer`, q.answer);
      }
      if (q.subfield_response) {
        setValue(`responses[${q.id}].subfield_response`, q.subfield_response);
      }
    });
  }, [questions]);

  const handleAnswerChange = (id, value) => {
    const updated = questions.map((q) =>
      q.id === id
        ? {
            ...q,
            answer: value,
            subfield_response: value === "no" ? "" : q.subfield_response,
          }
        : q,
    );
    setQuestions(updated);
    setValue(`responses[${id}].answer`, value);
    if (value === "no") {
      setValue(`responses[${id}].subfield_response`, "");
    }
  };

  const handleSubFieldChange = (id, value) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, subfield_response: value } : q,
    );
    setQuestions(updated);
    setValue(`responses[${id}].subfield_response`, value);
  };

  const isNextEnabled = questions.every((q) => {
    const answer = watch(`responses[${q.id}].answer`);
    const subfield = watch(`responses[${q.id}].subfield_response`);

    if (answer === "no") return true;
    if (answer === "yes" && q.has_sub_field)
      return subfield && subfield.trim() !== "";
    if (answer === "yes" && !q.has_sub_field && q.validation_error_msg)
      return false;

    return false;
  });

  const onSubmit = async () => {
    // ✅ Save questions + user answers into medicalInfo
    setMedicalInfo(questions);

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/patient-consent");
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}medical-questions`} />

      <StepsHeader percentage={"80"} />
      <FormWrapper heading={"Medical Questions"}>
        <PageAnimationWrapper>
          <div
            className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {questions.map((q) => {
                const selectedAnswer = watch(`responses[${q.id}].answer`);
                const subfieldValue = watch(
                  `responses[${q.id}].subfield_response`,
                );
                const showValidationError =
                  selectedAnswer === "yes" &&
                  !q.has_sub_field &&
                  q.validation_error_msg;

                return (
                  <div
                    key={q?.id}
                    className={`rounded-xl border p-4 sm:p-5 ${showValidationError ? "border-red-200 bg-red-50/30" : "border-slate-100 bg-[#FBFBFD]"}`}
                  >
                    <div
                      className="inter-reg-font mb-4 text-[14px] leading-relaxed text-slate-800 [&>ul]:list-disc [&>ul]:ml-6 [&>li]:mt-0.5"
                      dangerouslySetInnerHTML={{ __html: q.question }}
                    ></div>

                    <div className="flex gap-2">
                      {q?.options?.map((option) => {
                        const isSelected = selectedAnswer === option;

                        return (
                          <label
                            key={option}
                            className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-3 transition-all duration-150 select-none sm:gap-2.5 sm:px-4
                              ${isSelected ? "border-[#4565BF] bg-[#4565BF]/[0.05]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                          >
                            <Controller
                              name={`responses[${q.id}].answer`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="radio"
                                  {...field}
                                  value={option}
                                  checked={field.value === option}
                                  onChange={(e) =>
                                    handleAnswerChange(q.id, e.target.value)
                                  }
                                  className="hidden"
                                />
                              )}
                            />
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150
                                ${isSelected ? "border-[#4565BF] bg-[#4565BF]" : "border-slate-300 bg-white"}`}
                            >
                              {isSelected && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </div>
                            <span
                              className={`inter-medium-font text-[14px] capitalize ${isSelected ? "text-[#4565BF]" : "text-slate-700"}`}
                            >
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {showValidationError && (
                      <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                        <p className="inter-reg-font text-[12px] text-red-600">
                          {q.validation_error_msg}
                        </p>
                      </div>
                    )}

                    {q.has_sub_field && selectedAnswer === "yes" && (
                      <textarea
                        className="inter-reg-font mt-4 min-h-[104px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] leading-relaxed text-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-all duration-200 placeholder:text-slate-400 focus:border-[#4565BF]/40 focus:outline-none focus:ring-[3px] focus:ring-[#4565BF]/10"
                        placeholder={q.sub_field_prompt}
                        value={subfieldValue}
                        onChange={(e) =>
                          handleSubFieldChange(q.id, e.target.value)
                        }
                      />
                    )}
                  </div>
                );
              })}

              <div className="mt-6 flex flex-col gap-3">
                <NextButton disabled={!isNextEnabled} label="Next" />
                <BackButton
                  label="Back"
                  onClick={() => router.push("/bmi-detail")}
                />
              </div>
            </form>

            {showLoader && (
              <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                <PageLoader />
              </div>
            )}
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
};

export default MedicalQuestions;
