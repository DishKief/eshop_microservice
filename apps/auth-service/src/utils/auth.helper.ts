import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";
import { sendEmail } from "./sendMail";
import { NextFunction } from "express";
import { parse } from "path";

const emailRegax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const { name, email, password, phone_number, country } = data;

    if(
        !name || !email || !password || (userType === "seller" && (!phone_number || !country))
    ){
        throw new ValidationError("Missing required fields for registration");
    }

    if(!emailRegax.test(email)) {
        throw new ValidationError("Invalid email format!");
    }
}

export const checkOtpRestrictions = async (email: string, next: NextFunction) => {
    if(await redis.get(`otp_lock:${email}`)) {
        return next(new ValidationError("Your account is locked due to multiple failed OTP attempts. Please try again after 15 minutes."));
    }

    if(await redis.get(`otp_spam_lock:${email}`)) {
        return next(new ValidationError("Too many OTP requests. Please wait for 1 hour before requesting a new OTP."));
    }

    if(await redis.get(`otp_cooldown:${email}`)) {
        return next(new ValidationError("Please wait for 1 minute before requesting a new OTP."));
    }
}

export const trackOtpRequests = async (email: string, next: NextFunction) => {
    
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

    if(otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 60 * 60); // Lock OTP requests for 1 hour
        return next(new ValidationError("Too many OTP requests. Please wait for 1 hour before requesting a OTP again."));
    }

    await redis.set(otpRequestKey, otpRequests + 1, "EX", 60 * 60); // Count OTP requests for 1 hour
}

export const sendOtp = async (name: string, email: string, template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify your email", template, {name, otp});

    await redis.set(`otp:${email}`, otp, "EX", 5 * 60); // OTP valid for 5 minutes
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60); // 1 minute cooldown for requesting new OTP
}