import crypto from "crypto";
import { ValidationError } from "@packages/error-handler";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";
import { NextFunction } from "express";
import { fail } from "assert";
import prisma from "@packages/libs/prisma";

const emailRegax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller",
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("Missing required fields for registration");
  }

  if (!emailRegax.test(email)) {
    throw new ValidationError("Invalid email format!");
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction,
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Your account is locked due to multiple failed OTP attempts. Please try again after 15 minutes.",
      ),
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "Too many OTP requests. Please wait for 1 hour before requesting a new OTP.",
      ),
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError(
        "Please wait for 1 minute before requesting a new OTP.",
      ),
    );
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 60 * 60); // Lock OTP requests for 1 hour
    return next(
      new ValidationError(
        "Too many OTP requests. Please wait for 1 hour before requesting a OTP again.",
      ),
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, "EX", 60 * 60); // Count OTP requests for 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string,
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verify your email", template, { name, otp });

  await redis.set(`otp:${email}`, otp, "EX", 5 * 60); // OTP valid for 5 minutes
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60); // 1 minute cooldown for requesting new OTP
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction,
) => {
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    throw new ValidationError(
      "OTP has expired or Invalid. Please request a new one.",
    );
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 30 * 60); // Lock account for 30 minutes after 3 failed attempts
      await redis.del(`otp:${email}`, failedAttemptsKey); // Invalidate OTP after locking account
      throw new ValidationError(
        "Your account is locked due to multiple failed OTP attempts. Please try again after 30 minutes.",
      );
    }

    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 30 * 60); // Count failed attempts for 30 minutes
    throw new ValidationError(
      `Invalid OTP. ` +
        (failedAttempts >= 2
          ? "Your account is now locked due to multiple failed attempts. Please try again after 30 minutes."
          : `You have ${2 - failedAttempts} attempts left before your account gets locked.`),
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey); // Clear OTP and failed attempts on successful verification
};

export const handleForgotPassword = async (
  req: any,
  res: any,
  next: NextFunction,
  userType: "user" | "seller",
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError("Email is required!");
    }

    // Find user/seller in DB based on userType and email
    const user =
      userType === "user"
        ? await prisma.users.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });

    if (!user) {
      throw new ValidationError(`${userType} doesn't exist with this email!`);
    }

    await checkOtpRestrictions(email, next);

    await trackOtpRequests(email, next);

    await sendOtp(user.name!, email, `${userType}-forgot-password-mail`);

    res.status(200).json({
      message:
        "OTP sent to your email. Please check and verify to reset your password.",
    });
  } catch (error) {
    next(error);
  }
};
