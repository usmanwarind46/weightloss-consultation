import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormControl, MenuItem, FormHelperText, Select } from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import MuiDatePickerField from "@/Components/DatePicker/DatePicker";
import ProfileTextField from "@/Components/ProfileTextField/ProfileTextField";
import { getProfileData, sendProfileData } from "@/api/myProfileApi";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { parse } from "date-fns"; // 👈 for DOB parsing
import NextButton from "@/Components/NextButton/NextButton";

const MyProfile = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      firstname: "",
      lastname: "",
      phone: "",
      gender: "",
      dob: null,
    },
  });

  // GET Profile
  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: (res) => {
      console.log(res, "res res res");
      const user = res?.data?.profile?.user;
      if (user) {
        console.log(user);

        setValue("firstname", user.fname || "");
        setValue("lastname", user.lname || "");
        setValue("phone", user.phone || "");
        setValue("gender", user.gender || "");
        setUserEmail(user?.email);

        if (user.dob) {
          const parsedDate = parse(user.dob, "dd-MM-yyyy", new Date());
          setValue("dob", parsedDate);
        }
        trigger();
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    },
  });

  useEffect(() => {
    getProfileDataMutation.mutate();
  }, []);

  // Send User Data Mutation
  const sendProfileDataMutation = useMutation(sendProfileData, {
    onSuccess: (data) => {
      setLoading(false);
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong.");
      setLoading(false);
    },
  });

  const onSubmit = (data) => {
    setLoading(true);
    console.log("Submitting data:", data);
    sendProfileDataMutation.mutate(data);
  };

  return (
    <div className="p-6 sm:bg-[#F9FAFB] sm:min-h-screen sm:rounded-md sm:shadow-md my-5 sm:me-5">
      <div className="mb-8">
        <h1 className="md:text-3xl text-lg mb-2 niba-bold-font heading">Profile Information</h1>
        <p className="reg-font paragraph  text-left text-sm xl:w-3/4 mt-2">Update your account's profile information and email address.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* First & Last Name */}
        <div className="grid sm:grid-cols-2 gap-4">
          <ProfileTextField required label="First Name" name="firstname" placeholder="First Name" register={register} errors={errors} />

          <ProfileTextField required label="Last Name" name="lastname" placeholder="Last Name" register={register} errors={errors} />
        </div>

        {/* Gender & DOB */}
        <div className="grid sm:grid-cols-2 gap-4 items-start">
          <div>
            <label className="bold-font paragraph mb-2 relative">
              Gender
              <span className="text-red-500 absolute m-1 niba-semibold-font"> *</span>
            </label>
            <FormControl fullWidth error={!!errors.gender}>
              <Controller
                name="gender"
                control={control}
                rules={{ required: "Gender is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    displayEmpty
                    size="small"
                    fullWidth
                    className="reg-font"
                    sx={{
                      height: 56,
                      fontSize: "14px",
                      color: "black",
                      backgroundColor: "transparent",
                    }}
                  >
                    <MenuItem value="">Select gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                )}
              />
              {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
            </FormControl>
          </div>

          <div>
            <label className="bold-font paragraph mb-2 relative">
              Date of Birth
              <span className="text-red-500 absolute  m-1 niba-semibold-font"> *</span>
            </label>
            <MuiDatePickerField
              name="dob"
              //   label="Date of Birth"
              control={control}
              errors={errors}
              rules={{
                required: "Date of birth is required",
              }}
            />
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phoneNumber" className="bold-font paragraph mb-2 relative">
              Phone Number <span className="text-red-500 absolute  m-1 niba-semibold-font"> *</span>
            </label>
            <Controller
              name="phone"
              control={control}
              rules={{ required: "Phone number is required" }}
              render={({ field }) => (
                <div
                  className={`w-full text-black px-3 py-3 border rounded-sm placeholder-gray-400 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-[#4565BF] ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-400"
                  }`}
                >
                  <PhoneInput
                    {...field}
                    country="gb"
                    placeholder="Enter your number"
                    inputStyle={{ border: "none", width: "100%", background: "transparent" }}
                    className="reg-font"
                  />
                </div>
              )}
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label className="bold-font paragraph mb-2">Email Address</label>
            <div className=" border border-gray-400 rounded-sm px-3 flex items-center text-sm text-black cursor-not-allowed h-15">
              <p className="reg-font">{userEmail}</p>
            </div>
            <p className="reg-font text-xs mt-2 text-gray-700">(This email is associated with your account and cannot be changed)</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-4 sm:max-w-20">
          <div className="text-center my-3">
            <NextButton type="submit" disabled={!isValid || isLoading} label={isLoading ? "Saving..." : "Save"} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default MyProfile;
