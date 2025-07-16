import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
  message: {
    success: false,
    error: true,
    message: "Too many requests. Try again later.",
  },
});

export default otpLimiter;