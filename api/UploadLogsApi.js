// /api/getVariationsApi.js
import Fetcher from "@/library/Fetcher";

export const UploadPhotoLogs = async (data) => {
  return Fetcher.post(`FrontendLogs`, data);
};

export default UploadPhotoLogs;
