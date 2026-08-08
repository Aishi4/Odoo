const productService = require('../services/product.service');
const { validateProduct } = require('../utils/validation');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/errors');

/**
 * POST /api/products
 * Create a product (Admin only)
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, base_price, status } = req.body;

    validateProduct({ name, category, base_price, status });

    const newProduct = await productService.createProduct({
      name,
      description,
      category,
      base_price,
      status,
    });

    return successResponse(res, 201, 'Product created successfully', newProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products
 * Get all products (Optional filter: ?status=ACTIVE)
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const products = await productService.getAllProducts(status);
    return successResponse(res, 200, 'Products retrieved successfully', products);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Get a single product including its variants
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return successResponse(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id
 * Update product information (Admin only)
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, base_price, status } = req.body;

    if (base_price !== undefined && (isNaN(base_price) || Number(base_price) < 0)) {
      throw new AppError('Base price must be a non-negative number', 400);
    }
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new AppError('Status must be ACTIVE or INACTIVE', 400);
    }

    const updatedProduct = await productService.updateProduct(id, {
      name,
      description,
      category,
      base_price,
      status,
    });

    if (!updatedProduct) {
      throw new AppError('Product not found', 404);
    }

    return successResponse(res, 200, 'Product updated successfully', updatedProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Soft-delete product (Deactivate - Admin only)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deactivatedProduct = await productService.deactivateProduct(id);

    if (!deactivatedProduct) {
      throw new AppError('Product not found', 404);
    }

    return successResponse(res, 200, 'Product deactivated successfully', deactivatedProduct);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
