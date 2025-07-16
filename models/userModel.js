
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  phone: {
    type: String,
    required: true,
  },

  accountVerified: {
    type: Boolean,
    default: false,
  },

  verificationCode: Number,
  verificationCodeExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
userSchema.pre("save", async function (next) {
  console.log("👀 [pre-save] Password before any processing:", this.password);

  if (!this.isModified("password")) {
    console.log("⏩ [pre-save] Password not modified, skipping...");
    return next();
  }

  const isAlreadyHashed = typeof this.password === "string" && /^\$2[aby]\$/.test(this.password);
  console.log("🔍 [pre-save] isAlreadyHashed:", isAlreadyHashed);

  if (!isAlreadyHashed) {
    this.password = await bcrypt.hash(this.password, 10);
    console.log("🔐 [pre-save] Password was hashed now:", this.password);
  } else {
    console.log("✅ [pre-save] Already hashed. Skipping re-hash.");
  }

  next();
});


userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationCode = function () {
  const generateRandomFiveDigitNumber = () => {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return parseInt(firstDigit + remainingDigits);
  };

  this.verificationCode = generateRandomFiveDigitNumber();
  this.verificationCodeExpire = new Date(Date.now() + 5 * 60 * 1000);

  return this.verificationCode;
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

export const User = mongoose.model("User", userSchema);
