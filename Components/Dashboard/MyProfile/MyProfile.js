import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import MUISelectField from "@/Components/SelectField/SelectField";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import MuiDatePickerField from "@/Components/DatePicker/DatePicker";
import ProfileTextField from "@/Components/ProfileTextField/ProfileTextField";
import { getProfileData, sendProfileData } from "@/api/myProfileApi";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { parse } from "date-fns";
import NextButton from "@/Components/NextButton/NextButton";
import { PageHeader } from "@/Components/Dashboard/MyAccount/MyAccount";
import { Mail, User } from "lucide-react";

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

  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: (res) => {
      const user = res?.data?.profile?.user;
      if (user) {
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

  const sendProfileDataMutation = useMutation(sendProfileData, {
    onSuccess: () => {
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
    sendProfileDataMutation.mutate(data);
  };

  return (
    <main className="inter-reg-font min-w-0 flex-1 bg-[#E8EDFA]">
      <div className="mx-auto flex w-full flex-col gap-6 p-4 sm:p-5 lg:p-6 2xl:p-8">

        <PageHeader
          label="Profile"
          title="Profile Information"
          subtitle="Update your account's profile information and email address."
        />

        <section className="overflow-hidden rounded-[22px] border border-[#4565BF]/10 bg-white p-4 sm:p-5 lg:p-6">
          <div className="flex items-start gap-3.5 border-b border-[#4565BF]/[0.07] pb-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#4565BF]/[0.08] text-[#4565BF]">
              <User size={19} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h2 className="inter-bold-font text-[20px] leading-7 text-slate-950 sm:text-[23px]">
                Personal details
              </h2>
              <p className="inter-reg-font mt-1.5 max-w-2xl text-[12.5px] leading-[1.7] text-slate-500 sm:text-[13px]">
                Keep your personal details up to date for a seamless experience.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="profile-form mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ProfileTextField
                required
                label="First Name"
                name="firstname"
                placeholder="Enter your first name"
                register={register}
                errors={errors}
              />

              <ProfileTextField
                required
                label="Last Name"
                name="lastname"
                placeholder="Enter your last name"
                register={register}
                errors={errors}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 items-start">
              <div>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: "Gender is required" }}
                  render={({ field }) => (
                    <MUISelectField
                      label="Gender"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      required
                      placeholder="Select gender"
                      placeholderDisabled={false}
                      error={errors.gender?.message}
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                      ]}
                    />
                  )}
                />
              </div>

              <div>
                <label className="inter-medium-font text-[13px] text-slate-700 mb-2 relative block">
                  Date of Birth
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <MuiDatePickerField
                  name="dob"
                  control={control}
                  errors={errors}
                  rules={{
                    required: "Date of birth is required",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="phoneNumber" className="inter-medium-font text-[13px] text-slate-700 mb-2 relative block">
                  Phone Number <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: "Phone number is required" }}
                  render={({ field }) => (
                    <div
                      className={`w-full text-black px-3 py-3 border rounded-[14px] placeholder-gray-400 focus-within:ring-1 focus-within:ring-[#4565BF] focus-within:border-[#4565BF] transition-colors ${
                        errors.phoneNumber ? "border-red-500" : "border-[#4565BF]/[0.13]"
                      }`}
                    >
                      <PhoneInput
                        {...field}
                        country="gb"
                        placeholder="e.g. 7700 900123"
                        inputStyle={{ border: "none", width: "100%", background: "transparent" }}
                        className="inter-reg-font"
                      />
                    </div>
                  )}
                />
                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
              </div>

              <div>
                <label className="inter-medium-font text-[13px] text-slate-700 mb-2 block">Email Address</label>
                <div className="flex items-center gap-3 rounded-[14px] border border-[#4565BF]/[0.13] bg-slate-50/70 px-4 py-3.5 text-sm text-slate-700 cursor-not-allowed">
                  <Mail size={16} strokeWidth={2} className="shrink-0 text-slate-400" />
                  <p className="inter-reg-font truncate text-[13px]">{userEmail}</p>
                </div>
                <p className="inter-reg-font text-[11px] mt-2 text-slate-500">
                  This email is associated with your account and cannot be changed.
                </p>
              </div>
            </div>

            <div className="flex justify-start border-t border-[#4565BF]/[0.07] pt-5">
              <div className="profile-save-button w-full sm:w-auto sm:min-w-[180px]">
                <NextButton
                  type="submit"
                  disabled={!isValid || isLoading}
                  label={isLoading ? "Saving..." : "Save changes"}
                />
              </div>
            </div>
          </form>

          <style jsx global>{`
            .profile-form .MuiFormControl-root { width: 100%; }
            .profile-form .MuiInputLabel-root { font-family: var(--inter-medium) !important; font-size: 13px !important; color: #64748b; }
            .profile-form .MuiInputBase-root { min-height: 52px; border-radius: 14px !important; background: #ffffff; font-family: var(--inter-reg) !important; font-size: 13px !important; }
            .profile-form .MuiOutlinedInput-notchedOutline { border-color: rgba(69, 101, 191, 0.13) !important; }
            .profile-form .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline { border-color: rgba(0,0,0,0.18) !important; }
            .profile-form .Mui-focused .MuiOutlinedInput-notchedOutline { border-color: #4565BF !important; border-width: 1px !important; }
            .profile-form input { font-family: var(--inter-reg) !important; font-size: 13px !important; color: #0f172a !important; }
            .profile-form label { font-family: var(--inter-medium) !important; }
            .profile-save-button button {
              min-height: 46px !important; width: 100% !important; border-radius: 13px !important;
              border-color: #4565BF !important; background: #4565BF !important;
              padding: 12px 24px !important; font-family: var(--inter-medium) !important;
              font-size: 12px !important; color: #ffffff !important; transition: all 0.15s ease !important;
            }
            .profile-save-button button:not(:disabled):hover { background: #3550a0 !important; }
            .profile-save-button button:disabled {
              cursor: not-allowed !important; border-color: #cbd5e1 !important;
              background: #cbd5e1 !important; box-shadow: none !important;
            }
          `}</style>
        </section>
      </div>
    </main>
  );
};

export default MyProfile;
