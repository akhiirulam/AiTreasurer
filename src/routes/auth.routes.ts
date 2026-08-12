import express from "express";
import {
  userRegistration,
  userLogin,
} from "../controllers/auth/auth.controller";

import { googleLogin } from "../controllers/auth/google.controller";

const authRouter = express.Router();

authRouter.post("/register", userRegistration);
authRouter.post("/login", userLogin);
authRouter.post("/google", googleLogin);

export default authRouter;
