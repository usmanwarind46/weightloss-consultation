import React from "react";
import { FormControl, Select, MenuItem, FormHelperText, OutlinedInput } from "@mui/material";

const MUISelectField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  options = [],
  error = "",
  placeholder = "Select an option",
  required = false,
  variant = "underline",
  placeholderDisabled = true,
}) => {
  const isUnderline = variant === "underline";

  return (
    <div className="mb-4 relative">
      {label && (
        <label
          htmlFor={name}
          className={
            isUnderline
              ? "inter-medium-font mb-1.5 flex items-center gap-1 text-[13px] text-slate-700"
              : "inter-medium-font mb-2 block text-[13.5px] text-slate-700"
          }
        >
          {label}
          {required ? (
            <span className={isUnderline ? "text-[14px] leading-none text-red-400" : "ms-1 text-red-500"}> *</span>
          ) : (
            <span className={isUnderline ? "inter-reg-font text-[12px] text-slate-400" : "ml-1 text-[12px] font-normal text-slate-400"}>
              (optional)
            </span>
          )}
        </label>
      )}

      <FormControl fullWidth error={!!error}>
        <Select
          id={name}
          name={name}
          onBlur={onBlur}
          inputRef={inputRef}
          value={value}
          onChange={onChange}
          displayEmpty
          MenuProps={{
            slotProps: {
              paper: {
                sx: {
                  maxHeight: "min(360px, calc(100dvh - 32px))",
                  maxWidth: "calc(100vw - 32px)",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  "& .MuiMenuItem-root": {
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    padding: "10px 12px",
                    lineHeight: 1.5,
                    fontFamily: "var(--inter-reg)",
                    fontSize: "14px",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "rgba(69,101,191,0.08) !important",
                  },
                },
              },
            },
          }}
          className={isUnderline ? "inter-reg-font" : "inter-reg-font"}
          input={<OutlinedInput />}
          sx={{
            backgroundColor: isUnderline ? "transparent" : "#ffffff",
            "& .MuiOutlinedInput-notchedOutline": {
              border: isUnderline ? "0" : undefined,
              borderBottom: isUnderline ? `2px solid ${error ? "#fca5a5" : "#e2e8f0"}` : undefined,
              borderColor: isUnderline ? undefined : error ? "#fca5a5" : "#e2e8f0",
              borderWidth: isUnderline ? undefined : "2px",
              borderRadius: isUnderline ? "0" : "12px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isUnderline ? undefined : error ? "#fca5a5" : "#cbd5e1",
              borderBottomColor: isUnderline ? (error ? "#f87171" : "#cbd5e1") : undefined,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: isUnderline ? undefined : "#4565BF",
              borderBottomColor: isUnderline ? "#4565BF" : undefined,
              borderWidth: isUnderline ? undefined : "2px",
            },
            ".MuiSelect-select": {
              padding: isUnderline ? "12px 28px 12px 0" : "13px 14px",
              color: "#0f172a",
              fontFamily: "var(--inter-reg)",
              fontSize: isUnderline ? "14px" : "14px",
              minHeight: isUnderline ? undefined : "22px",
            },
          }}
        >
          <MenuItem value="" disabled={placeholderDisabled} sx={{ fontFamily: "var(--inter-reg)", fontSize: "14px" }}>
            {placeholder}
          </MenuItem>
          {options.map((option, idx) => (
            <MenuItem key={idx} value={option.value} sx={{ fontFamily: "var(--inter-reg)", fontSize: "14px" }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </div>
  );
};

export default MUISelectField;
