import jwt from "jsonwebtoken";
import UserRefreshToken from "../models/userRefreshToken.js";
export const generateTokens = async (user) => {
  try {
    const payload = {
      _id: user._id,
      roles: user.roles,
    };

    // Access token expires in 15 minutes
    const accessTokenExp = Math.floor(Date.now() / 1000) + 15 * 60;
    const accessToken = jwt.sign(
      { ...payload, exp: accessTokenExp },
      process.env.JWT_SECRET_KEY 
    );

    // Refresh token expires in 5 days
    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5;
    const refreshToken = jwt.sign(
      { ...payload, exp: refreshTokenExp },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
    );

    // Remove existing refresh tokens
    await UserRefreshToken.findOneAndDelete({ userId: user._id });

    // Save new refresh token
    await new UserRefreshToken({
      userId: user._id,
      token: refreshToken,
    }).save();

    return {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
    };
  } catch (error) {
    console.error("generateTokens error:", error);
    throw new Error("Unable to create access or refresh token");
  }
};
