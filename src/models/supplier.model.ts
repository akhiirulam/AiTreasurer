import mongoose, { Schema, Document } from "mongoose";

export interface ISupplier extends Document {
  userId: mongoose.Types.ObjectId;

  name: string;

  phone?: string | null;

  email?: string | null;

  address?: string | null;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    email: {
      type: String,
      default: null,
      trim: true,
    },

    address: {
      type: String,
      default: null,
      trim: true,
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

supplierSchema.index(
  {
    userId: 1,
    name: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model<ISupplier>("Supplier", supplierSchema);
