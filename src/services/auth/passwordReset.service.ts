import crypto from "crypto";
import passwordResetRepository from "../../repositories/auth/passwordReset.repository";
import userRegistrationRepository from "../../repositories/auth/userRegistration.repository";
import emailService from "../email/email.service";

class PasswordResetService {
  /**
   * Request a password reset.
   *
   * Generates a secure token, stores only its hash,
   * and sends the reset link to the user's email.
   */
  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail) {
      throw new Error("Email is required");
    }

    const user = await userRegistrationRepository.findByEmail(normalizedEmail);

    console.log(
      "USER FOUND:",
      user
        ? {
            id: user._id.toString(),
            email: user.email,
            authProvider: user.authProvider,
            accountStatus: user.accountStatus,
          }
        : null,
    );
    /*
     * Do not reveal whether the email exists.
     */
    if (!user) {
      return {
        message:
          "If an account exists for this email, a password reset link has been sent.",
      };
    }

    /*
     * Deleted and inactive accounts should not
     * receive password reset emails.
     */
    if (user.accountStatus !== "active") {
      return {
        message:
          "If an account exists for this email, a password reset link has been sent.",
      };
    }

    /*
     * Google accounts don't have a local password.
     */
    if (user.authProvider !== "local") {
      return {
        message:
          "If an account exists for this email, a password reset link has been sent.",
      };
    }
    console.log("USER PASSED RESET VALIDATION");

    /*
     * Invalidate any previous reset tokens.
     */
    await passwordResetRepository.deleteByUserId(user._id.toString());

    /*
     * Generate a cryptographically secure random token.
     *
     * This raw token is sent to the user's email.
     */
    const rawToken = crypto.randomBytes(32).toString("hex");

    /*
     * Store only the SHA-256 hash in MongoDB.
     */
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    /*
     * Token expires after 15 minutes.
     */
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await passwordResetRepository.create({
      userId: user._id.toString(),
      tokenHash,
      expiresAt,
    });

    console.log("PASSWORD RESET TOKEN CREATED");

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    await emailService.sendEmail(
      user.email,
      "Reset your AiTreasurer password",
      `
        <!DOCTYPE html>
        <html>
          <body
            style="
              margin: 0;
              padding: 0;
              background: #f5f7f2;
              font-family: Arial, sans-serif;
            "
          >
            <div
              style="
                max-width: 560px;
                margin: 40px auto;
                padding: 32px;
                background: #ffffff;
                border: 1px solid #dce5da;
                border-radius: 12px;
              "
            >
              <h2
                style="
                  margin: 0 0 8px;
                  color: #173f35;
                "
              >
                AiTreasurer
              </h2>

              <p
                style="
                  margin: 0 0 24px;
                  color: #68736c;
                "
              >
                Smart accounting for your business
              </p>

              <h3
                style="
                  color: #17231f;
                "
              >
                Reset your password
              </h3>

              <p
                style="
                  color: #17231f;
                  line-height: 1.6;
                "
              >
                We received a request to reset your
                AiTreasurer password.
              </p>

              <p
                style="
                  color: #17231f;
                  line-height: 1.6;
                "
              >
                Click the button below to create a new
                password.
              </p>

              <div style="margin: 28px 0;">
                <a
                  href="${resetUrl}"
                  style="
                    display: inline-block;
                    padding: 12px 22px;
                    background: #173f35;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                  "
                >
                  Reset Password
                </a>
              </div>

              <p
                style="
                  color: #68736c;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                This link will expire in
                <strong>15 minutes</strong>.
              </p>

              <p
                style="
                  color: #68736c;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                If you did not request a password reset,
                you can safely ignore this email.
              </p>

              <hr
                style="
                  border: 0;
                  border-top: 1px solid #edf1eb;
                  margin: 28px 0;
                "
              />

              <p
                style="
                  margin: 0;
                  color: #9aa59f;
                  font-size: 12px;
                "
              >
                © AiTreasurer
              </p>
            </div>
          </body>
        </html>
      `,
    );

    return {
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };
  }

  /**
   * Reset the user's password using a valid token.
   */
  async resetPassword(rawToken: string, newPassword: string) {
    if (!rawToken) {
      throw new Error("Reset token is required");
    }

    if (!newPassword) {
      throw new Error("New password is required");
    }

    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }

    /*
     * Hash the token received from the frontend.
     * MongoDB contains only this hash.
     */
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const resetToken = await passwordResetRepository.findValidToken(tokenHash);

    if (!resetToken) {
      throw new Error("Reset link is invalid or has expired");
    }

    const user = await userRegistrationRepository.findByIdWithPassword(
      resetToken.userId.toString(),
    );

    if (!user) {
      throw new Error("User not found");
    }

    if (user.accountStatus !== "active") {
      throw new Error("Account is not active");
    }

    if (user.authProvider !== "local") {
      throw new Error("Password reset is not available for Google accounts");
    }

    /*
     * Hash the new password.
     */
    const bcrypt = await import("bcrypt");

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await userRegistrationRepository.updatePassword(
      user._id.toString(),
      hashedPassword,
    );

    /*
     * Invalidate the reset token.
     */
    await passwordResetRepository.markAsUsed(resetToken._id.toString());

    /*
     * Remove any other outstanding reset tokens
     * for this user as an additional safety measure.
     */
    await passwordResetRepository.deleteByUserId(user._id.toString());

    return {
      message: "Password reset successfully",
    };
  }
}

export default new PasswordResetService();
