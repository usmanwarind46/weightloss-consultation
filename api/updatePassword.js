import Fetcher from "@/library/Fetcher";

export const UpdatePassword = async (data) => {
  return Fetcher.post("password/UpdatePassword", data);
};

export default { UpdatePassword };
