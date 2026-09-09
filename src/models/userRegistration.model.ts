import mongoose, { Document, Schema } from "mongoose";

export interface IUserRegistration extends Document {
  fullName: string;
  email: string;
  mobileNumber: string;
  password?: string;
  authProvider: "local" | "google";
  googleId?: string | null;

  role: "owner" | "accountant" | "staff" | "viewer" | "admin";

  isEmailVerified: boolean;
  isMobileVerified: boolean;

  accountStatus: "active" | "inactive";

  profileImage?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const userRegistrationSchema = new Schema<IUserRegistration>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 8,
      select: false,

      required: function (this: IUserRegistration) {
        return this.authProvider === "local";
      },
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: ["owner", "accountant", "staff", "viewer", "admin"],
      default: "owner",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    accountStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const UserRegistration = mongoose.model<IUserRegistration>(
  "UserRegistration",
  userRegistrationSchema,
);

export default UserRegistration;
