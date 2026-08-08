const orderService = require('../services/order.service');
const { successResponse } = require('../utils/response');

/**
 * GET /api/admin/orders
 * Admin view all orders with optional filters (status, customer_id, start_date, end_date)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, customer_id, start_date, end_date } = req.query;

    const orders = await orderService.getAllOrdersForAdmin({
      status,
      customer_id,
      start_date,
      end_date,
    });

    return successResponse(res, 200, 'All orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
};
