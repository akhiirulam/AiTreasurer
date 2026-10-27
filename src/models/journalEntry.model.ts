import mongoose, { Document, Schema } from "mongoose";

export interface IJournalEntry extends Document {
  userId: mongoose.Types.ObjectId;

  transactionId: mongoose.Types.ObjectId;

  entryDate: Date;

  description: string;

  totalDebit: number;

  totalCredit: number;
}

const journalEntrySchema = new Schema<IJournalEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },

    entryDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    totalDebit: {
      type: Number,
      required: true,
      min: 0,
    },

    totalCredit: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IJournalEntry>(
  "JournalEntry",
  journalEntrySchema,
);
