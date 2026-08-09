const orderService = require('../services/order.service');
const { successResponse } = require('../utils/response');

/**
 * GET /api/admin/orders
 * Admin & Vendor view all orders with optional filters (status, customer_id, start_date, end_date)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, customer_id, start_date, end_date } = req.query;
    const vendor_id = req.user?.role === 'VENDOR' ? req.user.id : null;

    const orders = await orderService.getAllOrdersForAdmin({
      status,
      customer_id,
      start_date,
      end_date,
      vendor_id,
    });

    return successResponse(res, 200, 'All orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/orders/:id/status
 * Admin & Vendor update order status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await orderService.updateOrderStatus(id, status);

    return successResponse(res, 200, `Order status updated to ${status} successfully`, updatedOrder);
  } catch (error) {
    next(error);
  }
};

const emailService = require('../services/email.service');

/**
 * PUT /api/admin/orders/:id/send
 * Transition status from DRAFT -> SENT
 */
const sendQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedOrder = await orderService.updateOrderStatus(id, 'SENT');

    // Trigger email notification
    if (updatedOrder && updatedOrder.customer) {
      emailService.sendQuotationEmail(updatedOrder, updatedOrder.customer.email, updatedOrder.customer.name).catch(console.error);
    }

    return successResponse(res, 200, 'Quotation sent successfully', updatedOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/orders/:id/confirm
 * Transition status -> CONFIRMED (Sale Order)
 */
const confirmOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedOrder = await orderService.updateOrderStatus(id, 'CONFIRMED');

    // Trigger email notification
    if (updatedOrder && updatedOrder.customer) {
      emailService.sendOrderConfirmationEmail(updatedOrder, updatedOrder.customer.email, updatedOrder.customer.name).catch(console.error);
    }

    return successResponse(res, 200, 'Order confirmed as Sale Order successfully', updatedOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/schedule
 * Fetch products, orders, and conflict alerts for schedule matrix
 */
const getRentalSchedule = async (req, res, next) => {
  try {
    const { Product, Order, OrderItem, User } = require('../models');
    const { Op } = require('sequelize');

    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;

    const monthParam = req.query.month || new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    const [year, month] = monthParam.split('-').map(Number);

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const firstDayStr = firstDay.toISOString().slice(0, 10);
    const lastDayStr = lastDay.toISOString().slice(0, 10);

    const productWhere = {};
    if (vendorId) {
      productWhere.vendor_id = vendorId;
    }

    const products = await Product.findAll({
      where: productWhere,
      order: [['name', 'ASC']],
    });

    const orderWhere = {
      status: { [Op.ne]: 'CANCELLED' },
      [Op.or]: [
        {
          start_date: { [Op.between]: [firstDayStr, lastDayStr] },
        },
        {
          end_date: { [Op.between]: [firstDayStr, lastDayStr] },
        },
        {
          [Op.and]: [
            { start_date: { [Op.lte]: firstDayStr } },
            { end_date: { [Op.gte]: lastDayStr } },
          ],
        },
      ],
    };

    if (vendorId) {
      const dashboardService = require('../services/dashboard.service');
      const vendorOrderIds = await dashboardService.getVendorOrderIds(vendorId);
      orderWhere.id = { [Op.in]: vendorOrderIds };
    }

    const orders = await Order.findAll({
      where: orderWhere,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'base_price', 'vendor_id'] }],
        },
      ],
      order: [['start_date', 'ASC']],
    });

    // Conflict Detection Algorithm
    const conflicts = [];
    const daysInMonth = lastDay.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateStr = new Date(year, month - 1, day).toISOString().slice(0, 10);

      for (const prod of products) {
        let totalBooked = 0;
        const conflictingOrders = [];

        for (const ord of orders) {
          if (ord.start_date <= currentDateStr && ord.end_date >= currentDateStr) {
            const item = ord.items?.find((i) => i.product_id === prod.id || i.product?.id === prod.id);
            if (item) {
              totalBooked += Number(item.quantity || 1);
              conflictingOrders.push(ord.order_number);
            }
          }
        }

        if (totalBooked > Number(prod.quantity_on_hand || 1)) {
          conflicts.push({
            date: currentDateStr,
            day,
            product_id: prod.id,
            product_name: prod.name,
            booked_qty: totalBooked,
            quantity_on_hand: Number(prod.quantity_on_hand),
            order_numbers: conflictingOrders,
          });
        }
      }
    }

    return successResponse(res, 200, 'Rental schedule matrix and conflicts retrieved', {
      year,
      month,
      monthStr: monthParam,
      daysInMonth,
      products,
      orders,
      conflicts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  sendQuotation,
  confirmOrder,
  getRentalSchedule,
};
