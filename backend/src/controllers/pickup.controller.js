const pickupService = require('../services/pickup.service');
const { successResponse } = require('../utils/response');

/**
 * GET /api/admin/pickups
 * Admin view pickup schedule
 */
const getAdminPickups = async (req, res, next) => {
  try {
    const { status, pickup_type, date, customer_id } = req.query;
    const pickups = await pickupService.getAdminPickups({ status, pickup_type, date, customer_id });
    return successResponse(res, 200, 'Admin pickup schedule retrieved successfully', pickups);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/pickups/code/:code
 * Admin find pickup by QR / Barcode pickup_code
 */
const getPickupByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const pickup = await pickupService.getPickupByCode(code);
    return successResponse(res, 200, 'Pickup record retrieved by code successfully', pickup);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/pickups/:id
 * Admin view full pickup record details
 */
const getAdminPickupById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pickup = await pickupService.getPickupById(id);
    return successResponse(res, 200, 'Pickup record details retrieved successfully', pickup);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/pickups/:id/confirm
 * Admin confirm pickup / item handover
 */
const confirmPickup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { checklist, notes } = req.body;

    const confirmedPickup = await pickupService.confirmPickup(id, adminId, { checklist, notes });
    return successResponse(res, 200, 'Pickup confirmed successfully', confirmedPickup);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:orderId/pickup
 * Authenticated customer view pickup details for own order
 */
const getCustomerPickup = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const customerId = req.user.id;

    const pickup = await pickupService.getCustomerPickup(orderId, customerId);
    return successResponse(res, 200, 'Customer pickup details retrieved successfully', pickup);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminPickups,
  getPickupByCode,
  getAdminPickupById,
  confirmPickup,
  getCustomerPickup,
};
