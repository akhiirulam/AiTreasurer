import bcrypt from "bcrypt";
import userRegistrationRepository from "../../repositories/auth/userRegistration.repository";

interface RegisterUserData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: "owner" | "accountant" | "staff" | "viewer" | "admin";
}

class UserRegistrationService {
  async registerUser(userData: RegisterUserData) {
    const { fullName, email, mobileNumber, password, role } = userData;

    const normalizedEmail = email.toLowerCase().trim();

    // Check email
    const existingEmail =
      await userRegistrationRepository.findByEmail(normalizedEmail);

    if (existingEmail) {
      throw new Error("Email is already registered");
    }

    // Check mobile number
    const existingMobile =
      await userRegistrationRepository.findByMobileNumber(mobileNumber);

    if (existingMobile) {
      throw new Error("Mobile number is already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await userRegistrationRepository.create({
      fullName,
      email: normalizedEmail,
      mobileNumber,
      password: hashedPassword,
      authProvider: "local",
      role,
      isEmailVerified: false,
      isMobileVerified: false,
      accountStatus: "active",
    });

    return user;
  }
}

export default new UserRegistrationService();
