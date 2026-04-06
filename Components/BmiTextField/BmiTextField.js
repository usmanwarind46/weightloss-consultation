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
        <label htmlFor={name} className="bold-font paragraph mb-2 relative">
          {label}
          {required ? (
            <span className="text-red-500 absolute m-1 niba-semibold-font"> *</span>
          ) : (
            <span className="text-gray-500 text-sm font-normal ml-1">(optional)</span>
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
        className={`reg-font w-full text-black px-3 py-4 border bg-white placeholder:text-gray-400 
          focus:outline-none focus:ring-1 focus:ring-[#1F9E8C] focus:border-[#1F9E8C] 
          border-[#CBCBCB66] ${errors[name] ? "border-red-500" : ""} 
          ${(readOnly || disabled) ? "opacity-50  cursor-not-allowed" : ""}
        `}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]?.message || "This field is required"}
        </p>
      )}
    </div>
  );
};

export default BmiTextField;