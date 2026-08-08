const returnService = require('../services/return.service');
const { successResponse } = require('../utils/response');

/**
 * GET /api/admin/returns
 * Admin view return schedule
 */
const getAdminReturns = async (req, res, next) => {
  try {
    const { status, condition, date, customer_id } = req.query;
    const returns = await returnService.getAdminReturns({ status, condition, date, customer_id });
    return successResponse(res, 200, 'Admin return schedule retrieved successfully', returns);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/returns/:id
 * Admin view full return record details
 */
const getAdminReturnById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const returnRecord = await returnService.getReturnById(id);
    return successResponse(res, 200, 'Return record details retrieved successfully', returnRecord);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/returns/:id/inspect
 * Admin perform inspection on returned item
 */
const inspectReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { condition, damage_report, missing_accessories, notes } = req.body;

    const inspectedReturn = await returnService.inspectReturn(id, adminId, {
      condition,
      damage_report,
      missing_accessories,
      notes,
    });

    return successResponse(res, 200, 'Return inspection completed successfully', inspectedReturn);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/returns/:id/confirm
 * Admin confirm physical return
 */
const confirmReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { actual_return_at } = req.body;

    const result = await returnService.confirmReturn(id, adminId, { actual_return_at });
    return successResponse(res, 200, 'Return confirmed successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:orderId/return
 * Authenticated customer view return details for own order
 */
const getCustomerReturn = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const customerId = req.user.id;

    const returnRecord = await returnService.getCustomerReturn(orderId, customerId);
    return successResponse(res, 200, 'Customer return details retrieved successfully', returnRecord);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminReturns,
  getAdminReturnById,
  inspectReturn,
  confirmReturn,
  getCustomerReturn,
};
