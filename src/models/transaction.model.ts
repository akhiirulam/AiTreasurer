import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;

  rawText: string;

  type: "income" | "expense" | "purchase" | "sale" | "payment" | "capital";

  amount: number;

  description: string;

  category: string | null;

  customer: string | null;

  supplierId: mongoose.Types.ObjectId | null;

  transactionDate: Date;

  paymentStatus:
    | "paid"
    | "unpaid"
    | "partial"
    | "unknown"
    | "completed"
    | "pending";

  paidAmount: number;

  outstandingAmount: number;

  debitAccount: string;

  creditAccount: string;
  debitAccountId: mongoose.Types.ObjectId;
  creditAccountId: mongoose.Types.ObjectId;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rawText: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["income", "expense", "purchase", "sale", "payment", "capital"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: null,
    },

    customer: {
      type: String,
      default: null,
    },

    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },

    transactionDate: {
      type: Date,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "partial", "unknown", "pending", "completed"],
      default: "unknown",
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    outstandingAmount: {
      type: Number,
      default: 0,
    },

    debitAccount: {
      type: String,
      required: true,
    },

    creditAccount: {
      type: String,
      required: true,
    },
    debitAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    creditAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
