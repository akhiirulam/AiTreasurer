import { Request, Response } from "express";

import emailVerificationService from "../../services/auth/emailVerification.service";

/**
 * Send / resend email verification link.
 *
 * POST /api/auth/send-verification-email
 */
export const sendVerificationEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    const result = await emailVerificationService.sendVerificationEmail(userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send verification email";

    res.status(400).json({
      success: false,
      message,
    });
  }
};

/**
 * Verify email using token from verification link.
 *
 * POST /api/auth/verify-email
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
      return;
    }

    const result = await emailVerificationService.verifyEmail(token);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Email verification failed";

    res.status(400).json({
      success: false,
      message,
    });
  }
};
