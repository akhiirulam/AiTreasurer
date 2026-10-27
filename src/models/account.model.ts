import mongoose, { Document, Schema } from "mongoose";

/**
 * Actual account types used by the accounting system.
 */
export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "income"
  | "expense";

/**
 * User-specific account.
 *
 * This is NOT the global template.
 *
 * Example:
 *
 * AccountTemplate:
 *   Cash
 *   _id = ABC123
 *
 * Account for Shopkeeper A:
 *   userId = USER_A
 *   templateId = ABC123
 *
 * Account for Shopkeeper B:
 *   userId = USER_B
 *   templateId = ABC123
 */
export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;

  templateId: mongoose.Types.ObjectId | null;

  name: string;

  code: string;

  type: AccountType;

  category?: string | null;

  subCategory?: string | null;

  description?: string | null;
  normalBalance?: "debit" | "credit" | null;

  isSystem: boolean;

  isActive: boolean;
}

const accountSchema = new Schema<IAccount>(
  {
    /**
     * Shopkeeper who owns this account.
     */
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserRegistration",
      required: true,
      index: true,
    },

    /**
     * Global AccountTemplate reference.
     *
     * Example:
     *
     * AccountTemplate._id
     *          ↓
     * Account.templateId
     */
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "AccountTemplate",
      default: null,
      index: true,
    },

    /**
     * Actual account name for this shopkeeper.
     */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Actual accounting code.
     */
    code: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Accounting classification.
     */
    type: {
      type: String,
      enum: ["asset", "liability", "equity", "income", "expense"],
      required: true,
    },

    description: {
      type: String,
      default: null,
    },

    /**
     * true:
     *     Created automatically from a global template.
     *
     * false:
     *     Custom account.
     */
    isSystem: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      default: null,
    },

    subCategory: {
      type: String,
      default: null,
    },
    normalBalance: {
      type: String,
      enum: ["debit", "credit"],
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * A shopkeeper cannot have two accounts
 * with the same name.
 */
accountSchema.index(
  {
    userId: 1,
    name: 1,
  },
  {
    unique: true,
  },
);

/**
 * A shopkeeper cannot have two accounts
 * with the same code.
 */
accountSchema.index(
  {
    userId: 1,
    code: 1,
  },
  {
    unique: true,
  },
);

/**
 * A shopkeeper can create only ONE account
 * from a particular template.
 *
 * Example:
 *
 * USER_A + CashTemplate
 *     -> one Account
 *
 * USER_A + CashTemplate
 *     -> cannot create another one
 *
 * USER_B + CashTemplate
 *     -> allowed
 */
accountSchema.index(
  {
    userId: 1,
    templateId: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      templateId: {
        $type: "objectId",
      },
    },
  },
);

const Account = mongoose.model<IAccount>("Account", accountSchema);

export default Account;
