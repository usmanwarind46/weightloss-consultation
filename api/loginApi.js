import Fetcher from "@/library/Fetcher";

export const Login = async (data) => {
  return Fetcher.post("auth/login", data);
};

/*
 * Redeems a "view as patient" token issued by the CRM.
 *
 * This used to post `{ impersonate_email }` to `impersonation`, and the API
 * returned a working session for whoever owned that address - no password, no
 * staff session, nothing at all. Anyone who worked out the shape of the
 * request owned every account on the platform, patients and administrators
 * alike.
 *
 * The CRM now mints a single-use token naming one patient, valid for seconds,
 * and that token is all we ever send.
 */
export const impersonateLogin = async ({ token }) => {
  return Fetcher.post("auth/impersonation/exchange", { token });
};

export default { Login, impersonateLogin };
