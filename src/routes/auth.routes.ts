import express from "express";
import {
  userRegistration,
  userLogin,
  refreshAccessToken,
  logout,
} from "../controllers/auth/auth.controller";

import { googleLogin } from "../controllers/auth/google.controller";

const authRouter = express.Router();

authRouter.post("/register", userRegistration);
authRouter.post("/login", userLogin);
authRouter.post("/google", googleLogin);
authRouter.post("/refresh", refreshAccessToken);
authRouter.post("/logout", logout);

export default authRouter;
