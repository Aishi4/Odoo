const { Op } = require('sequelize');
const { sequelize, LateFeeConfig, LateFee, RentalReturn, Order, User, SecurityDeposit } = require('../models');
const depositSettlementService = require('./depositSettlement.service');
const AppError = require('../utils/errors');

class LateFeeService {
  // --- LATE FEE CONFIGURATION CRUD ---

  async createConfig(payload) {
    const { name, charging_unit, rate, grace_period = 0, max_fee = null } = payload;
    if (!name || !charging_unit || rate === undefined) {
      throw new AppError('Name, charging_unit, and rate are required', 400);
    }
    const validUnits = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'];
    if (!validUnits.includes(charging_unit)) {
      throw new AppError('Invalid charging unit. Must be HOURLY, DAILY, WEEKLY, or MONTHLY', 400);
    }

    return await LateFeeConfig.create({
      name,
      charging_unit,
      rate: Number(rate),
      grace_period: Number(grace_period),
      max_fee: max_fee !== null && max_fee !== undefined ? Number(max_fee) : null,
      status: 'ACTIVE',
    });
  }

  async getConfigs() {
    return await LateFeeConfig.findAll({ order: [['created_at', 'DESC']] });
  }

  async getConfigById(id) {
    const config = await LateFeeConfig.findByPk(id);
    if (!config) {
      throw new AppError('Late fee configuration not found', 404);
    }
    return config;
  }

  async updateConfig(id, payload) {
    const config = await this.getConfigById(id);
    const { name, charging_unit, rate, grace_period, max_fee, status } = payload;

    if (name) config.name = name;
    if (charging_unit) config.charging_unit = charging_unit;
    if (rate !== undefined) config.rate = Number(rate);
    if (grace_period !== undefined) config.grace_period = Number(grace_period);
    if (max_fee !== undefined) config.max_fee = max_fee !== null ? Number(max_fee) : null;
    if (status) config.status = status;

    await config.save();
    return config;
  }

  async deactivateConfig(id) {
    const config = await this.getConfigById(id);
    config.status = 'INACTIVE';
    await config.save();
    return config;
  }

  async getActiveConfig() {
    let config = await LateFeeConfig.findOne({ where: { status: 'ACTIVE' }, order: [['created_at', 'DESC']] });
    if (!config) {
      // Fallback default config if none configured in DB
      config = await LateFeeConfig.create({
        name: 'Default System Late Fee',
        charging_unit: 'DAILY',
        rate: 500,
        grace_period: 2,
        max_fee: 5000,
        status: 'ACTIVE',
      });
    }
    return config;
  }

  // --- LATE FEE CALCULATION ENGINE ---

  /**
   * Pure calculation function (Server-side)
   * @param {Object} returnRecord
   * @param {Object} config
   */
  calculateLateFee(returnRecord, config) {
    const scheduledTime = new Date(returnRecord.scheduled_return_at);
    // If scheduled time was date-only (00:00:00 UTC), set deadline to 23:59:59.999 UTC of that date
    if (scheduledTime.getUTCHours() === 0 && scheduledTime.getUTCMinutes() === 0 && scheduledTime.getUTCSeconds() === 0) {
      scheduledTime.setUTCHours(23, 59, 59, 999);
    }

    const actualTime = returnRecord.actual_return_at ? new Date(returnRecord.actual_return_at) : new Date();

    const lateDurationMs = Math.max(0, actualTime.getTime() - scheduledTime.getTime());
    const lateDurationHours = lateDurationMs / (1000 * 60 * 60);

    const gracePeriodHours = Number(config.grace_period || 0);
    const chargeableHours = Math.max(0, lateDurationHours - gracePeriodHours);

    let chargeableUnits = 0;
    let calculatedAmount = 0.00;

    if (chargeableHours > 0) {
      switch (config.charging_unit) {
        case 'HOURLY':
          // Partial hour counts as full hour
          chargeableUnits = Math.ceil(chargeableHours);
          break;
        case 'DAILY':
          // Partial day (24-hour block) counts as full day
          chargeableUnits = Math.ceil(chargeableHours / 24);
          break;
        case 'WEEKLY':
          // Partial week (168-hour block) counts as full week
          chargeableUnits = Math.ceil(chargeableHours / (24 * 7));
          break;
        case 'MONTHLY':
          // Partial month (30-day / 720-hour block) counts as full month
          chargeableUnits = Math.ceil(chargeableHours / (24 * 30));
          break;
        default:
          chargeableUnits = Math.ceil(chargeableHours / 24);
      }

      calculatedAmount = Math.round(chargeableUnits * Number(config.rate) * 100) / 100;
    }

    const maxFee = config.max_fee !== null && config.max_fee !== undefined ? Number(config.max_fee) : null;
    let finalAmount = calculatedAmount;
    if (maxFee !== null && calculatedAmount > maxFee) {
      finalAmount = maxFee;
    }

    return {
      lateDurationHours: Math.round(lateDurationHours * 100) / 100,
      chargeableHours: Math.round(chargeableHours * 100) / 100,
      chargeableUnits,
      chargingUnit: config.charging_unit,
      rate: Number(config.rate),
      calculatedAmount,
      finalAmount,
      configId: config.id,
    };
  }

  /**
   * Process Late Fee Calculation & Security Deposit Settlement (Atomic & Idempotent)
   * @param {string} returnId
   * @param {string} configId - Optional specific config ID
   */
  async calculateAndSaveLateFee(returnId, configId = null) {
    const returnRecord = await RentalReturn.findByPk(returnId, {
      include: [{ model: Order, as: 'order' }],
    });

    if (!returnRecord) {
      throw new AppError('Return record not found', 404);
    }

    // Idempotency check: Return existing late fee if already calculated
    const existingLateFee = await LateFee.findOne({
      where: { return_id: returnId },
      include: [
        { model: LateFeeConfig, as: 'config' },
        { model: depositSettlementService.DepositSettlementModel || require('../models').DepositSettlement, as: 'settlement' },
      ],
    });

    if (existingLateFee) {
      return {
        message: 'Late fee has already been calculated for this return',
        late_fee: existingLateFee,
        is_existing: true,
      };
    }

    // Determine config to use
    let config;
    if (configId) {
      config = await this.getConfigById(configId);
    } else {
      config = await this.getActiveConfig();
    }

    // Calculate details
    const calc = this.calculateLateFee(returnRecord, config);

    const transaction = await sequelize.transaction();

    try {
      // 1. Create LateFee record
      const lateFeeRecord = await LateFee.create({
        order_id: returnRecord.order_id,
        return_id: returnRecord.id,
        customer_id: returnRecord.customer_id,
        config_id: config.id,
        late_duration_hours: calc.lateDurationHours,
        chargeable_units: calc.chargeableUnits,
        charging_unit: calc.chargingUnit,
        rate: calc.rate,
        calculated_amount: calc.calculatedAmount,
        final_amount: calc.finalAmount,
        status: 'CALCULATED',
      }, { transaction });

      // 2. Perform Deposit Settlement
      const settlement = await depositSettlementService.settleDepositWithLateFee({
        orderId: returnRecord.order_id,
        lateFeeRecord,
        transaction,
      });

      await transaction.commit();

      return {
        message: 'Late fee calculated and deposit settled successfully',
        late_fee: lateFeeRecord,
        settlement,
        is_existing: false,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --- AUTOMATIC OVERDUE DETECTION & PROCESSING ---

  async findOverdueRentals() {
    const now = new Date();
    return await RentalReturn.findAll({
      where: {
        status: { [Op.ne]: 'COMPLETED' },
        scheduled_return_at: { [Op.lt]: now },
      },
      include: [
        { model: Order, as: 'order' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
    });
  }

  async processOverdueRentals() {
    const overdueReturns = await this.findOverdueRentals();
    const results = [];

    for (const returnRecord of overdueReturns) {
      try {
        const result = await this.calculateAndSaveLateFee(returnRecord.id);
        results.push({ return_id: returnRecord.id, status: 'SUCCESS', result });
      } catch (err) {
        results.push({ return_id: returnRecord.id, status: 'ERROR', message: err.message });
      }
    }

    return {
      processed_count: results.length,
      details: results,
    };
  }

  // --- WAIVE LATE FEE ---

  async waiveLateFee(lateFeeId, adminNotes = '') {
    const transaction = await sequelize.transaction();

    try {
      const lateFee = await LateFee.findByPk(lateFeeId, { transaction });
      if (!lateFee) {
        throw new AppError('Late fee record not found', 404);
      }

      if (lateFee.status === 'WAIVED') {
        throw new AppError('Late fee has already been waived', 400);
      }

      lateFee.status = 'WAIVED';
      if (adminNotes) lateFee.notes = adminNotes;
      await lateFee.save({ transaction });

      // Re-settle deposit with zero fee (Full Refund)
      const settlement = await depositSettlementService.settleDepositWithLateFee({
        orderId: lateFee.order_id,
        lateFeeRecord: lateFee,
        isWaived: true,
        transaction,
      });

      await transaction.commit();

      return {
        message: 'Late fee waived successfully and deposit refunded',
        late_fee: lateFee,
        settlement,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --- QUERIES & REPORTS ---

  async getLateFees(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.customer_id) where.customer_id = filters.customer_id;
    if (filters.order_id) where.order_id = filters.order_id;

    return await LateFee.findAll({
      where,
      include: [
        { model: Order, as: 'order', attributes: ['id', 'order_number'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: LateFeeConfig, as: 'config' },
        { model: depositSettlementService.DepositSettlementModel || require('../models').DepositSettlement, as: 'settlement' },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async getOutstandingLateFees() {
    const { DepositSettlement } = require('../models');
    return await DepositSettlement.findAll({
      where: {
        outstanding_amount: { [Op.gt]: 0 },
      },
      include: [
        { model: Order, as: 'order', attributes: ['id', 'order_number'] },
        {
          model: LateFee,
          as: 'late_fee',
          include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async getCustomerLateFee(orderId, customerId) {
    const lateFee = await LateFee.findOne({
      where: { order_id: orderId, customer_id: customerId },
      include: [
        { model: LateFeeConfig, as: 'config' },
        { model: depositSettlementService.DepositSettlementModel || require('../models').DepositSettlement, as: 'settlement' },
      ],
    });

    if (!lateFee) {
      // Check if order exists for customer
      const order = await Order.findOne({ where: { id: orderId, customer_id: customerId } });
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      return {
        message: 'No late fee incurred for this order',
        late_duration_hours: 0,
        final_amount: 0,
        status: 'NONE',
      };
    }

    return lateFee;
  }
}

module.exports = new LateFeeService();
