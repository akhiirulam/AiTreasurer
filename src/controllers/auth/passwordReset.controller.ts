import type { Request, Response } from "express";

import passwordResetService from "../../services/auth/passwordReset.service";

/**
 * Request password reset email.
 *
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });

      return;
    }

    const result = await passwordResetService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
    });
  }
};

/**
 * Reset password using a valid reset token.
 *
 * POST /api/auth/reset-password
 */
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Reset token is required",
      });

      return;
    }

    if (!newPassword) {
      res.status(400).json({
        success: false,
        message: "New password is required",
      });

      return;
    }

    const result = await passwordResetService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Reset password error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to reset password";

    res.status(400).json({
      success: false,
      message,
    });
  }
};
