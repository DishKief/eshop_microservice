"use client";
import GoogleButton from "apps/user-ui/src/shared/components/google-button";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { response } from "express";
import { useMutation } from "@tanstack/react-query";
import { verify } from "crypto";

type FormData = {
  name: string;
  email: string;
  password: string;
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otpSent, setOtpSent] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/user-registration`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/verify-user`,
        {
          ...userData,
          otp: otpSent.join(""),
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      route.push("/login");
    },
  });

  const onSubmit = async (data: FormData) => {
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow digits or empty value

    const newOtp = [...otpSent];
    newOtp[index] = value;
    setOtpSent(newOtp);

    // Move to next input if a digit is entered
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpSent[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (userData) {
      signupMutation.mutate(userData);
    }
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Sign Up
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Sign Up
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Sign Up for Eshop
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Already have an account?{" "}
            <Link href={"/login"} className="text-blue-500">
              Login
            </Link>
          </p>

          <GoogleButton />
          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign up with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <label className="block text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Dinesh Stack"
                className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                {...register("name", {
                  required: "Name is required",
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}

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

              <label className="block text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />

                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                >
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg"
              >
                {signupMutation.isPending ? "Signing Up..." : "Sign Up"}
              </button>
            </form>
          ) : (
            <div className="">
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otpSent.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>
              <button
                className={`w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg `}
                disabled={
                  verifyOtpMutation.isPending ||
                  otpSent.some((digit) => digit === "")
                }
                onClick={() => verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
              </button>
              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    className="text-blue-500 cursor-pointer"
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>
              {verifyOtpMutation?.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {verifyOtpMutation.error.response?.data?.message ||
                      verifyOtpMutation.error.message ||
                      "An error occurred while verifying OTP."}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
