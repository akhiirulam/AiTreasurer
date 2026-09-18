import { Request, Response } from "express";

import UserRegistrationService from "../../services/auth/userRegistration.service";
import UserLoginService from "../../services/auth/loginUser.service";
import AuthService from "../../services/auth/auth.service";
import userPasswordService from "../../services/auth/userPassword.service";

import asyncHandler from "../../utils/asyncHandler";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

import deleteAccountService from "../../services/auth/deleteAccount.service";

// =====================================================
// REGISTER
// =====================================================

export const userRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await UserRegistrationService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: result.message,

      data: {
        user: result.user,
      },
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
        isEmailVerified: result.user.isEmailVerified,
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
// PASSWORD CHANGE
// =====================================================

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const result = await userPasswordService.changePassword({
      userId,
      currentPassword,
      newPassword,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to change password";

    res.status(400).json({
      success: false,
      message,
    });
  }
};

// =====================================================
// DELETE ACCOUNT
// =====================================================

export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { password, confirmation } = req.body;

    const result = await deleteAccountService.deleteAccount({
      userId,
      password,
      confirmation,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete account";

    res.status(400).json({
      success: false,
      message,
    });
  }
};

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
