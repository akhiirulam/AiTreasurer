import bcrypt from "bcrypt";

import userLoginRepository from "../../repositories/auth/userLogin.repository";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token/token";

interface LoginUserData {
  email: string;
  password: string;
}

class UserLoginService {
  async loginUser(userData: LoginUserData) {
    const { email, password } = userData;

    // ==================================================
    // 1. Find user
    // ==================================================

    const user = await userLoginRepository.findByEmail(email);

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    // ==================================================
    // 2. Check account status
    // ==================================================

    if (user.accountStatus === "deleted") {
      throw new Error("This account has been deleted");
    }

    if (user.accountStatus === "inactive") {
      throw new Error("This account is inactive");
    }

    // ==================================================
    // 3. Verify password
    // ==================================================

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // ==================================================
    // 4. Check email verification
    // ==================================================

    if (user.authProvider === "local" && !user.isEmailVerified) {
      throw new Error("Please verify your email before logging in");
    }

    // ==================================================
    // 5. Generate access token
    // ==================================================

    const accessToken = generateAccessToken(user._id.toString(), user.role);

    // ==================================================
    // 6. Generate refresh token
    // ==================================================

    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    // ==================================================
    // 7. Return authentication result
    // ==================================================

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}

export default new UserLoginService();
