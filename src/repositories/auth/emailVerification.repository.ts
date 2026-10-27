import mongoose from "mongoose";

import EmailVerificationToken, {
  IEmailVerificationToken,
} from "../../models/emailVerificationToken.model";

class EmailVerificationRepository {
  /**
   * Remove all existing verification tokens
   * belonging to a user.
   */
  async deleteByUserId(userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return;
    }

    await EmailVerificationToken.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  /**
   * Create a new email verification token.
   *
   * Only the hashed token is stored in MongoDB.
   */
  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<IEmailVerificationToken> {
    return await EmailVerificationToken.create({
      userId: new mongoose.Types.ObjectId(data.userId),
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      used: false,
    });
  }

  /**
   * Find a valid, unused, non-expired verification token.
   */
  async findValidToken(
    tokenHash: string,
  ): Promise<IEmailVerificationToken | null> {
    return await EmailVerificationToken.findOne({
      tokenHash,
      used: false,
      expiresAt: {
        $gt: new Date(),
      },
    });
  }

  /**
   * Mark a verification token as used.
   */
  async markAsUsed(tokenId: string): Promise<IEmailVerificationToken | null> {
    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return null;
    }

    return await EmailVerificationToken.findByIdAndUpdate(
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

export default new EmailVerificationRepository();
