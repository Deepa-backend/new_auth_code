

import { verifyRefreshToken } from "../utils/verifyRefreshToken.js";
//import { UserRefreshToken } from "../models/userRefreshToken.js";

import UserRefreshToken from "../models/userRefreshToken.js"
import { User } from "../models/userModel.js";
import { generateTokens } from "./generateToken.js";

export const refreshAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies?.refresh_token;
    console.log("🔁 Received refresh token:", oldRefreshToken);

    if (!oldRefreshToken) {
      return res.status(401).json({ error: true, message: "Refresh token missing" });
    }

    const { tokenDetails, error } = await verifyRefreshToken(oldRefreshToken);

    if (error || !tokenDetails) {
      console.warn("❌ Invalid refresh token", { error, tokenDetails });
      return res.status(401).json({ error: true, message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(tokenDetails._id);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const userTokenInDB = await UserRefreshToken.findOne({ userId: tokenDetails._id });

    if (
      !userTokenInDB ||
      oldRefreshToken !== userTokenInDB.token ||
      userTokenInDB.blacklisted
    ) {
      return res.status(401).json({ error: true, message: "Unauthorized access" });
    }

    const {
      accessToken,
      accessTokenExp,
      refreshToken,
      refreshTokenExp,
    } = await generateTokens(user);

    await UserRefreshToken.findOneAndUpdate(
      { userId: tokenDetails._id },
      {
        token: refreshToken,
        expiresAt: new Date(refreshTokenExp * 1000),
        blacklisted: false,
      }
    );

    // ✅ Set cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: accessTokenExp * 1000 - Date.now(),
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: refreshTokenExp * 1000 - Date.now(),
    });

    return res.status(200).json({
      error: false,
      message: "Token refreshed successfully",
      access_token: accessToken,
      access_token_exp: accessTokenExp,
      refresh_token: refreshToken,
      refresh_token_exp: refreshTokenExp,
    });
  } catch (err) {
    console.error("🔴 refreshAccessToken error:", err);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
