import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';
import { generateToken } from '../services/jwt.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

// In-memory OTP storage: email -> { otp, expiresAt, isVerified, resetToken }
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Password Strength Validator
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z)' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter (a-z)' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one digit (0-9)' };
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
  return { valid: true };
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email address format', 400);
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      return sendError(res, passCheck.message, 400);
    }

    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      return sendError(res, 'Email is already registered. Please login or reset your password.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = UserModel.create({
      name,
      email,
      password_hash,
      role: role || 'CITIZEN',
      auth_provider: 'LOCAL'
    });

    const token = generateToken({ userId: newUser.id, email: newUser.email });

    return sendSuccess(res, 'User registered successfully', {
      user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.profile_image, role: newUser.role },
      token
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 'Server error during registration');
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const user = UserModel.findByEmail(email);
    if (!user) {
      return sendError(res, 'Invalid credentials or account does not exist', 401);
    }

    if (user.auth_provider === 'GOOGLE' && !user.password_hash) {
      return sendError(res, 'Please login with Google', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return sendSuccess(res, 'Login successful', {
      user: { id: user.id, name: user.name, email: user.email, avatar: user.profile_image, role: user.role },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Server error during login');
  }
};

export const googleOAuth = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email) {
      return sendError(res, 'Google ID and email required', 400);
    }

    let user = UserModel.findByGoogleId(googleId) || UserModel.findByEmail(email);

    if (!user) {
      user = UserModel.create({
        name,
        email,
        google_id: googleId,
        profile_image: picture,
        auth_provider: 'GOOGLE'
      });
    } else if (!user.google_id) {
      user = UserModel.update(user.id, {
        google_id: googleId,
        auth_provider: 'LOCAL_AND_GOOGLE'
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return sendSuccess(res, 'Google login successful', {
      user: { id: user.id, name: user.name, email: user.email, avatar: user.profile_image, role: user.role },
      token
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return sendError(res, 'Server error during Google auth');
  }
};

export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email address format', 400);
    }

    const user = UserModel.findByEmail(email);
    return sendSuccess(res, 'Email status retrieved', { exists: !!user, email });
  } catch (error) {
    return sendError(res, 'Failed to check email status');
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email address is required', 400);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Please enter a valid email address format', 400);
    }

    const user = UserModel.findByEmail(email);
    if (!user) {
      return sendError(res, 'No registered user account found with this email', 404);
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email.toLowerCase(), { otp, expiresAt, isVerified: false });

    console.log(`[OTP DEBUG] Sent OTP ${otp} to ${email}`);

    return sendSuccess(res, `OTP code generated and sent to ${email}`, {
      email,
      otp, // Demo friendly for testing
      expiresInMinutes: 10
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return sendError(res, 'Failed to process forgot password request');
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return sendError(res, 'Email and OTP pin are required', 400);

    const storedData = otpStore.get(email.toLowerCase());
    if (!storedData) {
      return sendError(res, 'No active OTP request found for this email. Please request a new OTP.', 400);
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return sendError(res, 'OTP has expired. Please request a new code.', 400);
    }

    if (storedData.otp !== otp.toString().trim()) {
      return sendError(res, 'Invalid OTP pin. Please check and re-enter.', 400);
    }

    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    otpStore.set(email.toLowerCase(), { ...storedData, isVerified: true, resetToken });

    return sendSuccess(res, 'OTP verified successfully!', { resetToken, email });
  } catch (error) {
    return sendError(res, 'OTP verification failed');
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !newPassword) {
      return sendError(res, 'Email and new password are required', 400);
    }

    const storedData = otpStore.get(email.toLowerCase());
    if (!storedData || !storedData.isVerified || (resetToken && storedData.resetToken !== resetToken)) {
      return sendError(res, 'Unauthorized or expired password reset session. Please verify OTP again.', 401);
    }

    const passCheck = validatePasswordStrength(newPassword);
    if (!passCheck.valid) {
      return sendError(res, passCheck.message, 400);
    }

    const user = UserModel.findByEmail(email);
    if (!user) {
      return sendError(res, 'User account not found', 404);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    UserModel.update(user.id, { password_hash });

    otpStore.delete(email.toLowerCase());

    return sendSuccess(res, 'Password reset successfully! You can now log in with your new password.');
  } catch (error) {
    console.error('Reset password error:', error);
    return sendError(res, 'Failed to reset password');
  }
};

export const getMe = (req, res) => {
  try {
    const user = req.user;
    return sendSuccess(res, 'User profile retrieved', {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.profile_image,
      role: user.role,
      location: user.location,
      karma: user.karma || 10,
      createdAt: user.created_at
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch user profile');
  }
};

