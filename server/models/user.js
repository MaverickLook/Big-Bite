import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    address: { type: String },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    phoneNumber: { type: String },
    deliveryAddress: { type: String },
    googleId: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
