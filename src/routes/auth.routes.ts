import express from "express";
import {
  userRegistration,
  userLogin,
  refreshAccessToken,
  changePassword,
  deleteAccount,
  logout,
} from "../controllers/auth/auth.controller";

import {
  forgotPassword,
  resetPassword,
} from "../controllers/auth/passwordReset.controller";
import {
  sendVerificationEmail,
  verifyEmail,
} from "../controllers/auth/emailVerification.controller";

import { googleLogin } from "../controllers/auth/google.controller";
import authenticate from "../middleware/auth.middleware";

const authRouter = express.Router();

// ==================================================
// AUTHENTICATION
// ==================================================

authRouter.post("/register", userRegistration);
authRouter.post("/login", userLogin);
authRouter.post("/google", googleLogin);
authRouter.post("/refresh", refreshAccessToken);
authRouter.post("/logout", logout);
authRouter.post("/change-password", authenticate, changePassword);

// ==================================================
// ACCOUNT
// ==================================================

authRouter.delete("/account", authenticate, deleteAccount);

// ==================================================
// PASSWORD
// ==================================================

authRouter.post("/forgot-password", forgotPassword);

authRouter.post("/reset-password", resetPassword);

// ==================================================
// EMAIL VERIFICATION
// ==================================================

authRouter.post("/send-verification-email", sendVerificationEmail);

authRouter.post("/verify-email", verifyEmail);

export default authRouter;
