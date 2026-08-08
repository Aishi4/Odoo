const rentalPeriodService = require('../services/rental_period.service');
const { validateRentalPeriod } = require('../utils/validation');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/errors');

/**
 * POST /api/rental-periods
 * Create rental period (Admin only)
 */
const createRentalPeriod = async (req, res, next) => {
  try {
    const { name, duration, unit, status } = req.body;

    validateRentalPeriod({ name, duration, unit, status });

    const newPeriod = await rentalPeriodService.createRentalPeriod({
      name,
      duration,
      unit,
      status,
    });

    return successResponse(res, 201, 'Rental period created successfully', newPeriod);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rental-periods
 * Get all rental periods (Optional filter: ?status=ACTIVE)
 */
const getAllRentalPeriods = async (req, res, next) => {
  try {
    const { status } = req.query;
    const periods = await rentalPeriodService.getAllRentalPeriods(status);
    return successResponse(res, 200, 'Rental periods retrieved successfully', periods);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rental-periods/:id
 * Get single rental period by ID
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
 * Update rental period (Admin only)
 */
const updateRentalPeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, duration, unit, status } = req.body;

    if (duration !== undefined && (!Number.isInteger(Number(duration)) || Number(duration) <= 0)) {
      throw new AppError('Duration must be an integer greater than 0', 400);
    }
    if (unit && !['DAY', 'WEEK', 'MONTH'].includes(unit.toUpperCase())) {
      throw new AppError('Unit must be DAY, WEEK, or MONTH', 400);
    }
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new AppError('Status must be ACTIVE or INACTIVE', 400);
    }

    const updatedPeriod = await rentalPeriodService.updateRentalPeriod(id, {
      name,
      duration,
      unit,
      status,
    });

    if (!updatedPeriod) {
      throw new AppError('Rental period not found', 404);
    }

    return successResponse(res, 200, 'Rental period updated successfully', updatedPeriod);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/rental-periods/:id
 * Soft-delete rental period (Deactivate - Admin only)
 */
const deleteRentalPeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deactivatedPeriod = await rentalPeriodService.deactivateRentalPeriod(id);

    if (!deactivatedPeriod) {
      throw new AppError('Rental period not found', 404);
    }

    return successResponse(res, 200, 'Rental period deactivated successfully', deactivatedPeriod);
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
