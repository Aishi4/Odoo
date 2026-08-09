const { Op } = require('sequelize');
const { RentalPeriod } = require('../models');

/**
 * Create a new rental period scoped to the vendor
 */
const createRentalPeriod = async ({ vendor_id, name, duration, unit, discount_percent = 0, status = 'ACTIVE' }) => {
  const rentalPeriod = await RentalPeriod.create({
    vendor_id: vendor_id || null,
    name: name.trim(),
    duration: Number(duration),
    unit: unit.toUpperCase(),
    discount_percent: Number(discount_percent) || 0,
    status: status || 'ACTIVE',
  });
  return rentalPeriod.toJSON();
};

/**
 * Get rental periods for a specific vendor (vendor's own + global/platform ones)
 */
const getAllRentalPeriods = async (statusFilter, vendorId = null) => {
  const whereClause = {};

  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  // Vendors see their own periods + global periods (vendor_id = null)
  if (vendorId) {
    whereClause[Op.or] = [
      { vendor_id: vendorId },
      { vendor_id: null },
    ];
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
 * Update rental period.
 * - ADMIN/SUPERADMIN (vendorId=null): can update any period
 * - VENDOR (vendorId set): can only update their own (vendor_id matches)
 */
const updateRentalPeriod = async (id, updateData, vendorId = null, userRole = null) => {
  // Admins and superadmins can edit any period — no ownership filter
  const isAdmin = !vendorId || userRole === 'ADMIN' || userRole === 'SUPERADMIN';

  const whereClause = { id };
  if (!isAdmin) {
    // Vendors can only edit their own periods
    whereClause.vendor_id = vendorId;
  }

  const period = await RentalPeriod.findOne({ where: whereClause });
  if (!period) return null;

  if (updateData.name !== undefined) period.name = updateData.name.trim();
  if (updateData.duration !== undefined) period.duration = Number(updateData.duration);
  if (updateData.unit !== undefined) period.unit = updateData.unit.toUpperCase();
  if (updateData.discount_percent !== undefined) period.discount_percent = Number(updateData.discount_percent);
  if (updateData.status !== undefined) period.status = updateData.status;

  await period.save();
  return period.toJSON();
};

/**
 * Delete rental period.
 * - ADMIN/SUPERADMIN (vendorId=null): can delete any period
 * - VENDOR (vendorId set): can only delete their own periods
 */
const deleteRentalPeriod = async (id, vendorId = null, userRole = null) => {
  const isAdmin = !vendorId || userRole === 'ADMIN' || userRole === 'SUPERADMIN';

  const whereClause = { id };
  if (!isAdmin) {
    whereClause.vendor_id = vendorId;
  }

  const period = await RentalPeriod.findOne({ where: whereClause });
  if (!period) return null;

  await period.destroy();
  return { deleted: true, id };
};

module.exports = {
  createRentalPeriod,
  getAllRentalPeriods,
  getRentalPeriodById,
  updateRentalPeriod,
  deleteRentalPeriod,
};
