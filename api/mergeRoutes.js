// /api/getVariationsApi.js
import Fetcher from "@/library/Fetcher";

export const UploadPhotoLogs = async (data) => {
  return Fetcher.post(`FrontendLogs`, data);
};

/*
 * Sets the password on the signed-in account - the "Set a Password" step at
 * checkout, which runs just after registration, so we already hold the token
 * registration gave us and Fetcher attaches it.
 *
 * We used to send `{ email, company_id, password }` and the API changed
 * whichever account matched, without checking who was asking. One anonymous
 * request therefore set the password of any patient, clinician or
 * administrator on the platform - the worst of the November 2026 findings.
 *
 * Only the password is sent now. Who it belongs to is the token's business.
 */
export const UpdatePassword = async ({ password, password_confirmation }) => {
  return Fetcher.post("password/UpdatePassword", {
    password,
    password_confirmation,
  });
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
  return Fetcher.post("/GetQuestions", data);
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

export const patientSource = async (data) => {
  return Fetcher.post("/PatientSources", data);
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
  patientSource,
};
