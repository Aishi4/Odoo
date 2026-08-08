const AppError = require('./errors');

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

const validateRegister = ({ name, email, password }) => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('Name is required', 400);
  }
  if (!email || !isValidEmail(email)) {
    throw new AppError('A valid email address is required', 400);
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }
};

const validateLogin = ({ email, password }) => {
  if (!email || !isValidEmail(email)) {
    throw new AppError('A valid email address is required', 400);
  }
  if (!password || typeof password !== 'string') {
    throw new AppError('Password is required', 400);
  }
};

const validateProduct = ({ name, category, base_price, status }) => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('Product name is required', 400);
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    throw new AppError('Product category is required', 400);
  }
  if (base_price === undefined || base_price === null || isNaN(base_price) || Number(base_price) < 0) {
    throw new AppError('Base price must be a valid non-negative number', 400);
  }
  if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
    throw new AppError('Status must be either ACTIVE or INACTIVE', 400);
  }
};

const validateVariant = ({ brand, manufacturer, color, size }) => {
  const hasAttribute = [brand, manufacturer, color, size].some(
    (attr) => attr !== undefined && attr !== null && String(attr).trim() !== ''
  );
  if (!hasAttribute) {
    throw new AppError('At least one variant attribute (brand, manufacturer, color, or size) must be provided', 400);
  }
};

const validateRentalPeriod = ({ name, duration, unit, status }) => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('Rental period name is required', 400);
  }
  if (duration === undefined || duration === null || !Number.isInteger(Number(duration)) || Number(duration) <= 0) {
    throw new AppError('Duration must be an integer greater than 0', 400);
  }
  if (!unit || !['DAY', 'WEEK', 'MONTH'].includes(unit)) {
    throw new AppError('Unit must be DAY, WEEK, or MONTH', 400);
  }
  if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
    throw new AppError('Status must be either ACTIVE or INACTIVE', 400);
  }
};

module.exports = {
  isValidEmail,
  validateRegister,
  validateLogin,
  validateProduct,
  validateVariant,
  validateRentalPeriod,
};
