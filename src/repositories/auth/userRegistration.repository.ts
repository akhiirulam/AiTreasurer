import mongoose from "mongoose";

import UserRegistration, {
  IUserRegistration,
} from "../../models/userRegistration.model";

class UserRegistrationRepository {
  async findByEmail(email: string): Promise<IUserRegistration | null> {
    return await UserRegistration.findOne({
      email: email.toLowerCase(),
    });
  }

  async findByMobileNumber(
    mobileNumber: string,
  ): Promise<IUserRegistration | null> {
    return await UserRegistration.findOne({
      mobileNumber,
    });
  }

  async create(
    userData: Partial<IUserRegistration>,
  ): Promise<IUserRegistration> {
    const user = new UserRegistration(userData);

    return await user.save();
  }

  async softDeleteById(userId: string): Promise<IUserRegistration | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    return await UserRegistration.findByIdAndUpdate(
      userId,
      {
        $set: {
          accountStatus: "deleted",
          deletedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
  /**
   * Find a user by ID including the password.
   *
   * Used when verifying the current password.
   */
  async findByIdWithPassword(
    userId: string,
  ): Promise<IUserRegistration | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    return await UserRegistration.findById(userId).select("+password");
  }

  /**
   * Update the user's password.
   *
   * The password must already be hashed
   * before calling this method.
   */
  async updatePassword(
    userId: string,
    hashedPassword: string,
  ): Promise<IUserRegistration | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    return await UserRegistration.findByIdAndUpdate(
      userId,
      {
        $set: {
          password: hashedPassword,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async findById(userId: string): Promise<IUserRegistration | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    return await UserRegistration.findById(userId);
  }

  /**
   * Verify user's email.
   */
  async verifyEmail(userId: string): Promise<IUserRegistration | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    return await UserRegistration.findByIdAndUpdate(
      userId,
      {
        $set: {
          isEmailVerified: true,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
}

export default new UserRegistrationRepository();
