import bcrypt from "bcrypt";

import userRegistrationRepository from "../../repositories/auth/userRegistration.repository";

interface DeleteAccountData {
  userId: string;
  password: string;
  confirmation: string;
}

class DeleteAccountService {
  /**
   * Permanently delete the authenticated user's account.
   */
  async deleteAccount(data: DeleteAccountData) {
    const { userId, password, confirmation } = data;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!password) {
      throw new Error("Password is required");
    }

    if (confirmation !== "DELETE") {
      throw new Error("Please type DELETE to confirm account deletion");
    }

    // Get the user including the password.
    const user = await userRegistrationRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Google accounts don't have a local password.
    if (user.authProvider !== "local") {
      throw new Error(
        "Account deletion for Google accounts is not available yet",
      );
    }

    if (!user.password) {
      throw new Error("Password is not configured for this account");
    }

    // Verify the user's password.
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Password is incorrect");
    }

    // Delete the user.
    const deletedUser = await userRegistrationRepository.softDeleteById(userId);

    if (!deletedUser) {
      throw new Error("Failed to delete account");
    }
    return {
      message: "Account deleted successfully",
    };
  }
}

export default new DeleteAccountService();
