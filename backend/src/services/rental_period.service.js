const { RentalPeriod } = require('../models');

/**
 * Create a new rental period
 */
const createRentalPeriod = async ({ name, duration, unit, status = 'ACTIVE' }) => {
  const rentalPeriod = await RentalPeriod.create({
    name: name.trim(),
    duration: Number(duration),
    unit: unit.toUpperCase(),
    status: status || 'ACTIVE',
  });
  return rentalPeriod.toJSON();
};

/**
 * Get all rental periods (with optional status filter)
 */
const getAllRentalPeriods = async (statusFilter) => {
  const whereClause = {};
  if (statusFilter) {
    whereClause.status = statusFilter;
  }
  const periods = await RentalPeriod.findAll({
    where: whereClause,
    order: [['duration', 'ASC']],
  });
  return periods.map((p) => p.toJSON());
};

/**
 * Get rental period by ID
 */
const getRentalPeriodById = async (id) => {
  const period = await RentalPeriod.findByPk(id);
  return period ? period.toJSON() : null;
};

/**
 * Update rental period
 */
const updateRentalPeriod = async (id, updateData) => {
  const period = await RentalPeriod.findByPk(id);
  if (!period) return null;

  if (updateData.name !== undefined) period.name = updateData.name.trim();
  if (updateData.duration !== undefined) period.duration = Number(updateData.duration);
  if (updateData.unit !== undefined) period.unit = updateData.unit.toUpperCase();
  if (updateData.status !== undefined) period.status = updateData.status;

  await period.save();
  return period.toJSON();
};

/**
 * Deactivate rental period (soft-delete)
 */
const deactivateRentalPeriod = async (id) => {
  const period = await RentalPeriod.findByPk(id);
  if (!period) return null;

  period.status = 'INACTIVE';
  await period.save();
  return period.toJSON();
};

module.exports = {
  createRentalPeriod,
  getAllRentalPeriods,
  getRentalPeriodById,
  updateRentalPeriod,
  deactivateRentalPeriod,
};
