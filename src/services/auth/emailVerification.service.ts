import crypto from "crypto";

import emailVerificationRepository from "../../repositories/auth/emailVerification.repository";
import userRegistrationRepository from "../../repositories/auth/userRegistration.repository";
import emailService from "../email/email.service";

class EmailVerificationService {
  async sendVerificationEmail(userId: string) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await userRegistrationRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.accountStatus !== "active") {
      throw new Error("Account is not active");
    }

    if (user.authProvider !== "local") {
      throw new Error("Email verification is not required for Google accounts");
    }

    if (user.isEmailVerified) {
      throw new Error("Email is already verified");
    }

    // Remove previous verification tokens
    await emailVerificationRepository.deleteByUserId(user._id.toString());

    // Generate raw token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash in database
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Token valid for 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await emailVerificationRepository.create({
      userId: user._id.toString(),
      tokenHash,
      expiresAt,
    });

    // Frontend verification URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const verificationUrl = `${frontendUrl}/verify-email?token=${rawToken}`;

    // Send email
    await emailService.sendEmail(
      user.email,
      "Verify your AiTreasurer email",
      `
        <!DOCTYPE html>
        <html>
          <body
            style="
              margin:0;
              padding:0;
              background:#f5f7f2;
              font-family:Arial,sans-serif;
            "
          >
            <div
              style="
                max-width:600px;
                margin:40px auto;
                background:#ffffff;
                border-radius:12px;
                padding:40px;
                border:1px solid #dce5da;
              "
            >
              <div
                style="
                  width:50px;
                  height:50px;
                  line-height:50px;
                  text-align:center;
                  background:#173f35;
                  color:#ffffff;
                  border-radius:10px;
                  font-size:18px;
                  font-weight:bold;
                "
              >
                AT
              </div>

              <h1
                style="
                  color:#17231f;
                  margin-top:30px;
                "
              >
                Verify your email
              </h1>

              <p
                style="
                  color:#68736c;
                  line-height:1.6;
                "
              >
                Welcome to AiTreasurer.
                Please verify your email address to
                activate your account.
              </p>

              <div style="margin:30px 0;">
                <a
                  href="${verificationUrl}"
                  style="
                    display:inline-block;
                    background:#173f35;
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 24px;
                    border-radius:8px;
                    font-weight:bold;
                  "
                >
                  Verify Email
                </a>
              </div>

              <p
                style="
                  color:#68736c;
                  font-size:14px;
                  line-height:1.6;
                "
              >
                This verification link will expire
                in 24 hours.
              </p>

              <p
                style="
                  color:#68736c;
                  font-size:12px;
                  margin-top:30px;
                "
              >
                If you did not create an AiTreasurer
                account, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    );

    return {
      message: "Verification email sent successfully",
    };
  }

  async verifyEmail(rawToken: string) {
    if (!rawToken) {
      throw new Error("Verification token is required");
    }

    // Hash token received from frontend
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Find valid token
    const verificationToken =
      await emailVerificationRepository.findValidToken(tokenHash);

    if (!verificationToken) {
      throw new Error("Verification link is invalid or has expired");
    }

    // Find user
    const user = await userRegistrationRepository.findById(
      verificationToken.userId.toString(),
    );

    if (!user) {
      throw new Error("User not found");
    }

    if (user.accountStatus !== "active") {
      throw new Error("Account is not active");
    }

    if (user.authProvider !== "local") {
      throw new Error("Email verification is not required for Google accounts");
    }

    // Mark email as verified
    await userRegistrationRepository.verifyEmail(user._id.toString());

    // Mark token as used
    await emailVerificationRepository.markAsUsed(
      verificationToken._id.toString(),
    );

    // Remove remaining verification tokens
    await emailVerificationRepository.deleteByUserId(user._id.toString());

    return {
      message: "Email verified successfully",
    };
  }
}

export default new EmailVerificationService();
