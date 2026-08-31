import { Request, Response } from "express";

import UserRegistrationService from "../../services/auth/userRegistration.service";
import UserLoginService from "../../services/auth/loginUser.service";
import AuthService from "../../services/auth/auth.service";

import asyncHandler from "../../utils/asyncHandler";

// =====================================================
// REGISTER
// =====================================================

export const userRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await UserRegistrationService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  },
);

// =====================================================
// LOGIN
// =====================================================

export const userLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await UserLoginService.loginUser({
    email,
    password,
  });

  // ==================================================
  // REFRESH TOKEN COOKIE
  // ==================================================

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",

    data: {
      user: {
        id: result.user._id.toString(),
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
        profileImage: result.user.profileImage,
      },

      accessToken: result.accessToken,
    },
  });
});

// =====================================================
// REFRESH ACCESS TOKEN
// =====================================================

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const result = await AuthService.refreshAccessToken(refreshToken);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",

      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },
);

// =====================================================
// LOGOUT
// =====================================================

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
