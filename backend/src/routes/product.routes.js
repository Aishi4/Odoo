const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const variantController = require('../controllers/variant.controller');
const { authenticateToken, optionalAuthenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// --- Product Endpoints ---

// POST /api/products (Admin & Vendor)
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'VENDOR'), productController.createProduct);

// GET /api/products (Public / Authenticated users - optional status filter)
router.get('/', optionalAuthenticateToken, productController.getAllProducts);

// GET /api/products/:id/availability (Public / Authenticated users)
router.get('/:id/availability', productController.checkAvailability);

// GET /api/products/:id (Public / Authenticated users)
router.get('/:id', productController.getProductById);

// PUT /api/products/:id (Admin & Vendor)
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'VENDOR'), productController.updateProduct);

// DELETE /api/products/:id (Admin & Vendor - soft delete)
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'VENDOR'), productController.deleteProduct);


// --- Product Variant Endpoints ---

// POST /api/products/:productId/variants (Admin & Vendor)
router.post('/:productId/variants', authenticateToken, authorizeRoles('ADMIN', 'VENDOR'), variantController.createVariant);

// GET /api/products/:productId/variants (Authenticated users)
router.get('/:productId/variants', productController.getProductById);

// PUT /api/products/:productId/variants/:variantId (Admin & Vendor)
router.put('/:productId/variants/:variantId', authenticateToken, authorizeRoles('ADMIN', 'VENDOR'), variantController.updateVariant);

// DELETE /api/products/:productId/variants/:variantId (Admin & Vendor - soft delete)
router.delete('/:productId/variants/:variantId', authenticateToken, authorizeRoles('ADMIN', 'VENDOR'), variantController.deleteVariant);

module.exports = router;
