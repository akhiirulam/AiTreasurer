import { Request, Response } from "express";

import UserRegistrationService from "../../services/auth/userRegistration.service";
import asyncHandler from "../../utils/asyncHandler";
import UserLoginService from "../../services/auth/loginUser.service";

export const userRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await UserRegistrationService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  },
);

export const userLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await UserLoginService.loginUser({ email, password });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});
