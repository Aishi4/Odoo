const invoiceService = require('../services/invoice.service');
const { successResponse } = require('../utils/response');

/**
 * POST /api/admin/orders/:orderId/create-invoice
 */
const createInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const invoice = await invoiceService.createInvoiceForOrder(orderId);
    return successResponse(res, 201, 'Invoice generated successfully', invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/invoices
 */
const getAllInvoices = async (req, res, next) => {
  try {
    const { status, customer_id } = req.query;
    const vendor_id = req.user?.role === 'VENDOR' ? req.user.id : null;
    const invoices = await invoiceService.getAllInvoices({ status, customer_id, vendor_id });
    return successResponse(res, 200, 'Invoices retrieved successfully', invoices);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/invoices/:id
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.getInvoiceById(id);
    return successResponse(res, 200, 'Invoice details retrieved successfully', invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/invoices/:id/post
 */
const postInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.postInvoice(id);
    return successResponse(res, 200, 'Invoice posted successfully', invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/invoices/:id/status
 */
const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;
    const invoice = await invoiceService.updateInvoiceStatus(id, { status, payment_status });
    return successResponse(res, 200, 'Invoice status updated successfully', invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/invoices/:id/register-payment
 */
const registerPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentAmount, paymentMethod } = req.body;
    const invoice = await invoiceService.registerInvoicePayment(id, { paymentAmount, paymentMethod });
    return successResponse(res, 200, 'Payment registered successfully', invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/orders/:orderId/refund-deposit
 */
const refundDeposit = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { refundAmount, note } = req.body;
    const result = await invoiceService.processDepositRefund(orderId, { refundAmount, note });
    return successResponse(res, 200, 'Security deposit refunded successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  postInvoice,
  updateInvoiceStatus,
  registerPayment,
  refundDeposit,
};
