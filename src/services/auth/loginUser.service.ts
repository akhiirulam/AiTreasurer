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
    const user = await userLoginRepository.findByEmail(email);

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id.toString());

    const refreshToken = generateRefreshToken(user._id.toString());

    return { user, accessToken, refreshToken };
  }
}

export default new UserLoginService();
