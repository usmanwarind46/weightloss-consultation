const BmiTextField = ({
  required,
  label,
  name,
  type = "text",
  fieldProps = {},
  errors = {},
  onBlur,
  readOnly = false,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="inter-medium-font relative mb-2 block text-[13.5px] text-slate-700">
          {label}
          {required ? (
            <span className="ms-1 text-red-500"> *</span>
          ) : (
            <span className="ml-1 text-[12px] font-normal text-slate-400">(optional)</span>
          )}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        readOnly={readOnly}
        disabled={disabled}
        {...fieldProps}
        onBlur={onBlur}
        className={`inter-reg-font h-[42px] w-full border-b-2 bg-transparent px-1 text-[14px] text-slate-900 placeholder:text-slate-400
          transition-all duration-150 focus:outline-none focus:border-[#4565BF]
          ${errors[name] ? "border-red-300" : "border-slate-200 hover:border-slate-300"}
          ${(readOnly || disabled) ? "cursor-not-allowed opacity-50" : ""}
        `}
      />
      {errors[name] && (
        <p className="inter-reg-font mt-1.5 text-[12.5px] text-red-500">
          {errors[name]?.message || "This field is required"}
        </p>
      )}
    </div>
  );
};

export default BmiTextField;