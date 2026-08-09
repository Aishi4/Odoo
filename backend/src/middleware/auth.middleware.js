const { verifyToken } = require('../utils/jwt');
const userService = require('../services/user.service');
const AppError = require('../utils/errors');

/**
 * Authenticate JWT token and attach user to req.user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access denied. No authentication token provided.', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Access denied. Authentication token missing.', 401));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return next(new AppError('Invalid or expired authentication token.', 401));
    }

    const user = await userService.findUserById(decoded.id);
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize users based on roles (e.g., ADMIN, VENDOR, CUSTOMER)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || (!allowedRoles.includes(req.user.role) && req.user.role !== 'SUPERADMIN')) {
      return next(
        new AppError(`Access denied. Action requires one of the following roles: ${allowedRoles.join(', ')}`, 403)
      );
    }
    next();
  };
};

/**
 * Optional authentication middleware (attaches user if valid token present)
 */
const optionalAuthenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        let decoded;
        try {
          decoded = verifyToken(token);
          if (decoded && decoded.id) {
            const user = await userService.findUserById(decoded.id);
            if (user) {
              req.user = user;
            }
          }
        } catch (err) {}
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRoles,
};
