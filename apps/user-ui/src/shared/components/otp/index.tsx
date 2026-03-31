import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

type OtpInputProps = {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string | null;
  onResend: () => void;
  canResend: boolean;
  timer: number;
};

const OtpInput = ({
  otp,
  setOtp,
  onSubmit,
  isLoading,
  error,
  onResend,
  canResend,
  timer,
}: OtpInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 3 && value) {
      const finalOtp = [...newOtp].join("");
      if (!finalOtp.includes("")) {
        onSubmit(); // triggers parent mutation for OTP verification when the last digit is entered
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-center mb-4">Enter OTP</h3>

      <div className="flex justify-center gap-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            onPaste={(e) => {
              const paste = e.clipboardData.getData("text").trim();

              if (/^\d{4}$/.test(paste)) {
                const newOtp = paste.split("");
                setOtp(newOtp);

                // focus last input
                inputRefs.current[3]?.focus();

                // auto submit
                onSubmit();
              }
            }}
          />
        ))}
      </div>

      <button
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg"
        disabled={isLoading || otp.some((d) => d === "")}
        onClick={onSubmit}
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </button>

      <p className="text-center text-sm mt-4">
        {canResend ? (
          <button onClick={onResend} className="text-blue-500">
            Resend OTP
          </button>
        ) : (
          `Resend OTP in ${timer}s`
        )}
      </p>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default OtpInput;
