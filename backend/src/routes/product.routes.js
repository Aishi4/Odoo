const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const variantController = require('../controllers/variant.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// --- Product Endpoints ---

// POST /api/products (Admin only)
router.post('/', authenticateToken, authorizeRoles('ADMIN'), productController.createProduct);

// GET /api/products (Authenticated users - optional status filter)
router.get('/', authenticateToken, productController.getAllProducts);

// GET /api/products/:id (Authenticated users)
router.get('/:id', authenticateToken, productController.getProductById);

// PUT /api/products/:id (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), productController.updateProduct);

// DELETE /api/products/:id (Admin only - soft delete)
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), productController.deleteProduct);


// --- Product Variant Endpoints ---

// POST /api/products/:productId/variants (Admin only)
router.post('/:productId/variants', authenticateToken, authorizeRoles('ADMIN'), variantController.createVariant);

// GET /api/products/:productId/variants (Authenticated users)
router.get('/:productId/variants', authenticateToken, variantController.getVariantsByProductId);

// PUT /api/products/:productId/variants/:variantId (Admin only)
router.put('/:productId/variants/:variantId', authenticateToken, authorizeRoles('ADMIN'), variantController.updateVariant);

// DELETE /api/products/:productId/variants/:variantId (Admin only - soft delete)
router.delete('/:productId/variants/:variantId', authenticateToken, authorizeRoles('ADMIN'), variantController.deleteVariant);

module.exports = router;
