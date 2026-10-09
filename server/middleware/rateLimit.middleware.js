import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

// Rate limiter for expensive AI Analysis endpoints (Max 6 requests per 1 minute per IP)
export const aiAnalysisLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 6,
  handler: (req, res) => {
    return sendError(res, 'Too many AI analysis requests. Please wait 1 minute before trying again.', 429);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for OTP requests (Max 3 OTP requests per 10 minutes)
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  handler: (req, res) => {
    return sendError(res, 'Too many OTP requests. Please wait 10 minutes before requesting a new OTP.', 429);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for general authentication (Max 10 login/signup attempts per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  handler: (req, res) => {
    return sendError(res, 'Too many login attempts. Account temporarily locked for 15 minutes.', 429);
  },
  standardHeaders: true,
  legacyHeaders: false,
});
