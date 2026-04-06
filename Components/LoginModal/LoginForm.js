import TextField from "../TextField/TextField";
import NextButton from "../NextButton/NextButton";
import { useForm } from "react-hook-form"; // 🟢 ADD THIS
import BackButton from "../BackButton/BackButton";
import Link from "next/link";

export default function LoginForm({ register, handleSubmit, errors, isLoading, onLogin, onForgot }) {

  return (
    <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
      <TextField
        label="Email Address"
        name="email"
        type="email"
        placeholder="Email"
        register={register}
        required
        errors={errors}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        placeholder="Password"
        register={register}
        required
        errors={errors}
      />
      <NextButton label="Login" type="submit" disabled={isLoading} />

      <p className="reg-font text-black text-sm text-center mt-5">

        Are you a new patient? <a href={"/start-consultation/acknowledgment/"} className="text-primary underline">Get started with the consultation</a>
      </p>
      <div className="mt-2">
 

        <div className="flex justify-center mt-4">
          <button onClick={onForgot} label="" className="text-black underline text-sm reg-font cursor-pointer">
            Forgot password
          </button>
        </div>

      </div>
    </form>
  );
}
