import bcrypt from "bcrypt";
import userRegistrationRepository from "../../repositories/auth/userRegistration.repository";

interface RegisterUserData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

class UserRegistrationService {
  async registerUser(userData: RegisterUserData) {
    const { fullName, email, mobileNumber, password } = userData;

    const existingEmail = await userRegistrationRepository.findByEmail(email);

    if (existingEmail) {
      throw new Error("Email is already registered");
    }

    const existingMobile =
      await userRegistrationRepository.findByMobileNumber(mobileNumber);

    if (existingMobile) {
      throw new Error("Mobile number is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userRegistrationRepository.create({
      fullName,
      email: email.toLowerCase(),
      mobileNumber,
      password: hashedPassword,
      authProvider: "local",
      role: "owner",
      isEmailVerified: false,
      isMobileVerified: false,
      accountStatus: "active",
    });

    return user;
  }
}

export default new UserRegistrationService();
