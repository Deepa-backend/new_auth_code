
import mongoose from "mongoose";

  const userRefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: String,
  blacklisted: { type: Boolean, default: false },
  expiresAt: Date,
});

const UserRefreshToken = mongoose.model("UserRefreshToken", userRefreshTokenSchema);

export default UserRefreshToken;