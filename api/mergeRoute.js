// /api/getVariationsApi.js
import Fetcher from "@/library/Fetcher";

export const UploadPhotoLogs = async (data) => {
  return Fetcher.post(`FrontendLogs`, data);
};

export const UpdatePassword = async (data) => {
  return Fetcher.post("password/UpdatePassword", data);
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

export const getMedicalQuestions = async (data) => {
  return Fetcher.get("/GetQuestions");
};

export const GetProductsApi = async ({ data }) => {
  return Fetcher.get(`products/GetProducts`, data);
};

export const getOrderByIdApi = async (id) => {
  return Fetcher.get(`order/ViewOrder/${id}`);
};

export const abandonCart = async (data) => {
  return Fetcher.post("AbandonedCart", data);
};

export const registerUser = async (data) => {
  return Fetcher.post("auth/registerPatient", data);
};

export const userConsultationApi = async (data) => {
  return Fetcher.post("/GetStepsData", data);
};

export const CouponApi = async (data) => {
  return Fetcher.post("getCoupon", data);
};

export default {
  UploadPhotoLogs,
  UpdatePassword,
  sendStepData,
  ImageUplaodApi,
  getVariationsApi,
  getMedicalQuestions,
  GetProductsApi,
  getOrderByIdApi,
  abandonCart,
  registerUser,
  userConsultationApi,
  CouponApi,
};
