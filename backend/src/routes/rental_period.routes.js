const express = require('express');
const router = express.Router();
const rentalPeriodController = require('../controllers/rental_period.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// POST /api/rental-periods (Admin only)
router.post('/', authenticateToken, authorizeRoles('ADMIN'), rentalPeriodController.createRentalPeriod);

// GET /api/rental-periods (Authenticated users)
router.get('/', authenticateToken, rentalPeriodController.getAllRentalPeriods);

// GET /api/rental-periods/:id (Authenticated users)
router.get('/:id', authenticateToken, rentalPeriodController.getRentalPeriodById);

// PUT /api/rental-periods/:id (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), rentalPeriodController.updateRentalPeriod);

// DELETE /api/rental-periods/:id (Admin only - soft delete)
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), rentalPeriodController.deleteRentalPeriod);

module.exports = router;
