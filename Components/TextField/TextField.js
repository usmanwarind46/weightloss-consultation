import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const TextField = ({
  label,
  name,
  placeholder = "",
  type = "text",
  register,
  required = false,
  validation = {},
  errors = {},
  disabled = false,
  disablePaste = false,
  value, // <-- Controlled input
  onChange, // <-- Controlled input
  multiline = false,
  rows = 4,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const handlePaste = (e) => {
    if (disablePaste) {
      e.preventDefault();
    }
  };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="inter-medium-font relative mb-1.5 block text-[13.5px] text-slate-700">
          {label}
          {required ? (
            <span className="ms-1 text-red-500">*</span>
          ) : (
            <span className="ml-1 text-[12px] font-normal text-slate-400">(optional)</span>
          )}
        </label>
      )}


      {multiline ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          onPaste={handlePaste}
          value={value}
          onChange={onChange}
          rows={rows}
          className={`inter-reg-font w-full rounded-xl border-2 bg-white px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400
            transition-all duration-150 focus:outline-none focus:border-[#4565BF] focus:ring-[3px] focus:ring-[#4565BF]/10
            ${errors[name] ? "border-red-300" : "border-slate-200 hover:border-slate-300"}
          `}
        />
      ) : (
        <div className="relative">
          <input
            id={name}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            onPaste={handlePaste}
            {...(register
              ? register(name, {
                required: required && "This field is required",
                ...validation,
              })
              : { value, onChange })}
            className={`inter-reg-font h-[42px] w-full border-b-2 bg-transparent px-1 text-[14px] text-slate-900 placeholder:text-slate-400
  transition-all duration-150 focus:outline-none focus:border-[#4565BF]
  ${errors[name] ? "border-red-300" : "border-slate-200 hover:border-slate-300"}
  ${isPassword ? "pr-12" : ""}
`}

          />

          {isPassword && (
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
            </span>
          )}
        </div>
      )}

      {errors[name] && <p className="inter-reg-font mt-1.5 text-[12.5px] text-red-500">{errors[name]?.message || "This field is required"}</p>}
    </div>
  );
};

export default TextField;
