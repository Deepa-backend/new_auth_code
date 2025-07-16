import express from "express"
import { registerUserSchema ,LoginFormSchema,changePasswordSchema,forgotPasswordOtpSchema,verifyForgotPasswordOtpSchema} from "../validations/userValidation.js"
import { validateRequest } from "../middlewares/validateRequest.js";
import {register,verifyOTP,userLogin ,userLogout,userChangePassword,
  userFogotPasswordOtpSender,
  userVerifyForgotPasswordOtp
} from  "../controllers/userController.js"
import { accessTokenAutoRefresh } from "../middlewares/accessTokenAutoRefresh.js";
import passport from "passport";

import otpLimiter from "../utils/otpLimiter.js";
const router = express.Router();
router.post("/register",validateRequest(registerUserSchema),otpLimiter,register)
router.post("/otp-verification",otpLimiter,verifyOTP)
router.post("/login",validateRequest(LoginFormSchema),otpLimiter,userLogin)
router.post('/forgot-password-send-otp',validateRequest(forgotPasswordOtpSchema), otpLimiter,userFogotPasswordOtpSender);
router.post('/verify-password-send-otp', validateRequest(verifyForgotPasswordOtpSchema),otpLimiter,userVerifyForgotPasswordOtp);
//protected Routes
//protected Routes
router.post('/logout', accessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), userLogout)
router.put(
  '/change-password',
  accessTokenAutoRefresh,
  validateRequest(changePasswordSchema), // ✅ this is the Zod schema
  passport.authenticate('jwt', { session: false }),
  userChangePassword
);
export default router;

