import { Router } from "express";
import {
  loginUser,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyForgotPasswordOtp,
  verifyUser,
} from "../controller/auth.controller";

const router: Router = Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-password-user", resetUserPassword); // New route for resetting password after OTP verification
router.post("/verify-forgot-password-user", verifyForgotPasswordOtp); // New route for verifying OTP during forgot password flow

export default router;
