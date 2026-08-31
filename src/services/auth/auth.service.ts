import UserRegistration from "../../models/userRegistration.model";

import {
  generateAccessToken,
  verifyRefreshToken,
} from "../../utils/token/token";

class AuthService {
  /**
   * Generate a new access token using
   * the refresh token.
   */
  async refreshAccessToken(refreshToken: string) {
    // ==================================================
    // 1. CHECK REFRESH TOKEN
    // ==================================================

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    // ==================================================
    // 2. VERIFY REFRESH TOKEN
    // ==================================================

    const decoded = verifyRefreshToken(refreshToken);

    // ==================================================
    // 3. FIND USER
    // ==================================================

    const user = await UserRegistration.findById(decoded.id);

    if (!user) {
      throw new Error("User not found");
    }

    // ==================================================
    // 4. CHECK ACCOUNT STATUS
    // ==================================================

    if (user.accountStatus !== "active") {
      throw new Error("Your account is not active");
    }

    // ==================================================
    // 5. GENERATE NEW ACCESS TOKEN
    // ==================================================

    const accessToken = generateAccessToken(user._id.toString());

    // ==================================================
    // 6. RETURN AUTH DATA
    // ==================================================

    return {
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },

      accessToken,
    };
  }
}

export default new AuthService();
