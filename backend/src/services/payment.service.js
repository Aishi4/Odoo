const { sequelize, Payment, Order, SecurityDeposit } = require('../models');
const securityDepositService = require('./securityDeposit.service');
const mockPaymentService = require('./mockPayment.service');
const pickupService = require('./pickup.service');
const returnService = require('./return.service');
const AppError = require('../utils/errors');

class PaymentService {
  /**
   * Get payment summary for a customer order
   * Calculates rental amount, security deposit, and total payable on the server.
   * @param {string} customerId
   * @param {string} orderId
   */
  async getPaymentSummary(customerId, orderId) {
    const order = await Order.findOne({
      where: {
        id: orderId,
        customer_id: customerId,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const rentalAmount = Number(order.subtotal);
    const securityDepositAmount = securityDepositService.calculateDeposit(rentalAmount);
    const totalAmount = Math.round((rentalAmount + securityDepositAmount) * 100) / 100;

    return {
      order_id: order.id,
      order_number: order.order_number,
      order_status: order.status,
      rental_amount: rentalAmount,
      security_deposit: securityDepositAmount,
      total_amount: totalAmount,
      currency: 'INR',
    };
  }

  /**
   * Initiate payment for customer order (Atomic Transaction)
   * Handles ONLINE and CASH payments, mock processing, deposit holding, order confirmation, and pickup/return schedule creation.
   * @param {string} customerId
   * @param {string} orderId
   * @param {Object} payload - { payment_method, simulate_failure }
   */
  async initiatePayment(customerId, orderId, { payment_method, simulate_failure = false }) {
    if (!['ONLINE', 'CASH'].includes(payment_method)) {
      throw new AppError('Invalid payment method. Supported methods: ONLINE, CASH', 400);
    }

    const transaction = await sequelize.transaction();

    try {
      // 1. Lock and find order
      const order = await Order.findOne({
        where: {
          id: orderId,
          customer_id: customerId,
        },
        transaction,
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.status !== 'PENDING_PAYMENT') {
        throw new AppError(`Cannot process payment for order in '${order.status}' state. Payment already processed or cancelled.`, 400);
      }

      // Check if stock reservation hold expired (> 10 minutes)
      if (order.expires_at && new Date(order.expires_at) < new Date()) {
        order.status = 'CANCELLED';
        order.expires_at = null;
        await order.save({ transaction });
        throw new AppError('Stock reservation timed out (10-minute hold window expired). Reserved stock was released to other customers. Please add items to cart and check out again.', 400);
      }

      // 2. Server-side financial calculations
      const rentalAmount = Number(order.subtotal);
      const securityDepositAmount = securityDepositService.calculateDeposit(rentalAmount);
      const totalAmount = Math.round((rentalAmount + securityDepositAmount) * 100) / 100;

      // 3. Process payment via Mock Payment Provider
      const mockResult = await mockPaymentService.processMockPayment({
        amount: totalAmount,
        currency: 'INR',
        payment_method,
        simulate_failure,
      });

      // 4. Handle Payment Failure
      if (!mockResult.success) {
        const failedPayment = await Payment.create({
          order_id: order.id,
          customer_id: customerId,
          amount: totalAmount,
          currency: 'INR',
          payment_type: 'RENTAL',
          payment_method,
          status: 'FAILED',
        }, { transaction });

        await transaction.commit();

        return {
          success: false,
          status: 'FAILED',
          message: mockResult.error_message || 'Payment transaction failed',
          payment: failedPayment,
          order_status: order.status, // remains PENDING_PAYMENT
        };
      }

      // 5. Handle Payment Success
      const successfulPayment = await Payment.create({
        order_id: order.id,
        customer_id: customerId,
        amount: totalAmount,
        currency: 'INR',
        payment_type: 'RENTAL',
        payment_method,
        status: 'SUCCESS',
        transaction_reference: mockResult.transaction_reference,
        paid_at: mockResult.paid_at,
      }, { transaction });

      // 6. Create Security Deposit record with status = HELD
      const depositRecord = await SecurityDeposit.create({
        order_id: order.id,
        customer_id: customerId,
        amount: securityDepositAmount,
        status: 'HELD',
        held_at: new Date(),
      }, { transaction });

      // 7. Create Pickup Record & Return Schedule Record
      const pickupRecord = await pickupService.createPickupRecord({
        orderId: order.id,
        customerId: customerId,
        pickupType: order.delivery_method,
        scheduledAt: order.start_date,
      }, transaction);

      const returnRecord = await returnService.createReturnRecord({
        orderId: order.id,
        customerId: customerId,
        scheduledReturnAt: order.end_date,
      }, transaction);

      // 8. Update Order status to CONFIRMED and release hold timer
      order.status = 'CONFIRMED';
      order.expires_at = null;
      await order.save({ transaction });

      // 9. Commit Transaction
      await transaction.commit();

      // 10. Auto-generate Invoice for vendor & customer
      try {
        const invoiceService = require('./invoice.service');
        await invoiceService.createInvoiceForOrder(order.id);
      } catch (invErr) {
        console.error('Failed to auto-generate invoice on payment:', invErr.message);
      }

      return {
        success: true,
        status: 'SUCCESS',
        message: 'Payment processed successfully and rental order confirmed',
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
        },
        payment: successfulPayment,
        security_deposit: depositRecord,
        pickup: pickupRecord,
        return: returnRecord,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get payments for a specific order (Customer / Admin)
   * @param {string} customerId - Null if Admin
   * @param {string} orderId
   */
  async getPaymentsByOrderId(customerId, orderId) {
    const whereCondition = { order_id: orderId };
    if (customerId) {
      whereCondition.customer_id = customerId;
    }

    const payments = await Payment.findAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
    });

    if (customerId && payments.length === 0) {
      // Verify order exists for customer
      const order = await Order.findOne({ where: { id: orderId, customer_id: customerId } });
      if (!order) {
        throw new AppError('Order not found', 404);
      }
    }

    return payments;
  }

  /**
   * Admin view all payment records in system
   * @param {Object} filters - { status, customer_id, payment_method }
   */
  async getAllPaymentsForAdmin(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.customer_id) where.customer_id = filters.customer_id;
    if (filters.payment_method) where.payment_method = filters.payment_method;

    return await Payment.findAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'status'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }
}

module.exports = new PaymentService();
