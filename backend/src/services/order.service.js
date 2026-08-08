const { Op } = require('sequelize');
const { sequelize, Order, OrderItem, Cart, CartItem, Product, ProductVariant, RentalPeriod, User, RentalPickup, RentalReturn, SecurityDeposit } = require('../models');
const pricingService = require('./pricing.service');
const AppError = require('../utils/errors');

/**
 * Generate human-readable unique order number: RNT-YYYYMMDD-XXXX
 */
const generateOrderNumber = async (transaction = null) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `RNT-${dateStr}-`;

  const countToday = await Order.count({
    where: {
      order_number: {
        [Op.like]: `${prefix}%`,
      },
    },
    transaction,
  });

  const sequence = String(countToday + 1).padStart(4, '0');
  return `${prefix}${sequence}`;
};

/**
 * Convert customer's active cart into a Rental Order using a PostgreSQL Transaction
 */
const createOrderFromCart = async (customerId, { delivery_method, delivery_address }) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Fetch active cart
    const cart = await Cart.findOne({
      where: { customer_id: customerId, status: 'ACTIVE' },
      transaction,
    });

    if (!cart) {
      throw new AppError('No active cart found for checkout', 400);
    }

    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [
        { model: Product, as: 'product' },
        { model: ProductVariant, as: 'variant' },
        { model: RentalPeriod, as: 'rental_period' },
      ],
      transaction,
    });

    if (!cartItems || cartItems.length === 0) {
      throw new AppError('Cart is empty. Add items before checking out.', 400);
    }

    let subtotal = 0;
    let overallStartDate = null;
    let overallEndDate = null;
    const orderItemsData = [];

    // 2. Validate items & recalculate prices
    for (const item of cartItems) {
      if (!item.product || item.product.status !== 'ACTIVE') {
        throw new AppError(`Product "${item.product ? item.product.name : 'Unknown'}" is no longer available`, 400);
      }
      if (item.variant && item.variant.status !== 'ACTIVE') {
        throw new AppError(`Product variant for "${item.product.name}" is no longer available`, 400);
      }
      if (!item.rental_period || item.rental_period.status !== 'ACTIVE') {
        throw new AppError(`Rental period for "${item.product.name}" is no longer available`, 400);
      }

      // Recalculate price
      const priceResult = pricingService.calculateRentalPrice({
        basePrice: item.product.base_price,
        startDate: item.start_date,
        endDate: item.end_date,
        rentalPeriod: item.rental_period,
        quantity: item.quantity,
      });

      subtotal += priceResult.totalPrice;

      // Track overall start and end dates
      if (!overallStartDate || new Date(item.start_date) < new Date(overallStartDate)) {
        overallStartDate = item.start_date;
      }
      if (!overallEndDate || new Date(item.end_date) > new Date(overallEndDate)) {
        overallEndDate = item.end_date;
      }

      // Prepare snapshot for order item
      const variantSnapshot = item.variant
        ? {
            id: item.variant.id,
            brand: item.variant.brand,
            manufacturer: item.variant.manufacturer,
            color: item.variant.color,
            size: item.variant.size,
          }
        : null;

      orderItemsData.push({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        rental_period_id: item.rental_period_id,
        product_name: item.product.name,
        variant_details: variantSnapshot,
        start_date: item.start_date,
        end_date: item.end_date,
        quantity: item.quantity,
        unit_price: priceResult.unitPrice,
        total_price: priceResult.totalPrice,
      });
    }

    // 3. Generate Order Number
    const orderNumber = await generateOrderNumber(transaction);

    // 4. Create Rental Order
    const order = await Order.create(
      {
        customer_id: customerId,
        order_number: orderNumber,
        status: 'PENDING_PAYMENT',
        subtotal: Number(subtotal.toFixed(2)),
        delivery_method,
        delivery_address: delivery_method === 'DELIVERY' ? delivery_address.trim() : null,
        start_date: overallStartDate,
        end_date: overallEndDate,
      },
      { transaction }
    );

    // 5. Create Order Items
    for (const itemData of orderItemsData) {
      await OrderItem.create(
        {
          order_id: order.id,
          ...itemData,
        },
        { transaction }
      );
    }

    // 6. Mark Cart as CHECKED_OUT
    cart.status = 'CHECKED_OUT';
    await cart.save({ transaction });

    // 7. Commit Transaction
    await transaction.commit();

    // 8. Return complete order
    return await getOrderDetailsById(order.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Get single order by ID (with items, pickup, return, deposit, customer info)
 */
const getOrderDetailsById = async (orderId) => {
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        as: 'items',
      },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: RentalPickup,
        as: 'pickup',
      },
      {
        model: RentalReturn,
        as: 'return',
      },
      {
        model: SecurityDeposit,
        as: 'security_deposit',
      },
    ],
  });

  return order ? order.toJSON() : null;
};

/**
 * Get customer orders list
 */
const getCustomerOrders = async (customerId) => {
  const orders = await Order.findAll({
    where: { customer_id: customerId },
    include: [
      {
        model: OrderItem,
        as: 'items',
      },
      {
        model: RentalPickup,
        as: 'pickup',
      },
      {
        model: RentalReturn,
        as: 'return',
      },
      {
        model: SecurityDeposit,
        as: 'security_deposit',
      },
    ],
    order: [['created_at', 'DESC']],
  });
  return orders.map((o) => o.toJSON());
};

/**
 * Get customer single order (with authorization check)
 */
const getCustomerOrderById = async (customerId, orderId) => {
  const order = await Order.findOne({
    where: { id: orderId, customer_id: customerId },
    include: [
      {
        model: OrderItem,
        as: 'items',
      },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: RentalPickup,
        as: 'pickup',
      },
      {
        model: RentalReturn,
        as: 'return',
      },
      {
        model: SecurityDeposit,
        as: 'security_deposit',
      },
    ],
  });

  if (!order) {
    throw new AppError('Order not found or access denied', 404);
  }

  return order.toJSON();
};

/**
 * Cancel customer pending order
 */
const cancelOrder = async (customerId, orderId) => {
  const order = await Order.findOne({
    where: { id: orderId, customer_id: customerId },
  });

  if (!order) {
    throw new AppError('Order not found or access denied', 404);
  }

  if (order.status !== 'PENDING_PAYMENT') {
    throw new AppError('Only orders with status PENDING_PAYMENT can be cancelled', 400);
  }

  order.status = 'CANCELLED';
  await order.save();

  return await getOrderDetailsById(order.id);
};

/**
 * Get all orders for Admin with optional filters
 */
const getAllOrdersForAdmin = async (filters = {}) => {
  const whereClause = {};

  if (filters.status) {
    whereClause.status = filters.status;
  }
  if (filters.customer_id) {
    whereClause.customer_id = filters.customer_id;
  }
  if (filters.start_date) {
    whereClause.start_date = { [Op.gte]: filters.start_date };
  }
  if (filters.end_date) {
    whereClause.end_date = { [Op.lte]: filters.end_date };
  }

  const orders = await Order.findAll({
    where: whereClause,
    include: [
      {
        model: OrderItem,
        as: 'items',
      },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: RentalPickup,
        as: 'pickup',
      },
      {
        model: RentalReturn,
        as: 'return',
      },
      {
        model: SecurityDeposit,
        as: 'security_deposit',
      },
    ],
    order: [['created_at', 'DESC']],
  });

  return orders.map((o) => o.toJSON());
};

/**
 * Update order status for Admin & Vendor
 */
const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const validStatuses = [
    'PENDING_PAYMENT',
    'CONFIRMED',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'ACTIVE',
    'RETURN_PENDING',
    'RETURNED',
    'COMPLETED',
    'CANCELLED',
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new AppError('Invalid order status', 400);
  }

  order.status = newStatus;
  await order.save();

  return await getOrderDetailsById(order.id);
};

module.exports = {
  createOrderFromCart,
  getOrderDetailsById,
  getCustomerOrders,
  getCustomerOrderById,
  cancelOrder,
  getAllOrdersForAdmin,
  updateOrderStatus,
};
