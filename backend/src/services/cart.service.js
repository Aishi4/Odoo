const { Cart, CartItem, Product, ProductVariant, RentalPeriod } = require('../models');
const pricingService = require('./pricing.service');
const AppError = require('../utils/errors');

/**
 * Get or create the customer's active cart
 */
const getOrCreateActiveCart = async (customerId) => {
  let cart = await Cart.findOne({
    where: { customer_id: customerId, status: 'ACTIVE' },
  });

  if (!cart) {
    cart = await Cart.create({
      customer_id: customerId,
      status: 'ACTIVE',
    });
  }

  return cart;
};

/**
 * Get active cart details with items and subtotal
 */
const getActiveCartDetails = async (customerId) => {
  const cart = await getOrCreateActiveCart(customerId);

  const fullCart = await Cart.findByPk(cart.id, {
    include: [
      {
        model: CartItem,
        as: 'items',
        include: [
          { model: Product, as: 'product', attributes: ['id', 'name', 'category', 'base_price', 'status'] },
          { model: ProductVariant, as: 'variant', attributes: ['id', 'brand', 'manufacturer', 'color', 'size', 'status'] },
          { model: RentalPeriod, as: 'rental_period', attributes: ['id', 'name', 'duration', 'unit', 'status'] },
        ],
      },
    ],
  });

  const cartData = fullCart.toJSON();
  const subtotal = cartData.items.reduce((sum, item) => sum + Number(item.price), 0);

  return {
    cart_id: cartData.id,
    customer_id: cartData.customer_id,
    status: cartData.status,
    items: cartData.items,
    subtotal: Number(subtotal.toFixed(2)),
  };
};

/**
 * Add product/variant to customer's active cart
 */
const addItemToCart = async (customerId, { product_id, variant_id, rental_period_id, start_date, end_date, quantity = 1 }) => {
  // 1. Verify Product exists and is ACTIVE
  const product = await Product.findByPk(product_id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  if (product.status !== 'ACTIVE') {
    throw new AppError('Product is currently inactive and unavailable for rental', 400);
  }

  // 2. Verify Variant if provided
  let variant = null;
  if (variant_id) {
    variant = await ProductVariant.findByPk(variant_id);
    if (!variant) {
      throw new AppError('Product variant not found', 404);
    }
    if (variant.product_id !== product_id) {
      throw new AppError('Product variant does not belong to the selected product', 400);
    }
    if (variant.status !== 'ACTIVE') {
      throw new AppError('Product variant is currently inactive', 400);
    }
  }

  // 3. Verify RentalPeriod exists and is ACTIVE
  const rentalPeriod = await RentalPeriod.findByPk(rental_period_id);
  if (!rentalPeriod) {
    throw new AppError('Rental period not found', 404);
  }
  if (rentalPeriod.status !== 'ACTIVE') {
    throw new AppError('Rental period is currently inactive', 400);
  }

  // 4. Calculate price on SERVER
  const priceResult = pricingService.calculateRentalPrice({
    basePrice: product.base_price,
    startDate: start_date,
    endDate: end_date,
    rentalPeriod,
    quantity,
  });

  // 5. Get active cart
  const cart = await getOrCreateActiveCart(customerId);

  // 6. Check if exact item exists in cart
  const existingItem = await CartItem.findOne({
    where: {
      cart_id: cart.id,
      product_id,
      variant_id: variant_id || null,
      rental_period_id,
      start_date,
      end_date,
    },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + Number(quantity);
    const updatedPriceResult = pricingService.calculateRentalPrice({
      basePrice: product.base_price,
      startDate: start_date,
      endDate: end_date,
      rentalPeriod,
      quantity: newQty,
    });
    existingItem.quantity = newQty;
    existingItem.price = updatedPriceResult.totalPrice;
    await existingItem.save();
  } else {
    await CartItem.create({
      cart_id: cart.id,
      product_id,
      variant_id: variant_id || null,
      rental_period_id,
      start_date,
      end_date,
      quantity: Number(quantity),
      price: priceResult.totalPrice,
    });
  }

  return await getActiveCartDetails(customerId);
};

/**
 * Update an existing cart item
 */
const updateCartItem = async (customerId, itemId, { product_id, variant_id, rental_period_id, start_date, end_date, quantity }) => {
  const cart = await getOrCreateActiveCart(customerId);

  const cartItem = await CartItem.findOne({
    where: { id: itemId, cart_id: cart.id },
  });

  if (!cartItem) {
    throw new AppError('Cart item not found in your active cart', 404);
  }

  const targetProductId = product_id || cartItem.product_id;
  const targetVariantId = variant_id !== undefined ? variant_id : cartItem.variant_id;
  const targetRentalPeriodId = rental_period_id || cartItem.rental_period_id;
  const targetStartDate = start_date || cartItem.start_date;
  const targetEndDate = end_date || cartItem.end_date;
  const targetQuantity = quantity !== undefined ? Number(quantity) : cartItem.quantity;

  if (targetQuantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  // Validate product
  const product = await Product.findByPk(targetProductId);
  if (!product || product.status !== 'ACTIVE') {
    throw new AppError('Product is invalid or inactive', 400);
  }

  // Validate variant if present
  if (targetVariantId) {
    const variant = await ProductVariant.findByPk(targetVariantId);
    if (!variant || variant.product_id !== targetProductId || variant.status !== 'ACTIVE') {
      throw new AppError('Product variant is invalid or inactive for this product', 400);
    }
  }

  // Validate rental period
  const rentalPeriod = await RentalPeriod.findByPk(targetRentalPeriodId);
  if (!rentalPeriod || rentalPeriod.status !== 'ACTIVE') {
    throw new AppError('Rental period is invalid or inactive', 400);
  }

  // Recalculate price
  const priceResult = pricingService.calculateRentalPrice({
    basePrice: product.base_price,
    startDate: targetStartDate,
    endDate: targetEndDate,
    rentalPeriod,
    quantity: targetQuantity,
  });

  cartItem.product_id = targetProductId;
  cartItem.variant_id = targetVariantId || null;
  cartItem.rental_period_id = targetRentalPeriodId;
  cartItem.start_date = targetStartDate;
  cartItem.end_date = targetEndDate;
  cartItem.quantity = targetQuantity;
  cartItem.price = priceResult.totalPrice;

  await cartItem.save();

  return await getActiveCartDetails(customerId);
};

/**
 * Remove an item from the customer's active cart
 */
const removeCartItem = async (customerId, itemId) => {
  const cart = await getOrCreateActiveCart(customerId);

  const cartItem = await CartItem.findOne({
    where: { id: itemId, cart_id: cart.id },
  });

  if (!cartItem) {
    throw new AppError('Cart item not found in your active cart', 404);
  }

  await cartItem.destroy();

  return await getActiveCartDetails(customerId);
};

/**
 * Clear all items from the customer's active cart
 */
const clearCart = async (customerId) => {
  const cart = await getOrCreateActiveCart(customerId);

  await CartItem.destroy({
    where: { cart_id: cart.id },
  });

  return await getActiveCartDetails(customerId);
};

module.exports = {
  getOrCreateActiveCart,
  getActiveCartDetails,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
