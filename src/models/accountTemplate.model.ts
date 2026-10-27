import mongoose, { Schema } from "mongoose";

export type AccountTemplateType =
  | "asset"
  | "liability"
  | "equity"
  | "income"
  | "expense";

export type NormalBalance = "debit" | "credit";

export interface IAccountTemplate {
  code: string;

  _id: mongoose.Types.ObjectId;

  name: string;

  type: AccountTemplateType;

  category: string;

  subCategory: string;

  normalBalance: NormalBalance;

  description?: string | null;

  isSystem: boolean;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountTemplateInput {
  code: string;
  name: string;

  type: AccountTemplateType;

  category: string;

  subCategory: string;

  normalBalance: NormalBalance;

  description?: string | null;

  isSystem?: boolean;

  isActive?: boolean;
}

const accountTemplateSchema = new Schema<IAccountTemplate>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["asset", "liability", "equity", "income", "expense"],
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subCategory: {
      type: String,
      required: true,
      trim: true,
    },

    normalBalance: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },

    description: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },

    isSystem: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

accountTemplateSchema.index({
  type: 1,
  category: 1,
});

accountTemplateSchema.index({
  name: 1,
});

const AccountTemplate = mongoose.model<IAccountTemplate>(
  "AccountTemplate",
  accountTemplateSchema,
);

export default AccountTemplate;
