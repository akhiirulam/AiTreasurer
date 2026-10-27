import bcrypt from "bcrypt";

import userRegistrationRepository from "../../repositories/auth/userRegistration.repository";
import emailVerificationService from "./emailVerification.service";

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

    // ==================================================
    // 1. Check email
    // ==================================================

    const existingEmail =
      await userRegistrationRepository.findByEmail(normalizedEmail);

    if (existingEmail) {
      throw new Error("Email is already registered");
    }

    // ==================================================
    // 2. Check mobile number
    // ==================================================

    const existingMobile =
      await userRegistrationRepository.findByMobileNumber(mobileNumber);

    if (existingMobile) {
      throw new Error("Mobile number is already registered");
    }

    // ==================================================
    // 3. Hash password
    // ==================================================

    const hashedPassword = await bcrypt.hash(password, 12);

    // ==================================================
    // 4. Create user
    // ==================================================

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

    // ==================================================
    // 5. Send email verification
    // ==================================================

    await emailVerificationService.sendVerificationEmail(user._id.toString());

    // ==================================================
    // 6. Return registration result
    // ==================================================

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
      },
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  }
}

export default new UserRegistrationService();
