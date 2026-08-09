const { Product, ProductVariant } = require('../models');

/**
 * Create a new product
 */
const createProduct = async ({ 
  name, 
  description, 
  category, 
  base_price, 
  status = 'ACTIVE',
  product_type = 'Goods',
  quantity_on_hand = 100,
  cost_price = 0,
  is_published = true,
  periodicity = 'Day',
  pickup_time = '10:00 H',
  return_time = '19:00 H',
  padding_time = '2:00 H',
  late_fees = 150,
  security_deposit = 100,
  attributes = [],
  vendor_id = null
}) => {
  const product = await Product.create({
    name: name.trim(),
    description: description ? description.trim() : null,
    category: category.trim(),
    base_price: Number(base_price),
    status: status || 'ACTIVE',
    vendor_id: vendor_id || null,
    product_type: product_type || 'Goods',
    quantity_on_hand: Number(quantity_on_hand) || 100,
    cost_price: Number(cost_price) || 0,
    is_published: is_published !== false,
    periodicity: periodicity || 'Day',
    pickup_time: pickup_time || '10:00 H',
    return_time: return_time || '19:00 H',
    padding_time: padding_time || '2:00 H',
    late_fees: Number(late_fees) || 150,
    security_deposit: Number(security_deposit) || 100,
    attributes: attributes || [],
  });
  return product.toJSON();
};

/**
 * Get all products with optional status and vendor filters
 */
const getAllProducts = async (statusFilter, vendorIdFilter = null) => {
  const whereClause = {};
  if (statusFilter) {
    whereClause.status = statusFilter;
  }
  if (vendorIdFilter) {
    whereClause.vendor_id = vendorIdFilter;
  }
  const products = await Product.findAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
  });
  return products.map((p) => p.toJSON());
};

/**
 * Get single product by ID with its variants
 */
const getProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: ProductVariant,
        as: 'variants',
      },
    ],
  });
  return product ? product.toJSON() : null;
};

/**
 * Update product information
 */
const updateProduct = async (id, updateData) => {
  const product = await Product.findByPk(id);
  if (!product) return null;

  if (updateData.name !== undefined) product.name = updateData.name.trim();
  if (updateData.description !== undefined) product.description = updateData.description;
  if (updateData.category !== undefined) product.category = updateData.category.trim();
  if (updateData.base_price !== undefined) product.base_price = Number(updateData.base_price);
  if (updateData.status !== undefined) product.status = updateData.status;
  if (updateData.product_type !== undefined) product.product_type = updateData.product_type;
  if (updateData.quantity_on_hand !== undefined) product.quantity_on_hand = Number(updateData.quantity_on_hand);
  if (updateData.cost_price !== undefined) product.cost_price = Number(updateData.cost_price);
  if (updateData.is_published !== undefined) product.is_published = Boolean(updateData.is_published);
  if (updateData.periodicity !== undefined) product.periodicity = updateData.periodicity;
  if (updateData.pickup_time !== undefined) product.pickup_time = updateData.pickup_time;
  if (updateData.return_time !== undefined) product.return_time = updateData.return_time;
  if (updateData.padding_time !== undefined) product.padding_time = updateData.padding_time;
  if (updateData.late_fees !== undefined) product.late_fees = Number(updateData.late_fees);
  if (updateData.security_deposit !== undefined) product.security_deposit = Number(updateData.security_deposit);
  if (updateData.attributes !== undefined) product.attributes = updateData.attributes;

  await product.save();
  return product.toJSON();
};

/**
 * Deactivate product (soft-delete sets status to INACTIVE)
 */
const deactivateProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) return null;

  product.status = 'INACTIVE';
  await product.save();
  return product.toJSON();
};

/**
 * Check product availability for specified date range
 */
const checkProductAvailability = async (productId, startDate, endDate) => {
  const { Op } = require('sequelize');
  const { OrderItem, Order } = require('../models');

  const product = await Product.findByPk(productId);
  if (!product || product.status !== 'ACTIVE') {
    return { available: false, reason: 'Product is out of stock or inactive' };
  }

  if (!startDate || !endDate) {
    return { available: false, reason: 'Rental start and end dates are required' };
  }

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);

  if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
    return { available: false, reason: 'Invalid rental date format' };
  }

  if (sDate > eDate) {
    return { available: false, reason: 'Return date must be on or after pickup date' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (sDate < today) {
    return { available: false, reason: 'Pickup date cannot be in the past' };
  }

  // Count overlapping active orders
  let activeBookings = 0;
  try {
    activeBookings = await OrderItem.count({
      where: {
        product_id: productId,
        [Op.and]: [
          { start_date: { [Op.lte]: endDate } },
          { end_date: { [Op.gte]: startDate } },
        ],
      },
      include: [
        {
          model: Order,
          where: {
            status: { [Op.in]: ['CONFIRMED', 'ACTIVE', 'PICKED_UP', 'PENDING_PAYMENT'] },
          },
        },
      ],
    });
  } catch (err) {
    activeBookings = 0;
  }

  const totalStock = 10;
  const isAvailable = activeBookings < totalStock;

  return {
    available: isAvailable,
    available_stock: Math.max(0, totalStock - activeBookings),
    reason: isAvailable ? 'Available for selected rental period' : 'Fully booked for this period',
  };
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
  checkProductAvailability,
};
