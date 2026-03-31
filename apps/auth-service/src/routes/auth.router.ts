import { Router } from "express";
import {
  createShop,
  getUser,
  loginUser,
  refreshToken,
  registerSeller,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifySeller,
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
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);

export default router;
