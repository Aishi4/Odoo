const { Op } = require('sequelize');
const { Invoice, Order, User, OrderItem } = require('../models');
const AppError = require('../utils/errors');
const emailService = require('./email.service');

/**
 * Generate human-readable unique invoice number: INV-YYYYMMDD-XXXX
 */
const generateInvoiceNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${dateStr}-`;

  const countToday = await Invoice.count({
    where: {
      invoice_number: {
        [Op.like]: `${prefix}%`,
      },
    },
  });

  const sequence = String(countToday + 1).padStart(4, '0');
  return `${prefix}${sequence}`;
};

/**
 * Create an Invoice for an existing Rental Order
 */
const createInvoiceForOrder = async (orderId) => {
  const order = await Order.findByPk(orderId, {
    include: [{ model: OrderItem, as: 'items' }],
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if an active non-cancelled invoice already exists for this order
  const existingInvoice = await Invoice.findOne({
    where: {
      order_id: orderId,
      status: { [Op.ne]: 'CANCELLED' },
    },
  });

  if (existingInvoice) {
    return existingInvoice.toJSON();
  }

  const invoiceNumber = await generateInvoiceNumber();

  // Set due date to 14 days from creation
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  const isConfirmedOrPaid = ['CONFIRMED', 'COMPLETED', 'ACTIVE', 'PICKED_UP', 'RETURNED'].includes(order.status);

  const invoice = await Invoice.create({
    invoice_number: invoiceNumber,
    order_id: order.id,
    customer_id: order.customer_id,
    amount: order.subtotal,
    amount_paid: isConfirmedOrPaid ? order.subtotal : 0,
    status: isConfirmedOrPaid ? 'POSTED' : 'DRAFT',
    payment_status: isConfirmedOrPaid ? 'PAID' : 'UNPAID',
    due_date: dueDate.toISOString().slice(0, 10),
  });

  const invoiceDetails = await getInvoiceById(invoice.id);

  if (invoiceDetails && invoiceDetails.customer) {
    emailService.sendInvoiceNotificationEmail(invoiceDetails, invoiceDetails.order, invoiceDetails.customer.email, invoiceDetails.customer.name).catch(console.error);
  }

  return invoiceDetails;
};

/**
 * Get single invoice details
 */
const getInvoiceById = async (invoiceId) => {
  const invoice = await Invoice.findByPk(invoiceId, {
    include: [
      {
        model: Order,
        as: 'order',
        include: [{ model: OrderItem, as: 'items' }],
      },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  return invoice.toJSON();
};

/**
 * Get all invoices with optional filters
 */
const getAllInvoices = async (filters = {}) => {
  // Auto-heal/generate invoices for all confirmed orders that don't have an invoice record yet
  try {
    const confirmedOrders = await Order.findAll({
      where: { status: { [Op.in]: ['CONFIRMED', 'ACTIVE', 'COMPLETED', 'PICKED_UP', 'RETURNED'] } },
      attributes: ['id'],
    });
    for (const ord of confirmedOrders) {
      const invCount = await Invoice.count({ where: { order_id: ord.id } });
      if (invCount === 0) {
        await createInvoiceForOrder(ord.id).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Auto invoice sync warning:', err.message);
  }

  const whereClause = {};

  if (filters.status) {
    whereClause.status = filters.status;
  }
  if (filters.customer_id) {
    whereClause.customer_id = filters.customer_id;
  }

  if (filters.vendor_id) {
    const dashboardService = require('./dashboard.service');
    const vendorOrderIds = await dashboardService.getVendorOrderIds(filters.vendor_id);
    whereClause.order_id = { [Op.in]: vendorOrderIds };
  }

  const invoices = await Invoice.findAll({
    where: whereClause,
    include: [
      {
        model: Order,
        as: 'order',
        attributes: ['id', 'order_number', 'status', 'start_date', 'end_date'],
        include: [
          {
            model: OrderItem,
            as: 'items',
          },
        ],
      },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  return invoices.map((inv) => inv.toJSON());
};

/**
 * Post a Draft Invoice (DRAFT -> POSTED)
 */
const postInvoice = async (invoiceId) => {
  const invoice = await Invoice.findByPk(invoiceId);

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  if (invoice.status === 'POSTED') {
    return await getInvoiceById(invoiceId);
  }

  invoice.status = 'POSTED';
  await invoice.save();

  return await getInvoiceById(invoiceId);
};

/**
 * Update invoice status or payment status
 */
const updateInvoiceStatus = async (invoiceId, { status, payment_status }) => {
  const invoice = await Invoice.findByPk(invoiceId);

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  if (status) {
    invoice.status = status;
  }
  if (payment_status) {
    invoice.payment_status = payment_status;
  }

  await invoice.save();
  return await getInvoiceById(invoiceId);
};

/**
 * Register Partial or Full Payment on an Invoice
 */
const registerInvoicePayment = async (invoiceId, { paymentAmount, paymentMethod }) => {
  const invoice = await Invoice.findByPk(invoiceId);

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  const pAmount = Number(paymentAmount || 0);
  if (pAmount <= 0) {
    throw new AppError('Payment amount must be greater than zero', 400);
  }

  const currentPaid = Number(invoice.amount_paid || 0);
  const totalAmount = Number(invoice.amount || 0);
  const newPaid = currentPaid + pAmount;

  invoice.amount_paid = newPaid;

  if (newPaid >= totalAmount) {
    invoice.payment_status = 'PAID';
  } else if (newPaid > 0) {
    invoice.payment_status = 'PARTIALLY_PAID';
  } else {
    invoice.payment_status = 'UNPAID';
  }

  await invoice.save();

  // Create payment record if Payment model exists
  const { Payment } = require('../models');
  if (Payment) {
    await Payment.create({
      order_id: invoice.order_id,
      customer_id: invoice.customer_id,
      amount: pAmount,
      payment_type: 'RENTAL_PAYMENT',
      payment_method: paymentMethod || 'ONLINE',
      status: 'SUCCESS',
      transaction_id: `PAY-${Date.now()}`,
    }).catch((e) => console.warn('Payment record log optional warning:', e.message));
  }

  return await getInvoiceById(invoiceId);
};

/**
 * Process Security Deposit Refund
 */
const processDepositRefund = async (orderId, { refundAmount, note }) => {
  const { SecurityDeposit } = require('../models');

  let depositRecord = null;
  if (SecurityDeposit) {
    depositRecord = await SecurityDeposit.findOne({ where: { order_id: orderId } });
    if (depositRecord) {
      depositRecord.status = 'REFUNDED';
      depositRecord.notes = note || 'Deposit refunded upon equipment inspection';
      await depositRecord.save();
    }
  }

  return {
    order_id: orderId,
    refund_amount: Number(refundAmount || 0),
    status: 'REFUNDED',
    deposit_record: depositRecord ? depositRecord.toJSON() : null,
  };
};

module.exports = {
  createInvoiceForOrder,
  getInvoiceById,
  getAllInvoices,
  postInvoice,
  updateInvoiceStatus,
  registerInvoicePayment,
  processDepositRefund,
};
