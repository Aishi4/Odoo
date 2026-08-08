const userService = require('../services/user.service');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/errors');

/**
 * GET /api/users/profile
 * Get authenticated user's profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userProfile = await userService.findUserById(req.user.id);
    if (!userProfile) {
      throw new AppError('User profile not found', 404);
    }
    return successResponse(res, 200, 'User profile retrieved successfully', userProfile);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users
 * Get all registered users (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.findAllUsers();
    return successResponse(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 * Update authenticated user's profile (name, profile_image, address)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, profile_image, address } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      throw new AppError('Name cannot be empty', 400);
    }

    const updatedUser = await userService.updateUserProfile(req.user.id, {
      name,
      profile_image,
      address,
    });

    if (!updatedUser) {
      throw new AppError('User profile not found', 404);
    }

    return successResponse(res, 200, 'User profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getAllUsers,
  updateProfile,
};
