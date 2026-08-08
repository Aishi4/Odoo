const variantService = require('../services/variant.service');
const { validateVariant } = require('../utils/validation');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/errors');

/**
 * POST /api/products/:productId/variants
 * Create product variant (Admin only)
 */
const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { brand, manufacturer, color, size, status } = req.body;

    validateVariant({ brand, manufacturer, color, size });

    const newVariant = await variantService.createVariant(productId, {
      brand,
      manufacturer,
      color,
      size,
      status,
    });

    if (!newVariant) {
      throw new AppError('Product not found', 404);
    }

    return successResponse(res, 201, 'Product variant created successfully', newVariant);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:productId/variants
 * Get all variants belonging to a product
 */
const getVariantsByProductId = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variants = await variantService.getVariantsByProductId(productId);
    return successResponse(res, 200, 'Product variants retrieved successfully', variants);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:productId/variants/:variantId
 * Update product variant (Admin only)
 */
const updateVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;
    const { brand, manufacturer, color, size, status } = req.body;

    const updatedVariant = await variantService.updateVariant(productId, variantId, {
      brand,
      manufacturer,
      color,
      size,
      status,
    });

    if (!updatedVariant) {
      throw new AppError('Product variant not found for this product', 404);
    }

    return successResponse(res, 200, 'Product variant updated successfully', updatedVariant);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:productId/variants/:variantId
 * Soft-delete product variant (Admin only)
 */
const deleteVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;
    const deactivatedVariant = await variantService.deactivateVariant(productId, variantId);

    if (!deactivatedVariant) {
      throw new AppError('Product variant not found for this product', 404);
    }

    return successResponse(res, 200, 'Product variant deactivated successfully', deactivatedVariant);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVariant,
  getVariantsByProductId,
  updateVariant,
  deleteVariant,
};
