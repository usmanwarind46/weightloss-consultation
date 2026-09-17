import React from "react";
import { Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brandTheme from "@/config/muiTheme";

const MuiDatePickerField = ({ name, label, control, rules, required = true, errors = {} }) => {
  const currentYear = new Date().getFullYear();

  const validateDate = (value) => {
    if (!value) return "Date is required";
    const year = new Date(value).getFullYear();
    if (year > currentYear) return "Year cannot be in the future";
    return true;
  };

  return (
    <ThemeProvider theme={brandTheme}>
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
              className="inter-reg-font"
              slotProps={{
                popper: {
                  sx: { zIndex: 10000 },
                },
                dialog: {
                  sx: { zIndex: 10000 },
                },
                textField: {
                  fullWidth: true,
                  error: !!errors[name],
                  helperText: errors[name]?.message,
                  sx: {
                    "& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#fff",
                      fontFamily: "var(--inter-reg)",
                      fontSize: "14px",
                      transition: "box-shadow 180ms ease",
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 3px rgba(69, 101, 191, 0.10)",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0",
                      borderWidth: "2px",
                      borderRadius: "0.75rem",
                      transition: "border-color 180ms ease",
                    },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-root:hover .MuiPickersOutlinedInput-notchedOutline": {
                      borderColor: "#4565BF !important",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline": {
                      borderColor: "#4565BF !important",
                      borderWidth: "2px",
                    },
                    "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-root.Mui-error .MuiPickersOutlinedInput-notchedOutline": {
                      borderColor: "#fca5a5",
                      borderWidth: "2px",
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: "var(--inter-medium)",
                      fontSize: "14px",
                      color: "#475569 !important",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#4565BF !important",
                    },
                    "& .MuiIconButton-root": {
                      color: "#4565BF !important",
                    },
                  },
                },
                desktopPaper: {
                  sx: {
                    borderRadius: "16px",
                    "& .MuiPickersDay-root.Mui-selected": {
                      backgroundColor: "#4565BF",
                      "&:hover, &:focus": { backgroundColor: "#3550a0" },
                    },
                  },
                },
                mobilePaper: {
                  sx: {
                    borderRadius: "16px",
                    "& .MuiPickersDay-root.Mui-selected": {
                      backgroundColor: "#4565BF",
                      "&:hover, &:focus": { backgroundColor: "#3550a0" },
                    },
                  },
                },
              }}
            />
          )}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default MuiDatePickerField;
