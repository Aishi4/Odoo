const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// All invoice routes require Admin or Vendor role
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'VENDOR'));

router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id/post', invoiceController.postInvoice);
router.put('/:id/status', invoiceController.updateInvoiceStatus);

module.exports = router;
