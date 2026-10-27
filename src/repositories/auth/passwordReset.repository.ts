import mongoose from "mongoose";

import PasswordResetToken, {
  IPasswordResetToken,
} from "../../models/passwordResetToken.model";

class PasswordResetRepository {
  /**
   * Remove existing reset tokens for a user.
   *
   * This ensures that only the latest
   * password reset request remains valid.
   */
  async deleteByUserId(userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return;
    }

    await PasswordResetToken.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  /**
   * Create a new password reset token.
   */
  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<IPasswordResetToken> {
    return await PasswordResetToken.create({
      userId: new mongoose.Types.ObjectId(data.userId),
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      used: false,
    });
  }

  /**
   * Find a valid unused reset token.
   */
  async findValidToken(tokenHash: string): Promise<IPasswordResetToken | null> {
    return await PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: {
        $gt: new Date(),
      },
    });
  }

  /**
   * Mark a reset token as used.
   */
  async markAsUsed(tokenId: string): Promise<IPasswordResetToken | null> {
    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return null;
    }

    return await PasswordResetToken.findByIdAndUpdate(
      tokenId,
      {
        $set: {
          used: true,
        },
      },
      {
        new: true,
      },
    );
  }
}

export default new PasswordResetRepository();
