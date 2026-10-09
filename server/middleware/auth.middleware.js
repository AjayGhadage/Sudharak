import { verifyToken } from '../services/jwt.service.js';
import { sendError } from '../utils/response.js';
import { UserModel } from '../models/user.model.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Access denied. Authorization token missing.', 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendError(res, 'Invalid or expired token.', 403);
  }

  const user = UserModel.findById(decoded.userId);
  if (!user) {
    return sendError(res, 'User associated with token no longer exists.', 404);
  }

  req.user = user;
  next();
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      const user = UserModel.findById(decoded.userId);
      if (user) req.user = user;
    }
  }
  next();
};

export const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'User not authenticated.', 401);
    }
    if (req.user.role !== role) {
      return sendError(res, `Access denied. Requires ${role} role.`, 403);
    }
    next();
  };
};
