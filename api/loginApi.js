import Fetcher from "@/library/Fetcher";

export const Login = async (data) => {
  return Fetcher.post("auth/login", data);
};

export const impersonateLogin = async (data) => {
  return Fetcher.post("impersonation", data);
};

export default { Login, impersonateLogin };
