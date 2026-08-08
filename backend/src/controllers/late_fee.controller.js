const lateFeeService = require('../services/lateFee.service');
const { successResponse } = require('../utils/response');

/**
 * POST /api/admin/late-fee-configs
 * Create a late-fee configuration rule
 */
const createConfig = async (req, res, next) => {
  try {
    const config = await lateFeeService.createConfig(req.body);
    return successResponse(res, 201, 'Late fee configuration created successfully', config);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/late-fee-configs
 * List all late-fee configurations
 */
const getConfigs = async (req, res, next) => {
  try {
    const configs = await lateFeeService.getConfigs();
    return successResponse(res, 200, 'Late fee configurations retrieved successfully', configs);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/late-fee-configs/:id
 * Get single late-fee configuration
 */
const getConfigById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const config = await lateFeeService.getConfigById(id);
    return successResponse(res, 200, 'Late fee configuration retrieved successfully', config);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/late-fee-configs/:id
 * Update late-fee configuration
 */
const updateConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const config = await lateFeeService.updateConfig(id, req.body);
    return successResponse(res, 200, 'Late fee configuration updated successfully', config);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/late-fee-configs/:id
 * Soft deactivate late-fee configuration
 */
const deactivateConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const config = await lateFeeService.deactivateConfig(id);
    return successResponse(res, 200, 'Late fee configuration deactivated successfully', config);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/returns/:returnId/calculate-late-fee
 * Calculate late fee and settle deposit for a returned rental
 */
const calculateLateFee = async (req, res, next) => {
  try {
    const { returnId } = req.params;
    const { config_id } = req.body;

    const result = await lateFeeService.calculateAndSaveLateFee(returnId, config_id);
    return successResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/late-fees
 * Admin view all late fee records (filters: status, customer_id, order_id)
 */
const getLateFees = async (req, res, next) => {
  try {
    const { status, customer_id, order_id } = req.query;
    const lateFees = await lateFeeService.getLateFees({ status, customer_id, order_id });
    return successResponse(res, 200, 'Late fee records retrieved successfully', lateFees);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/late-fees/outstanding
 * Admin view outstanding penalties (> 0)
 */
const getOutstandingLateFees = async (req, res, next) => {
  try {
    const outstanding = await lateFeeService.getOutstandingLateFees();
    return successResponse(res, 200, 'Outstanding late fees retrieved successfully', outstanding);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/late-fees/:id/waive
 * Admin waive late fee
 */
const waiveLateFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await lateFeeService.waiveLateFee(id, notes);
    return successResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/late-fees/process-overdue
 * Trigger automatic overdue rentals calculation batch job
 */
const processOverdueRentals = async (req, res, next) => {
  try {
    const batchResult = await lateFeeService.processOverdueRentals();
    return successResponse(res, 200, 'Overdue rentals batch processing executed successfully', batchResult);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:orderId/late-fee
 * Customer view own order late fee
 */
const getCustomerLateFee = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const customerId = req.user.id;

    const lateFee = await lateFeeService.getCustomerLateFee(orderId, customerId);
    return successResponse(res, 200, 'Customer late fee details retrieved successfully', lateFee);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConfig,
  getConfigs,
  getConfigById,
  updateConfig,
  deactivateConfig,
  calculateLateFee,
  getLateFees,
  getOutstandingLateFees,
  waiveLateFee,
  processOverdueRentals,
  getCustomerLateFee,
};
