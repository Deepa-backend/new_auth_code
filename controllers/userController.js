 import { config } from "dotenv";
config();
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import sendResponse from "../utils/sendResponse.js";
import { sendToken } from "../utils/sendToken.js";
import twilioPkg from "twilio";
import bcrypt from "bcrypt";
import { generateTokens } from "../utils/generateToken.js";
import { setTokensCookies } from "../utils/setTokensCookies.js";
import UserRefreshToken from "../models/userRefreshToken.js";
import { generateOtp } from "../utils/generateOtp.js";
import { email } from "zod";
import TempUser from "../models/tempUserModel.js";
const twilio = twilioPkg;
const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
import dotenv from "dotenv";
dotenv.config();

const SALT = process.env.SALT;


if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  throw new Error("❌ TWILIO credentials missing from .env");
}

const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);


export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    console.log("📥 Registration input:", { name, email, phone });

    // Validate input
    if (!name || !email || !phone || !password) {
      return sendResponse(res, "All fields are required", 400, false);
    }

     const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
      accountVerified: true,
    });

    if (existingUser) {
      return sendResponse(res, "User already exists", 400, false);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(Number(SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save TempUser
    await TempUser.create({
      name,
      email,
      phone : formattedPhone,
      password: hashedPassword,
      //verificationCode: otp,
      //verificationCodeExpire: expireTime,
      otp: otp,
  otpExpiresAt: expireTime,
    });

    console.log("✅ TempUser created. OTP:", otp);

    // Send OTP via Twilio SMS

    await client.messages.create({
      body: `Your verification code is ${otp}`,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${formattedPhone}`,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
    });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return sendResponse(res, "Phone and OTP are required", 400, false);
    }

    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    // Get TempUser with this phone
    const tempUser = await TempUser.findOne({ phone: formattedPhone });

    if (!tempUser) {
      return sendResponse(res, "No OTP request found for this phone", 404, false);
    }

    console.log("🧪 Stored OTP:", tempUser.otp);
console.log("🧪 Type of stored OTP:", typeof tempUser.otp);
console.log("🧪 Comparison result:", String(tempUser.otp) === String(otp));

console.log("📦 Full TempUser document:", tempUser);
    // Validate OTP
   // 🔒 Compare as string to avoid number vs string issues
    if (String(tempUser.otp) !== String(otp)) {
  return sendResponse(res, "Invalid OTP", 400, false);
}

    // Check expiry
    if (tempUser.otpExpiresAt < new Date()) {
  await TempUser.deleteOne({ phone: formattedPhone });
  return sendResponse(res, "OTP has expired. Please register again.", 400, false);
}

    // Check if already verified (edge case)
    const existingUser = await User.findOne({ phone: formattedPhone });
    if (existingUser) {
      await TempUser.deleteOne({ phone: formattedPhone });
      return sendResponse(res, "User already verified. Please login.", 400, false);
    }
console.log("✅ OTP matched, creating permanent user...");
    // Save in permanent User DB
    await User.create({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
      accountVerified: true,
    });

    // Clean up temp data
    await TempUser.deleteOne({ phone: formattedPhone });

    return res.status(200).json({
      success: true,
      message: "OTP verified and user registered successfully",
    });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during OTP verification",
    });
  }
};


export const userLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
       
   console.log("🔐 Login attempt with:", { phone, password });
   // const user = await User.findOne({ email });
const user = await User.findOne({ phone }).select("+password");

   if (!user) {
      console.log("❌ No user found with email:", email);
      return sendResponse(res, "Invalid phone no or password", 404, false);
    }

    console.log("✅ User found:", { phone: user.phone, id: user._id });

    // Log actual DB password hash (for dev only, not in prod)
    console.log("🔒 Hashed password in DB:", user.password);

if (!user || !user.password) {
      return sendResponse(res, "Invalid email or password", 404, false);
    }

    const isMatchedPassword = await bcrypt.compare(password, user.password);

    if (!isMatchedPassword) {
      console.log("🔍 Password match result:", isMatchedPassword);
      return sendResponse(res, "Invalid email or password", 400, false);
    }

    //const tokens = await generateToken(user);
    const tokens = await generateTokens(user);

    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = tokens;

    setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp);

    return sendResponse(res, "Login Successfully", 200, true, {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.role?.[0],
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      access_token_exp: accessTokenExp,
      is_auth: true,
    });
  } catch (err) {
    console.error("Login error:", err);
    sendResponse(res, "Unable to Login please try again later", 500, false);
  }
};




export const userLogout = async (req, res) => {
  try {
    if (req.user && req.user.id) {
      await UserRefreshToken.deleteMany({ userId: req.user.id });
    } else if (req.body && req.body.userId) {
      await UserRefreshToken.deleteMany({ userId: req.body.userId });
    }

    // Clear cookies, including the path option to exactly match cookie set
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict', path: '/' });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', path: '/' });
    res.clearCookie('is_auth', { sameSite: 'strict', path: '/' });

    return sendResponse(res, "Logout successful", 200, true);
  } catch (error) {
    console.log(error);
    return sendResponse(res, "Unable to logout please try again later", 500, false);
  }
};


//change password
export const userChangePassword = async (req, res) => {
    try {
        const { password, password_confirmation } = req.body;

        if (password !== password_confirmation) {
            return sendResponse(res, "New Password and Confirm New Password don't match")
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const newHashedPassword = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(req.user._id, {
            $set: {
                password: newHashedPassword
            }
        })

        return sendResponse(res, "Password changed successfully", 200, true)

    } catch (error) {
        console.log(error);
        return sendResponse(res, "Unable to Change Password please try again later", 500, false)
    }

  }
export  const userFogotPasswordOtpSender = async (req,res)=>{
try{
      console.log("OTP SEND REQUEST HIT"); 
 const { phone } = req.body;
 
 const user =await User.findOne ({ phone })
 
 if(!user)
 {
  return sendResponse (res, "User not  found " , 404, false)
      console.log("Generated OTP:", otp); // ✅ debug
 }

 const { otp, otpExpiresAt } = generateOtp(10);
await TempUser.findOneAndUpdate(
  { phone },
  { otp, otpExpiresAt },
  { upsert: true, new: true }
);

 console.log (`OTP for $ {phone} : ${otp} ${user.name}`);


await client.messages.create({
      body: `Your password reset OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return sendResponse(res, "OTP sent successfully via SMS", 200, true);
  }
catch (error)
{
  console.log (error)
  return  sendResponse (res, "Internal sever error" , 500, false);
}



    }
    export const userVerifyForgotPasswordOtp = async (req, res) => {
  try {
    const { phone, otp, newPassword, confirmPassword } = req.body;
   console.log("➡️ Input:", { phone, otp, newPassword, confirmPassword });
    const checkTempUser = await TempUser.findOne({ phone });
    console.log("🟡 TempUser Found:", checkTempUser);
    if (
      !checkTempUser ||
      checkTempUser.otp !== otp ||
      checkTempUser.otpExpiresAt < new Date()
    ) {
      return sendResponse(res, "Invalid or expired OTP", 400, false);
    }

    if (newPassword !== confirmPassword) {
      return sendResponse(res, "New password and confirm password do not match", 400, false);
    }

    // ✅ find user by phone or email (depending on your User schema)
    const user = await User.findOne({ phone }); // or { email: checkTempUser.email }
    if (!user) {
      return sendResponse(res, "User not found", 404, false);
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await TempUser.deleteOne({ phone }); // ✅ clear temp data

    return sendResponse(res, "Password updated successfully", 200, true);
  } catch (error) {
    console.error("verify forgot password OTP error:", error);
    return sendResponse(res, "Internal server error", 500, false);
  }
};






