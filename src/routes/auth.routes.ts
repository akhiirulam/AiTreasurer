import express from "express";
import {
  userRegistration,
  userLogin,
} from "../controllers/auth/auth.controller";

const authRouter = express.Router();

authRouter.post("/register", userRegistration);
authRouter.post("/login", userLogin);

export default authRouter;
