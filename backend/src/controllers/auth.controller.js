const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const { validateRegister, validateLogin, isValidEmail } = require('../utils/validation');
const { generateToken } = require('../utils/jwt');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/errors');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    validateRegister({ name, email, password });

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      throw new AppError('Email address is already registered', 409);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userService.createUser({
      name,
      email,
      hashedPassword,
      role: role || 'CUSTOMER',
    });

    const responseData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return successResponse(res, 201, 'User registered successfully', responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    validateLogin({ email, password });

    const user = await userService.findUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return successResponse(res, 200, 'Login successful', {
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'Current user retrieved successfully', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      throw new AppError('A valid email address is required', 400);
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      throw new AppError('User with this email address does not exist', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await userService.setResetPasswordToken(email, resetToken, expiresAt);

    try {
      await emailService.sendPasswordResetEmail(email, resetToken, user.name);
    } catch (mailError) {
      console.error('Nodemailer Error:', mailError);
    }

    return successResponse(res, 200, 'Password reset token sent to email successfully', {
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      throw new AppError('Password reset token is required', 400);
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long', 400);
    }

    const userInstance = await userService.findUserByResetToken(token);
    if (!userInstance) {
      throw new AppError('Invalid or expired password reset token', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userService.resetUserPassword(userInstance, hashedPassword);

    return successResponse(res, 200, 'Password reset successful. You can now login with your new password.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};
