import mongoose from "mongoose";

import Account, { AccountType, IAccount } from "../../models/account.model";

interface CreateAccountData {
  userId: string;

  templateId: string | null;

  name: string;

  code: string;

  type: AccountType;

  category?: string | null;

  subCategory?: string | null;

  normalBalance?: "debit" | "credit" | null;

  description?: string | null;

  isSystem: boolean;
}

class AccountRepository {
  async create(data: CreateAccountData): Promise<IAccount> {
    return await Account.create({
      userId: new mongoose.Types.ObjectId(data.userId),

      templateId: data.templateId
        ? new mongoose.Types.ObjectId(data.templateId)
        : null,

      name: data.name.trim(),

      code: data.code.trim(),

      type: data.type,
      category: data.category ?? null,

      subCategory: data.subCategory ?? null,

      normalBalance: data.normalBalance ?? null,

      description: data.description ?? null,

      isSystem: data.isSystem ?? false,
    });
  }

  async findByTemplate(
    userId: string,
    templateId: string,
  ): Promise<IAccount | null> {
    return await Account.findOne({
      userId: new mongoose.Types.ObjectId(userId),

      templateId: new mongoose.Types.ObjectId(templateId),
    });
  }

  async findByName(userId: string, name: string): Promise<IAccount | null> {
    return await Account.findOne({
      userId: new mongoose.Types.ObjectId(userId),

      name: name.trim(),
    });
  }

  async findById(userId: string, accountId: string): Promise<IAccount | null> {
    return await Account.findOne({
      _id: new mongoose.Types.ObjectId(accountId),

      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  async findAllByUser(userId: string): Promise<IAccount[]> {
    const objectId = new mongoose.Types.ObjectId(userId);

    const accounts = await Account.find({
      userId: objectId,
    }).sort({
      code: 1,
    });

    return accounts;
  }

  async findByType(userId: string, type: AccountType): Promise<IAccount[]> {
    return await Account.find({
      userId: new mongoose.Types.ObjectId(userId),

      type,
    }).sort({
      code: 1,
    });
  }

  async findMaxCodeByType(userId: string, type: AccountType): Promise<number> {
    const accounts = await this.findByType(userId, type);

    const codes = accounts
      .map((account) => Number(account.code))
      .filter((code) => !Number.isNaN(code));

    if (codes.length === 0) {
      return this.getBaseCode(type);
    }

    return Math.max(...codes);
  }

  async update(
    userId: string,
    accountId: string,
    data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
    },
  ): Promise<IAccount | null> {
    if (data.name) {
      data.name = data.name.trim();
    }

    return await Account.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(accountId),

        userId: new mongoose.Types.ObjectId(userId),
      },

      data,

      {
        new: true,
        runValidators: true,
      },
    );
  }

  async delete(userId: string, accountId: string): Promise<IAccount | null> {
    return await Account.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(accountId),

      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  private getBaseCode(type: AccountType): number {
    switch (type) {
      case "asset":
        return 1000;

      case "liability":
        return 2000;

      case "equity":
        return 3000;

      case "income":
        return 4000;

      case "expense":
        return 6000;

      default:
        return 9000;
    }
  }
}

export default new AccountRepository();
