import mongoose from "mongoose";

import adminRepository from "../../repositories/admin/admin.repository";

type AccountStatus = "active" | "inactive";

class AdminService {
  // ==================================================
  // ADMIN DASHBOARD
  // ==================================================

  /**
   * Get Admin Dashboard data.
   */
  async getDashboard() {
    const [totalUsers, activeUsers, inactiveUsers, recentUsers] =
      await Promise.all([
        adminRepository.getTotalUsers(),

        adminRepository.getActiveUsers(),

        adminRepository.getInactiveUsers(),

        adminRepository.getRecentUsers(5),
      ]);

    // ==================================================
    // FORMAT RECENT USERS
    // ==================================================

    const formattedRecentUsers = recentUsers.map((user) => ({
      id: user._id.toString(),

      fullName: user.fullName,

      email: user.email,

      role: user.role,

      accountStatus: user.accountStatus,

      profileImage: user.profileImage ?? null,

      createdAt: user.createdAt,
    }));

    return {
      statistics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
      },

      recentUsers: formattedRecentUsers,
    };
  }

  // ==================================================
  // GET ALL USERS
  // ==================================================

  /**
   * Get all platform users.
   */
  async getAllUsers() {
    const users = await adminRepository.getAllUsers();

    return users.map((user) => ({
      id: user._id.toString(),

      fullName: user.fullName,

      email: user.email,

      mobileNumber: user.mobileNumber ?? null,

      role: user.role,

      accountStatus: user.accountStatus,

      profileImage: user.profileImage ?? null,

      createdAt: user.createdAt,
    }));
  }

  // ==================================================
  // GET USER BY ID
  // ==================================================

  /**
   * Get platform user details.
   */
  async getUserById(userId: string) {
    // Validate MongoDB ID

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await adminRepository.getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id.toString(),

      fullName: user.fullName,

      email: user.email,

      mobileNumber: user.mobileNumber ?? null,

      role: user.role,

      accountStatus: user.accountStatus,

      profileImage: user.profileImage ?? null,

      createdAt: user.createdAt,
    };
  }

  // ==================================================
  // UPDATE USER STATUS
  // ==================================================

  /**
   * Activate or deactivate a platform user.
   */
  async updateUserStatus(userId: string, accountStatus: AccountStatus) {
    // Validate MongoDB ID

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // Validate account status

    if (accountStatus !== "active" && accountStatus !== "inactive") {
      throw new Error("Account status must be active or inactive");
    }

    // Update user

    const user = await adminRepository.updateUserStatus(userId, accountStatus);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id.toString(),

      fullName: user.fullName,

      email: user.email,

      mobileNumber: user.mobileNumber ?? null,

      role: user.role,

      accountStatus: user.accountStatus,

      profileImage: user.profileImage ?? null,

      createdAt: user.createdAt,
    };
  }
}

export default new AdminService();
