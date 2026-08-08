const cartService = require('../services/cart.service');
const { validateCartItem, validateDates } = require('../utils/validation');
const { successResponse } = require('../utils/response');

/**
 * GET /api/cart
 * Get current customer's active cart
 */
const getCart = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const cart = await cartService.getActiveCartDetails(customerId);
    return successResponse(res, 200, 'Cart retrieved successfully', cart);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart/items
 * Add product/variant to cart
 */
const addItem = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { product_id, variant_id, rental_period_id, start_date, end_date, quantity } = req.body;

    validateCartItem({ product_id, rental_period_id, start_date, end_date, quantity });

    const updatedCart = await cartService.addItemToCart(customerId, {
      product_id,
      variant_id,
      rental_period_id,
      start_date,
      end_date,
      quantity,
    });

    return successResponse(res, 201, 'Item added to cart successfully', updatedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/cart/items/:itemId
 * Update cart item
 */
const updateItem = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { itemId } = req.params;
    const { product_id, variant_id, rental_period_id, start_date, end_date, quantity } = req.body;

    if (start_date && end_date) {
      validateDates(start_date, end_date);
    }

    const updatedCart = await cartService.updateCartItem(customerId, itemId, {
      product_id,
      variant_id,
      rental_period_id,
      start_date,
      end_date,
      quantity,
    });

    return successResponse(res, 200, 'Cart item updated successfully', updatedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/items/:itemId
 * Remove item from cart
 */
const removeItem = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { itemId } = req.params;

    const updatedCart = await cartService.removeCartItem(customerId, itemId);

    return successResponse(res, 200, 'Item removed from cart successfully', updatedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart
 * Clear active cart
 */
const clearCart = async (req, res, next) => {
  try {
    const customerId = req.user.id;

    const clearedCart = await cartService.clearCart(customerId);

    return successResponse(res, 200, 'Cart cleared successfully', clearedCart);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
