import React from "react";

const GenderSelector = ({ register, selected, setValue, errors }) => {
  const options = ["Female", "Male"];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-green-900 mb-1">
          What sex were you assigned at birth?
        </h2>
        <p className="text-sm text-green-900 flex items-center justify-center gap-2">
          <span className="text-lg">❓</span> Why do we ask about your sex at birth?
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => setValue("gender", option, { shouldValidate: true })}
            className={`w-full border text-center py-3 rounded-md reg-font transition-all duration-150
              ${
                selected === option
                  ? "border-green-800 bg-green-700 text-white"
                  : "border-green-700 text-green-800 hover:bg-[#E9F6FA]"
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Hidden input for react-hook-form */}
      <input type="hidden" {...register("gender", { required: true })} />

      {errors.gender && (
        <p className="text-red-500 text-sm text-center mt-1">Please select a gender</p>
      )}
    </div>
  );
};

export default GenderSelector;
