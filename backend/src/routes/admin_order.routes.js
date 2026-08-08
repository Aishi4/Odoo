const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/admin_order.controller');
const paymentController = require('../controllers/payment.controller');
const pickupController = require('../controllers/pickup.controller');
const returnController = require('../controllers/return.controller');
const lateFeeController = require('../controllers/late_fee.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken, authorizeRoles('ADMIN'));

// Admin Orders Inspection
router.get('/orders', adminOrderController.getAllOrders);

// Admin Payments & Security Deposits Inspection
router.get('/payments', paymentController.getAllAdminPayments);
router.get('/security-deposits', paymentController.getAllAdminSecurityDeposits);

// Admin Pickup Management
router.get('/pickups', pickupController.getAdminPickups);
router.get('/pickups/code/:code', pickupController.getPickupByCode);
router.get('/pickups/:id', pickupController.getAdminPickupById);
router.post('/pickups/:id/confirm', pickupController.confirmPickup);

// Admin Return Management
router.get('/returns', returnController.getAdminReturns);
router.get('/returns/:id', returnController.getAdminReturnById);
router.post('/returns/:id/inspect', returnController.inspectReturn);
router.post('/returns/:id/confirm', returnController.confirmReturn);

// Admin Late Fee Configurations
router.post('/late-fee-configs', lateFeeController.createConfig);
router.get('/late-fee-configs', lateFeeController.getConfigs);
router.get('/late-fee-configs/:id', lateFeeController.getConfigById);
router.put('/late-fee-configs/:id', lateFeeController.updateConfig);
router.delete('/late-fee-configs/:id', lateFeeController.deactivateConfig);

// Admin Late Fee Calculations & Overdue Automation
router.post('/returns/:returnId/calculate-late-fee', lateFeeController.calculateLateFee);
router.get('/late-fees', lateFeeController.getLateFees);
router.get('/late-fees/outstanding', lateFeeController.getOutstandingLateFees);
router.post('/late-fees/:id/waive', lateFeeController.waiveLateFee);
router.post('/late-fees/process-overdue', lateFeeController.processOverdueRentals);

module.exports = router;
