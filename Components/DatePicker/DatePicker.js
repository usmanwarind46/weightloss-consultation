import React from "react";
import { Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const MuiDatePickerField = ({ name, label, control, rules, required = true, errors = {} }) => {
  const currentYear = new Date().getFullYear();

  const validateDate = (value) => {
    if (!value) return "Date is required";
    const year = new Date(value).getFullYear();
    if (year > currentYear) return "Year cannot be in the future";
    return true;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <DatePicker
            label={label}
            value={field.value || null}
            onChange={(date) => field.onChange(date)}
            maxDate={new Date()}
            format="dd/MM/yyyy"
            className="reg-font"
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors[name],
                helperText: errors[name]?.message,
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default MuiDatePickerField;
