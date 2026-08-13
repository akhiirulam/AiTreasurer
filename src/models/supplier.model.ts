import mongoose, { Schema, Document } from "mongoose";

export interface ISupplier extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

const supplierSchema = new Schema<ISupplier>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

supplierSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model<ISupplier>("Supplier", supplierSchema);
