import { NextFunction, Request, Response } from "express";
import {
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthenticationError, ValidationError } from "@packages/error-handler";
import { checkOtpRestrictions } from "../utils/auth.helper";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2026-03-25.dahlia",
// });

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await checkOtpRestrictions(email, next);

    await trackOtpRequests(email, next);

    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to your email. Please check and verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(
        new ValidationError("All fields are required for verification!"),
      );
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User verified and registered successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ValidationError("Email and password are required for login!"),
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new AuthenticationError("No user found with this email!"));
    }

    // verify password
    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
      return next(new AuthenticationError("Invalid email or password!"));
    }

    // Generate access and refresh token
    const accessToken = jwt.sign(
      { userId: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" },
    );

    //store the refresh and access token in an httpOnly secure cookie
    setCookie(res, "accessToken", accessToken);
    setCookie(res, "refreshToken", refreshToken);

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return new ValidationError("Unauthorized! No refresh token.");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError("Forbidden! Invalid refresh token.");
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return next(
        new AuthenticationError(
          "Forbidden! No User/Seller found with this data!",
        ),
      );
    }
    const newAccessToken = jwt.sign(
      { userId: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );

    setCookie(res, "access_token", newAccessToken);

    return res.status(201).json({
      success: true,
      message: "Access token refreshed successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// get logged in user details
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await handleForgotPassword(req, res, next, "user");
};

// Verify forgot password OTP and reset password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new ValidationError("No user found with this email!"));
    }

    // cmpare new password with the existing password to prevent reuse
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the old password!",
        ),
      );
    }

    // hash the new password and update in DB
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message:
        "Password reset successful! You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

// Verify forgot password OTP
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ValidationError("Email and OTP are required!");
    }

    await verifyOtp(email, otp, next);

    res.status(200).json({
      message: "OTP verified successfully! You can now reset your password.",
    });
  } catch (error) {
    next(error);
  }
};

// register a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ValidationError("Seller already exists with this email!");
    }

    await checkOtpRestrictions(email, next);

    await trackOtpRequests(email, next);

    await sendOtp(name, email, "seller-activation-mail");

    res.status(200).json({
      message: "OTP sent to your email. Please check and verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(
        new ValidationError("All fields are required for verification!"),
      );
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(
        new ValidationError("Seller already exists with this email!"),
      );
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number,
        country,
      },
    });

    res.status(201).json({
      success: true,
      message: "Seller verified and registered successfully!",
      data: seller,
    });
  } catch (error) {
    next(error);
  }
};

// create a new shop
export const createShop = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (!name || !bio || !address || !opening_hours || !category || !sellerId) {
      return next(
        new ValidationError("All fields are required to create a shop!"),
      );
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      message: "Shop created successfully!",
      data: shop,
    });
  } catch (error) {
    next(error);
  }
};

// create stripe connect account link for seller
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError("Seller ID is required!"));
    }

    // const account = await stripe.accounts.create({
    //   type: "express",
    //   country: "GB",
    //   email: sellerId?.email,
    //   capabilities: {
    //     card_payments: { requested: true },
    //     transfers: { requested: true },
    //   },
    // });

    // await prisma.sellers.update({
    //   where: { id: sellerId },
    //   data: { stripeId: account.id },
    // });

    // const accountLink = await stripe.accountLinks.create({
    //   account: account.id,
    //   refresh_url: "http://localhost:3000/success",
    //   return_url: "http://localhost:3000/success",
    //   type: "account_onboarding",
    // });

    res.status(200).json({
      // url: accountLink.url,
      message: "Stripe connect link created successfully!",
      // data: account,
    });
  } catch (error) {
    next(error);
  }
};

// login seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ValidationError("Email and password are required for login!"),
      );
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });

    if (!seller) {
      return next(new AuthenticationError("No seller found with this email!"));
    }

    // verify password
    const isMatch = await bcrypt.compare(password, seller.password!);

    if (!isMatch) {
      return next(new AuthenticationError("Invalid email or password!"));
    }

    // Generate access and refresh token
    const accessToken = jwt.sign(
      { userId: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" },
    );

    //store the refresh and access token in an httpOnly secure cookie
    setCookie(res, "seller-access-token", accessToken);
    setCookie(res, "seller-refresh-token", refreshToken);

    res.status(200).json({
      message: "Login successful!",
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// get logged in seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};
