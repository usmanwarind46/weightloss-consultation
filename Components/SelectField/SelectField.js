import React from "react";
import { FormControl, Select, MenuItem, FormHelperText, OutlinedInput } from "@mui/material";

const MUISelectField = ({ label, name, value, onChange, options = [], error = "", placeholder = "Select an option", required = false }) => {
  return (
    <div className="mb-4 relative">
      {label && (
        <label htmlFor={name} className="bold-font paragraph mb-2">
          {label}
          {required ? (
            <span className="text-red-500 absolute top-1 ms-1 niba-semibold-font"> *</span>
          ) : (
            <span className="text-gray-500 text-sm font-normal ml-1">(optional)</span>
          )}
        </label>
      )}

      <FormControl fullWidth error={!!error}>
        <Select
          id={name}
          value={value}
          onChange={onChange}
          displayEmpty
          className="reg-font text-2xl"
          input={<OutlinedInput />}
          sx={{
            backgroundColor: "#fff",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "#f44336" : "#000",
              borderWidth: "1px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "#f44336" : "#000",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#4565BF", // violet-700
              borderWidth: "2px",
            },
            ".MuiSelect-select": {
              padding: "16px 12px",
              color: "#000",
            },
          }}
        >
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
          {options.map((option, idx) => (
            <MenuItem key={idx} value={option.value} className="reg-font text-lg">
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
