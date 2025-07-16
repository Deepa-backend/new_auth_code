import mongoose from "mongoose";

  const tempUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,

  //verificationCode: Number,
  //verificationCodeExpire: Date,
    otp: String,             // ✅ match controller
  otpExpiresAt: Date, 
}, { timestamps: true });

const TempUser = mongoose.model("TempUser", tempUserSchema);

export default  TempUser;
