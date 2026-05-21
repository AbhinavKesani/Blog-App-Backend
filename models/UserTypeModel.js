import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "first name is required"],
    },

    lastName: {
      type: String,
      required: [true, "last name is required"],
    },

    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "password is required"],
    },

    profileImageUrl: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["AUTHOR", "USER", "ADMIN"],
      required: [true, "invalid role"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,

    // FIXED HERE
    strict: true,

    versionKey: false,
  }
);

// create model
export const UserTypeModel = model("user", userSchema);