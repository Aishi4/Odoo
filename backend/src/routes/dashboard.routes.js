const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/overview', dashboardController.getOverview);
router.get('/active-rentals', dashboardController.getActiveRentals);
router.get('/due-today', dashboardController.getDueTodayRentals);
router.get('/upcoming-pickups', dashboardController.getUpcomingPickups);
router.get('/upcoming-returns', dashboardController.getUpcomingReturns);
router.get('/overdue-rentals', dashboardController.getOverdueRentals);
router.get('/revenue', dashboardController.getRentalRevenue);
router.get('/security-deposits', dashboardController.getSecurityDepositsHeld);
router.get('/late-fees', dashboardController.getLateFeeCollection);
router.get('/priorities', dashboardController.getPriorities);
router.get('/rental-status', dashboardController.getRentalStatusSummary);
router.get('/revenue-summary', dashboardController.getRevenueSummary);

module.exports = router;
