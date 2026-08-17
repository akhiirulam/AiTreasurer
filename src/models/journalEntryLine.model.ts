import mongoose, { Document, Schema } from "mongoose";

export interface IJournalEntryLine extends Document {
  journalEntryId: mongoose.Types.ObjectId;

  accountId: mongoose.Types.ObjectId;

  debit: number;

  credit: number;
}

const journalEntryLineSchema = new Schema<IJournalEntryLine>(
  {
    journalEntryId: {
      type: Schema.Types.ObjectId,
      ref: "JournalEntry",
      required: true,
    },

    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    debit: {
      type: Number,
      default: 0,
      min: 0,
    },

    credit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IJournalEntryLine>(
  "JournalEntryLine",
  journalEntryLineSchema,
);
