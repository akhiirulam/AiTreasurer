import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  userId: mongoose.Types.ObjectId;

  name: string;

  phone?: string;

  email?: string | null;

  address?: string | null;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
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
      required: true,
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

/**
 * A phone number identifies a customer within a user/shop.
 *
 * Sparse allows multiple customers to have null phone numbers.
 */
customerSchema.index(
  {
    userId: 1,
    phone: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model<ICustomer>("Customer", customerSchema);
