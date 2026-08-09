const rentalPeriodService = require('../services/rental_period.service');
const { validateRentalPeriod } = require('../utils/validation');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/errors');

/**
 * POST /api/rental-periods
 * Create rental period — scoped to the authenticated vendor
 */
const createRentalPeriod = async (req, res, next) => {
  try {
    const { name, duration, unit, discount_percent, status } = req.body;
    const vendorId = req.user?.id || null;

    validateRentalPeriod({ name, duration, unit, status });

    const newPeriod = await rentalPeriodService.createRentalPeriod({
      vendor_id: vendorId,
      name,
      duration,
      unit,
      discount_percent,
      status,
    });

    return successResponse(res, 201, 'Rental period created successfully', newPeriod);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rental-periods
 * Get rental periods — vendors see own + global; admins see all
 */
const getAllRentalPeriods = async (req, res, next) => {
  try {
    const { status } = req.query;
    const user = req.user;

    // Vendors only see their own + global periods
    const vendorId = user?.role === 'VENDOR' ? user.id : null;

    const periods = await rentalPeriodService.getAllRentalPeriods(status, vendorId);
    return successResponse(res, 200, 'Rental periods retrieved successfully', periods);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rental-periods/:id
 */
const getRentalPeriodById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const period = await rentalPeriodService.getRentalPeriodById(id);

    if (!period) {
      throw new AppError('Rental period not found', 404);
    }

    return successResponse(res, 200, 'Rental period retrieved successfully', period);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/rental-periods/:id
 * Update — vendors can only update their own periods
 */
const updateRentalPeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, duration, unit, discount_percent, status } = req.body;
    const user = req.user;

    if (duration !== undefined && (!Number.isInteger(Number(duration)) || Number(duration) <= 0)) {
      throw new AppError('Duration must be an integer greater than 0', 400);
    }
    if (unit && !['HOUR', 'DAY', 'WEEK', 'MONTH'].includes(unit.toUpperCase())) {
      throw new AppError('Unit must be HOUR, DAY, WEEK, or MONTH', 400);
    }
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new AppError('Status must be ACTIVE or INACTIVE', 400);
    }

    const vendorId = user?.role === 'VENDOR' ? user.id : null;
    const userRole = user?.role;

    const updatedPeriod = await rentalPeriodService.updateRentalPeriod(
      id,
      { name, duration, unit, discount_percent, status },
      vendorId,
      userRole
    );

    if (!updatedPeriod) {
      throw new AppError('Rental period not found or access denied', 404);
    }

    return successResponse(res, 200, 'Rental period updated successfully', updatedPeriod);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/rental-periods/:id
 * Hard-delete — vendors can only delete their own periods
 */
const deleteRentalPeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const vendorId = user?.role === 'VENDOR' ? user.id : null;
    const userRole = user?.role;

    const result = await rentalPeriodService.deleteRentalPeriod(id, vendorId, userRole);

    if (!result) {
      throw new AppError('Rental period not found or access denied', 404);
    }

    return successResponse(res, 200, 'Rental period deleted successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRentalPeriod,
  getAllRentalPeriods,
  getRentalPeriodById,
  updateRentalPeriod,
  deleteRentalPeriod,
};
