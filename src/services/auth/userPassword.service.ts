import bcrypt from "bcrypt";

import userRegistrationRepository from "../../repositories/auth/userRegistration.repository";

interface ChangePasswordData {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

class UserPasswordService {
  /**
   * Change the authenticated user's password.
   */
  async changePassword(data: ChangePasswordData) {
    const { userId, currentPassword, newPassword } = data;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!currentPassword) {
      throw new Error("Current password is required");
    }

    if (!newPassword) {
      throw new Error("New password is required");
    }

    if (currentPassword === newPassword) {
      throw new Error(
        "New password must be different from the current password",
      );
    }

    // Get the user including the stored password.
    const user = await userRegistrationRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.authProvider !== "local") {
      throw new Error("Password change is not available for Google accounts");
    }

    if (!user.password) {
      throw new Error("Password change is not available for this account");
    }

    // Verify the current password.
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash the new password.
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password.
    await userRegistrationRepository.updatePassword(userId, hashedPassword);

    return {
      message: "Password changed successfully",
    };
  }
}

export default new UserPasswordService();
