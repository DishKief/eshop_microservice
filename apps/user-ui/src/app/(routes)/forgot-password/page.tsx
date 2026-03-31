"use client";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import OtpInput from "apps/user-ui/src/shared/components/otp";

type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const route = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/forgot-password-user`,
        { email },
      );
      return response.data;
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep("otp");
      setServerError(null);
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        "Invalid OTP. Please try again.";
      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/verify-forgot-password-user`,
        { email: userEmail, otp: otp.join("") },
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        "Invalid OTP. Please try again.";
      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/reset-password-user`,
        { email: userEmail, newPassword: password },
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("email");
      toast.success(
        "Password reset successful! Please login with your new password.",
      );
      setServerError(null);
      route.push("/login");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        "Invalid credentials. Please try again.";
      setServerError(errorMessage);
    },
  });

  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };

  const onSubmitPassword = async (data: FormData) => {
    resetPasswordMutation.mutate(data);
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot-password
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          {step === "email" && (
            <>
              <h3 className="text-3xl font-semibold text-center mb-2">
                Forgot Password
              </h3>
              <p className="text-center text-gray-500 mb-4">
                Go back to{" "}
                <Link href={"/login"} className="text-blue-500">
                  Login
                </Link>
              </p>

              <form onSubmit={handleSubmit(onSubmitEmail)}>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="info@dineshstack.com"
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg"
                >
                  {requestOtpMutation.isPending ? "Sending OTP..." : "Submit"}
                </button>
                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </form>
            </>
          )}

          {step === "otp" && (
            <OtpInput
              otp={otp}
              setOtp={setOtp}
              onSubmit={() => verifyOtpMutation.mutate()}
              isLoading={verifyOtpMutation.isPending}
              error={serverError}
              onResend={() => {
                if (userEmail) {
                  setOtp(["", "", "", ""]);
                  requestOtpMutation.mutate({ email: userEmail });
                }
              }}
              canResend={canResend}
              timer={timer}
            />
          )}

          {step === "reset" && (
            <>
              <h3 className="text-xl font-semibold text-center mb-4">
                Reset Password
              </h3>
              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <label className="block text-gray-700 mb-1">New Password</label>
                <input
                  type={"password"}
                  placeholder="Enter new password"
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg"
                >
                  {resetPasswordMutation.isPending
                    ? "Resetting Password..."
                    : "Reset Password"}
                </button>

                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
