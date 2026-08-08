const { sequelize, RentalReturn, Order, User, OrderItem, SecurityDeposit } = require('../models');
const rentalAvailabilityService = require('./rentalAvailability.service');
const depositSettlementService = require('./depositSettlement.service');
const AppError = require('../utils/errors');

class ReturnService {
  /**
   * Automatically create a return schedule record when an order is confirmed
   * @param {Object} params
   * @param {string} params.orderId
   * @param {string} params.customerId
   * @param {Date|string} params.scheduledReturnAt
   * @param {Object} transaction - Sequelize transaction
   */
  async createReturnRecord({ orderId, customerId, scheduledReturnAt }, transaction = null) {
    const options = transaction ? { transaction } : {};

    return await RentalReturn.create({
      order_id: orderId,
      customer_id: customerId,
      scheduled_return_at: scheduledReturnAt,
      status: 'PENDING',
      condition: 'GOOD',
      missing_accessories: [],
    }, options);
  }

  /**
   * Admin view return schedule with filtering
   * @param {Object} filters - { status, condition, date, customer_id }
   */
  async getAdminReturns(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.condition) where.condition = filters.condition;
    if (filters.customer_id) where.customer_id = filters.customer_id;
    if (filters.date) where.scheduled_return_at = filters.date;

    return await RentalReturn.findAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'status', 'start_date', 'end_date'],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['scheduled_return_at', 'ASC']],
    });
  }

  /**
   * Admin view return details by ID
   * @param {string} id
   */
  async getReturnById(id) {
    const returnRecord = await RentalReturn.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: OrderItem,
              as: 'items',
            },
            {
              model: SecurityDeposit,
              as: 'security_deposit',
            },
          ],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!returnRecord) {
      throw new AppError('Return record not found', 404);
    }

    return returnRecord;
  }

  /**
   * Admin perform return inspection
   * @param {string} returnId
   * @param {string} adminId
   * @param {Object} payload - { condition, damage_report, missing_accessories, notes }
   */
  async inspectReturn(returnId, adminId, { condition, damage_report, missing_accessories, notes } = {}) {
    const returnRecord = await RentalReturn.findByPk(returnId);
    if (!returnRecord) {
      throw new AppError('Return record not found', 404);
    }

    if (returnRecord.status === 'COMPLETED') {
      throw new AppError('Cannot inspect an already completed return', 400);
    }

    const validConditions = ['GOOD', 'DAMAGED', 'MISSING_ITEMS'];
    if (condition && !validConditions.includes(condition)) {
      throw new AppError('Invalid condition. Must be GOOD, DAMAGED, or MISSING_ITEMS', 400);
    }

    returnRecord.status = 'INSPECTION';
    if (condition) returnRecord.condition = condition;
    if (damage_report !== undefined) returnRecord.damage_report = damage_report;
    if (missing_accessories !== undefined) returnRecord.missing_accessories = missing_accessories;
    if (notes !== undefined) returnRecord.notes = notes;
    returnRecord.inspected_by = adminId;

    if (condition === 'DAMAGED' || (damage_report && damage_report.trim() !== '')) {
      returnRecord.repair_required = true;
    }

    await returnRecord.save();
    return returnRecord;
  }

  /**
   * Admin Confirm Physical Return (Atomic Transaction)
   * Evaluates ON_TIME vs LATE return timing, settles security deposit, updates order status & item availability.
   * 
   * @param {string} returnId
   * @param {string} adminId
   * @param {Object} payload - { actual_return_at }
   */
  async confirmReturn(returnId, adminId, { actual_return_at } = {}) {
    const transaction = await sequelize.transaction();

    try {
      const returnRecord = await RentalReturn.findByPk(returnId, { transaction });
      if (!returnRecord) {
        throw new AppError('Return record not found', 404);
      }

      if (returnRecord.status === 'COMPLETED') {
        throw new AppError('Return has already been confirmed and completed', 400);
      }

      const order = await Order.findByPk(returnRecord.order_id, { transaction });
      if (!order) {
        throw new AppError('Associated order not found', 404);
      }

      // Determine actual return timestamp
      const actualTime = actual_return_at ? new Date(actual_return_at) : new Date();
      if (isNaN(actualTime.getTime())) {
        throw new AppError('Invalid actual_return_at date format', 400);
      }

      // Determine ON_TIME vs LATE
      const scheduledTime = new Date(returnRecord.scheduled_return_at);
      // If scheduled time was date-only (00:00:00 UTC), set deadline to 23:59:59.999 UTC of that date
      if (scheduledTime.getUTCHours() === 0 && scheduledTime.getUTCMinutes() === 0 && scheduledTime.getUTCSeconds() === 0) {
        scheduledTime.setUTCHours(23, 59, 59, 999);
      }

      const returnTiming = actualTime > scheduledTime ? 'LATE' : 'ON_TIME';

      // Update Return Record
      returnRecord.status = 'COMPLETED';
      returnRecord.actual_return_at = actualTime;
      returnRecord.return_timing = returnTiming;
      returnRecord.inspected_by = adminId;
      await returnRecord.save({ transaction });

      // Update Order Status
      order.status = 'RETURNED';
      await order.save({ transaction });

      // Update Product/Variant Availability
      await rentalAvailabilityService.markItemsAvailable(order.id, transaction);

      // Trigger Security Deposit Settlement Logic (NO late fee calculation in Phase 5)
      await depositSettlementService.settleDepositOnReturn(order.id, returnTiming, transaction);

      await transaction.commit();

      return {
        return: returnRecord,
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
        },
        return_timing: returnTiming,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Customer view return details for their own order
   * @param {string} orderId
   * @param {string} customerId
   */
  async getCustomerReturn(orderId, customerId) {
    const returnRecord = await RentalReturn.findOne({
      where: {
        order_id: orderId,
        customer_id: customerId,
      },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'status', 'start_date', 'end_date'],
        },
      ],
    });

    if (!returnRecord) {
      throw new AppError('Return record not found for this order', 404);
    }

    return returnRecord;
  }
}

module.exports = new ReturnService();
