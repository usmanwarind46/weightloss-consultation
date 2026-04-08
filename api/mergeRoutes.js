// /api/getVariationsApi.js
import Fetcher from "@/library/Fetcher";

export const UploadPhotoLogs = async (data) => {
  return Fetcher.post(`FrontendLogs`, data);
};

export const UpdatePassword = async (data) => {
  return Fetcher.post("password/UpdatePassword", data);
};

export const TrackReview = async (data) => {
  return Fetcher.post(`TrackReview`, data);
};

export const sendStepData = async (data) => {
  return Fetcher.post(`order/consultationMayfair`, data);
};
export const ImageUplaodApi = async (data) => {
  return Fetcher.post("BMIImagesForOrderProcess", data);
};

export const getVariationsApi = async ({ data, id }) => {
  return Fetcher.get(`products/GetVaritions/${id}`, data);
};

export const GetProductsApi = async ({ data }) => {
  return Fetcher.get(`products/GetProducts`, data);
};

export const abandonCart = async (data) => {
  return Fetcher.post("AbandonedCart", data);
};

export const GetBmiJourney = async (user_id) => {
  return Fetcher.get(`/patient-bmi-journey/${user_id}`);
};

export const GetImageIsUplaod = async ({ data }) => {
  return Fetcher.get(`getBMIImagesForOrderProcess`, data);
};

export const GetUserOrderApi = async (data) => {
  return Fetcher.get("/GetUserOrder");
};

export const getNotified = async (data) => {
  return Fetcher.post("GetNotified", data);
};

export const forgotPasswordLink = async ({
  email,
  passwordlink,
  clinic_id,
}) => {
  return Fetcher.post("password/ForgotPasswordLink", {
    email,
    passwordlink,
    clinic_id,
  }); // Update endpoint as needed
};

export const getMedicalQuestions = async (data) => {
  return Fetcher.get("/GetQuestions");
};

export const ChangePassword = async ({
  old_password,
  newpassword,
  newpassword_confirmation,
}) => {
  return Fetcher.post("/password/ChangePassword", {
    old_password,
    newpassword,
    newpassword_confirmation,
  });
};

export const forgotPassword = async ({
  email,
  password,
  password_confirmation,
  token,
  company_id,
}) => {
  return Fetcher.post("/password/ForgotPassword", {
    email,
    password,
    password_confirmation,
    token,
    company_id,
  });
};

export const getOrderByIdApi = async (id) => {
  return Fetcher.get(`order/ViewOrder/${id}`);
};

export const GetOrdersApi = async ({ data, page }) => {
  return Fetcher.get(`order/myorders`, {
    params: {
      ...data,
      page,
    },
  });
};

export default {
  UploadPhotoLogs,
  UpdatePassword,
  TrackReview,
  sendStepData,
  ImageUplaodApi,
  getVariationsApi,
  GetProductsApi,
  abandonCart,
  GetBmiJourney,
  GetImageIsUplaod,
  GetUserOrderApi,
  getNotified,
  forgotPasswordLink,
  getMedicalQuestions,
  ChangePassword,
  forgotPassword,
  getOrderByIdApi,
  GetOrdersApi,
};
