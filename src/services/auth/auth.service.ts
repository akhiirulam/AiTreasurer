import {
  generateAccessToken,
  verifyRefreshToken,
} from "../../utils/token/token";

import userRegistrationRepository from "../../repositories/auth/userRegistration.repository";

class AuthService {
  async refreshAccessToken(refreshToken: string) {
    // ==================================================
    // 1. Verify refresh token
    // ==================================================

    const decoded = verifyRefreshToken(refreshToken);

    const userId = decoded.id;

    if (!userId) {
      throw new Error("Invalid refresh token");
    }

    // ==================================================
    // 2. Find current user
    // ==================================================

    const user = await userRegistrationRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // ==================================================
    // 3. Check account status
    // ==================================================

    if (user.accountStatus === "deleted") {
      throw new Error("This account has been deleted");
    }

    if (user.accountStatus === "inactive") {
      throw new Error("This account is inactive");
    }

    // ==================================================
    // 4. Generate new access token
    // ==================================================

    const accessToken = generateAccessToken(user._id.toString(), user.role);

    // ==================================================
    // 5. Return current user + access token
    // ==================================================

    return {
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
    };
  }
}

export default new AuthService();
