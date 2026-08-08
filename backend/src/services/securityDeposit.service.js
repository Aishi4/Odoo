const { SecurityDeposit, Order } = require('../models');
const AppError = require('../utils/errors');

class SecurityDepositService {
  constructor() {
    // Default deposit configuration rule (Percentage or Fixed)
    // Easily configurable per org in future phases
    this.depositRule = {
      type: 'PERCENTAGE', // 'FIXED' or 'PERCENTAGE'
      value: 20,         // 20% or fixed amount
    };
  }

  /**
   * Calculate security deposit amount from order subtotal
   * @param {number|string} orderSubtotal
   * @returns {number}
   */
  calculateDeposit(orderSubtotal) {
    const subtotal = Number(orderSubtotal) || 0;
    if (subtotal <= 0) return 0;

    let depositAmount = 0;
    if (this.depositRule.type === 'PERCENTAGE') {
      depositAmount = (subtotal * this.depositRule.value) / 100;
    } else if (this.depositRule.type === 'FIXED') {
      depositAmount = Number(this.depositRule.value);
    }

    return Math.round(depositAmount * 100) / 100;
  }

  /**
   * Create a security deposit record in database
   * @param {string} orderId
   * @param {string} customerId
   * @param {number} amount
   * @param {string} status - Default 'HELD'
   * @param {Object} transaction - Sequelize transaction
   */
  async createDepositRecord({ orderId, customerId, amount, status = 'HELD' }, transaction = null) {
    const options = transaction ? { transaction } : {};
    
    return await SecurityDeposit.create({
      order_id: orderId,
      customer_id: customerId,
      amount,
      status,
      held_at: status === 'HELD' ? new Date() : null,
    }, options);
  }

  /**
   * Get Security Deposit details for a specific order
   * @param {string} customerId - Null if admin
   * @param {string} orderId
   */
  async getDepositByOrderId(customerId, orderId) {
    const whereCondition = { order_id: orderId };
    if (customerId) {
      whereCondition.customer_id = customerId;
    }

    const deposit = await SecurityDeposit.findOne({
      where: whereCondition,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'status', 'subtotal'],
        },
      ],
    });

    if (!deposit) {
      throw new AppError('Security deposit record not found for this order', 404);
    }

    return deposit;
  }

  /**
   * Admin view all security deposit records with filters
   * @param {Object} filters - { status, customer_id, start_date, end_date }
   */
  async getAllDepositsForAdmin(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.customer_id) where.customer_id = filters.customer_id;

    return await SecurityDeposit.findAll({
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

module.exports = new SecurityDepositService();
