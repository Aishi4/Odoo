const { Op } = require('sequelize');
const User = require('../models/user.model');

/**
 * Find user by email (includes password hash)
 */
const findUserByEmail = async (email) => {
  const user = await User.findOne({
    where: { email: email.toLowerCase().trim() },
  });
  return user ? user.toJSON() : null;
};

/**
 * Find user by ID (excludes password)
 */
const findUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expires'] },
  });
  return user ? user.toJSON() : null;
};

/**
 * Create a new user with optional role (defaults to CUSTOMER)
 */
const createUser = async ({ name, email, hashedPassword, role = 'CUSTOMER' }) => {
  const validRoles = ['CUSTOMER', 'VENDOR', 'ADMIN'];
  const userRole = validRoles.includes(role) ? role : 'CUSTOMER';

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: userRole,
  });

  const userData = user.toJSON();
  delete userData.password;
  return userData;
};

/**
 * Update user profile
 */
const updateUserProfile = async (id, { name, profile_image, address }) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  if (name !== undefined) user.name = name.trim();
  if (profile_image !== undefined) user.profile_image = profile_image;
  if (address !== undefined) user.address = address;

  await user.save();

  const updatedUserData = user.toJSON();
  delete updatedUserData.password;
  delete updatedUserData.reset_password_token;
  delete updatedUserData.reset_password_expires;
  return updatedUserData;
};

/**
 * Save password reset token and expiration
 */
const setResetPasswordToken = async (email, resetToken, expiresAt) => {
  const user = await User.findOne({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user) return null;

  user.reset_password_token = resetToken;
  user.reset_password_expires = expiresAt;
  await user.save();

  return user.toJSON();
};

/**
 * Find user by valid reset token
 */
const findUserByResetToken = async (resetToken) => {
  const user = await User.findOne({
    where: {
      reset_password_token: resetToken,
      reset_password_expires: {
        [Op.gt]: new Date(),
      },
    },
  });
  return user ? user : null;
};

/**
 * Update user password and clear reset token
 */
const resetUserPassword = async (userInstance, newHashedPassword) => {
  userInstance.password = newHashedPassword;
  userInstance.reset_password_token = null;
  userInstance.reset_password_expires = null;
  await userInstance.save();

  const updatedUser = userInstance.toJSON();
  delete updatedUser.password;
  return updatedUser;
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  setResetPasswordToken,
  findUserByResetToken,
  resetUserPassword,
};
