const orderService = require('../services/order.service');
const { validateOrderCheckout } = require('../utils/validation');
const { successResponse } = require('../utils/response');

/**
 * POST /api/orders
 * Convert customer's active cart into a Rental Order
 */
const createOrder = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { delivery_method, delivery_address } = req.body;

    validateOrderCheckout({ delivery_method, delivery_address });

    const order = await orderService.createOrderFromCart(customerId, {
      delivery_method,
      delivery_address,
    });

    return successResponse(res, 201, 'Rental order created successfully', order);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 * Get authenticated customer's orders
 */
const getCustomerOrders = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const orders = await orderService.getCustomerOrders(customerId);
    return successResponse(res, 200, 'Orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Get authenticated customer's specific order
 */
const getCustomerOrderById = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    const order = await orderService.getCustomerOrderById(customerId, id);

    return successResponse(res, 200, 'Order details retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:id/cancel
 * Cancel a pending order
 */
const cancelOrder = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    const cancelledOrder = await orderService.cancelOrder(customerId, id);

    return successResponse(res, 200, 'Order cancelled successfully', cancelledOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id/accept-quotation
 * Customer accepts a quotation proposal online
 */
const acceptQuotation = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;
    const order = await orderService.acceptCustomerQuotation(customerId, id);
    return successResponse(res, 200, 'Quotation proposal accepted and confirmed!', order);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id/reject-quotation
 * Customer declines a quotation proposal online
 */
const rejectQuotation = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;
    const order = await orderService.rejectCustomerQuotation(customerId, id);
    return successResponse(res, 200, 'Quotation proposal declined.', order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getCustomerOrderById,
  cancelOrder,
  acceptQuotation,
  rejectQuotation,
};
