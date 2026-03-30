import { Router } from "express";
import {
  getUser,
  loginUser,
  refreshToken,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPassword,
} from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token-user", refreshToken);
router.get("/logged-in-user", isAuthenticated, getUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-password-user", resetUserPassword); // New route for resetting password after OTP verification
router.post("/verify-forgot-password-user", verifyUserForgotPassword); // New route for verifying OTP during forgot password flow

export default router;
