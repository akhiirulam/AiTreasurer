import express from "express";
import { userRegistration } from "../controllers/auth/auth.controller";

const authRouter = express.Router();

authRouter.post("/user-registration", userRegistration);

export default authRouter;
