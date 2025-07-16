// validations/user.validation.js
import { z } from "zod";

export const registerUserSchema = z.object({
//   name: z
//     .string()
//     .min(3, "Name must be at least 3 characters")
//     .max(50, "Name must not exceed 50 characters"),

//   email: z.string().email("Invalid email address"),

//   phone: z
//     .string()
//     .regex(/^\+?\d{10,15}$/, "Invalid mobile number"),

//   password: z
//     .string()
//     .min(8, "Password must be at least 8 characters")
//     .max(32, "Password must be less than 32 characters"),
//      verificationMethod: z.enum(["email", "phone"], {
//     required_error: "Verification method is required",
//   }),
// });
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters"),

  email: z.string().email("Invalid email address"),

  phone: z
    .string()
    .regex(/^\+?\d{10,15}$/, "Invalid mobile number"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const LoginFormSchema = z.object({
  phone: z
    .string({
      required_error: "Phone number is required"
    })
    .min(10, "Phone must be at least 10 digits"),

  password: z
    .string({
      required_error: "Password is required"
    })
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/,
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
});

export const changePasswordSchema = z.object({
  password: z
    .string({
      required_error: "New password is required",
    })
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),

  password_confirmation: z
    .string({
      required_error: "Confirm password is required",
    }),
}).refine((data) => data.password === data.password_confirmation, {
  path: ['password_confirmation'],
  message: "New password and confirm password do not match",
});

export const forgotPasswordOtpSchema = z.object({

    phone: z
    .string({ required_error: "Phone number is required" })
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\+?\d{10,15}$/, "Invalid phone number format")
});