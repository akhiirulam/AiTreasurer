import UserRegistration from "../../models/userRegistration.model";

class AdminRepository {
  // ==================================================
  // USER STATISTICS
  // ==================================================

  /**
   * Get total registered users.
   */
  async getTotalUsers() {
    return await UserRegistration.countDocuments();
  }

  /**
   * Get active users.
   */
  async getActiveUsers() {
    return await UserRegistration.countDocuments({
      accountStatus: "active",
    });
  }

  /**
   * Get inactive users.
   */
  async getInactiveUsers() {
    return await UserRegistration.countDocuments({
      accountStatus: {
        $ne: "active",
      },
    });
  }

  // ==================================================
  // RECENT USERS
  // ==================================================

  /**
   * Get recently registered users.
   */
  async getRecentUsers(limit = 5) {
    return await UserRegistration.find()
      .select("_id fullName email role accountStatus createdAt profileImage")
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .lean();
  }

  // ==================================================
  // GET ALL USERS
  // ==================================================

  /**
   * Get all platform users.
   */
  async getAllUsers() {
    return await UserRegistration.find()
      .select(
        "_id fullName email mobileNumber role accountStatus profileImage createdAt",
      )
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  // ==================================================
  // GET USER BY ID
  // ==================================================

  /**
   * Get one user by ID.
   */
  async getUserById(userId: string) {
    return await UserRegistration.findById(userId)
      .select(
        "_id fullName email mobileNumber role accountStatus profileImage createdAt",
      )
      .lean();
  }

  // ==================================================
  // UPDATE USER STATUS
  // ==================================================

  /**
   * Activate or deactivate a user account.
   */
  async updateUserStatus(userId: string, accountStatus: "active" | "inactive") {
    return await UserRegistration.findByIdAndUpdate(
      userId,
      {
        accountStatus,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select(
        "_id fullName email mobileNumber role accountStatus profileImage createdAt",
      )
      .lean();
  }
}

export default new AdminRepository();
