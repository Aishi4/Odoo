const { ProductVariant, Product } = require('../models');

/**
 * Create a new variant for a product
 */
const createVariant = async (productId, { brand, manufacturer, color, size, status = 'ACTIVE' }) => {
  // Ensure parent product exists
  const parentProduct = await Product.findByPk(productId);
  if (!parentProduct) return null;

  const variant = await ProductVariant.create({
    product_id: productId,
    brand: brand ? brand.trim() : null,
    manufacturer: manufacturer ? manufacturer.trim() : null,
    color: color ? color.trim() : null,
    size: size ? size.trim() : null,
    status: status || 'ACTIVE',
  });

  return variant.toJSON();
};

/**
 * Get all variants belonging to a product
 */
const getVariantsByProductId = async (productId) => {
  const variants = await ProductVariant.findAll({
    where: { product_id: productId },
    order: [['created_at', 'DESC']],
  });
  return variants.map((v) => v.toJSON());
};

/**
 * Update variant information
 */
const updateVariant = async (productId, variantId, updateData) => {
  const variant = await ProductVariant.findOne({
    where: { id: variantId, product_id: productId },
  });
  if (!variant) return null;

  if (updateData.brand !== undefined) variant.brand = updateData.brand ? updateData.brand.trim() : null;
  if (updateData.manufacturer !== undefined) variant.manufacturer = updateData.manufacturer ? updateData.manufacturer.trim() : null;
  if (updateData.color !== undefined) variant.color = updateData.color ? updateData.color.trim() : null;
  if (updateData.size !== undefined) variant.size = updateData.size ? updateData.size.trim() : null;
  if (updateData.status !== undefined) variant.status = updateData.status;

  await variant.save();
  return variant.toJSON();
};

/**
 * Deactivate variant (soft-delete)
 */
const deactivateVariant = async (productId, variantId) => {
  const variant = await ProductVariant.findOne({
    where: { id: variantId, product_id: productId },
  });
  if (!variant) return null;

  variant.status = 'INACTIVE';
  await variant.save();
  return variant.toJSON();
};

module.exports = {
  createVariant,
  getVariantsByProductId,
  updateVariant,
  deactivateVariant,
};
