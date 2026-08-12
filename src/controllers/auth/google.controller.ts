import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

import UserRegistration from "../../models/userRegistration.model";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token/token";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token",
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account email not available",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find existing user
    let user = await UserRegistration.findOne({
      email: normalizedEmail,
    });

    // Create user if not found
    if (!user) {
      user = await UserRegistration.create({
        fullName: name || "Google User",
        email: normalizedEmail,
        googleId,
        profileImage: picture || null,
        authProvider: "google",
        isEmailVerified: true,
        isMobileVerified: false,
        role: "owner",
        accountStatus: "active",
      });
    }

    // Check account status
    if (user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // Generate your application's tokens
    const accessToken = generateAccessToken(user._id.toString());

    const refreshToken = generateRefreshToken(user._id.toString());

    // Store refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      data: {
        user: {
          id: user._id,
          name: user.fullName,
          email: user.email,
          profileImage: user.profileImage,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid Google credential",
    });
  }
};
