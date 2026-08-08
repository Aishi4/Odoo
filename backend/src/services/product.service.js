const { Product, ProductVariant } = require('../models');

/**
 * Create a new product
 */
const createProduct = async ({ name, description, category, base_price, status = 'ACTIVE' }) => {
  const product = await Product.create({
    name: name.trim(),
    description: description ? description.trim() : null,
    category: category.trim(),
    base_price: Number(base_price),
    status: status || 'ACTIVE',
  });
  return product.toJSON();
};

/**
 * Get all products with optional status filter
 */
const getAllProducts = async (statusFilter) => {
  const whereClause = {};
  if (statusFilter) {
    whereClause.status = statusFilter;
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

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
};
