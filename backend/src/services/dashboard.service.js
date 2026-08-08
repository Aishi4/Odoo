const { Op, fn, col, sequelize } = require('sequelize');
const { Order, OrderItem, Product, ProductVariant, User, RentalPickup, RentalReturn, Payment, SecurityDeposit, LateFee, DepositSettlement } = require('../models');
const AppError = require('../utils/errors');

class DashboardService {
  /**
   * Helper to get start and end of today in local/UTC Date
   */
  getTodayRange() {
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    return { startToday, endToday };
  }

  /**
   * Main Dashboard Overview Metrics (Single Payload)
   */
  async getOverview() {
    const { startToday, endToday } = this.getTodayRange();
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 1. Active Rentals Count (ACTIVE or PICKED_UP)
    const activeRentals = await Order.count({
      where: { status: { [Op.in]: ['ACTIVE', 'PICKED_UP'] } },
    });

    // 2. Rentals Due Today Count
    const rentalsDueToday = await RentalReturn.count({
      where: {
        scheduled_return_at: { [Op.between]: [startToday, endToday] },
        status: { [Op.ne]: 'COMPLETED' },
      },
    });

    // 3. Upcoming Pickups Count (Next 7 Days)
    const upcomingPickups = await RentalPickup.count({
      where: {
        scheduled_at: { [Op.between]: [now, next7Days] },
        status: { [Op.ne]: 'COMPLETED' },
      },
    });

    // 4. Upcoming Returns Count (Next 7 Days)
    const upcomingReturns = await RentalReturn.count({
      where: {
        scheduled_return_at: { [Op.between]: [now, next7Days] },
        status: { [Op.ne]: 'COMPLETED' },
      },
    });

    // 5. Overdue Rentals Count
    const overdueRentals = await RentalReturn.count({
      where: {
        scheduled_return_at: { [Op.lt]: now },
        status: { [Op.ne]: 'COMPLETED' },
      },
    });

    // 6. Rental Revenue (SUM of SUCCESS RENTAL payments, excluding deposits)
    const revenueSum = await Payment.sum('amount', {
      where: {
        payment_type: 'RENTAL',
        status: 'SUCCESS',
      },
    });

    // 7. Security Deposits Held Total (SUM of HELD status deposits)
    const depositsHeldSum = await SecurityDeposit.sum('amount', {
      where: {
        status: 'HELD',
      },
    });

    // 8. Late Fee Collection Total (SUM of SETTLED late fees)
    const lateFeeCollectionSum = await LateFee.sum('final_amount', {
      where: {
        status: 'SETTLED',
      },
    });

    return {
      active_rentals: activeRentals || 0,
      rentals_due_today: rentalsDueToday || 0,
      upcoming_pickups: upcomingPickups || 0,
      upcoming_returns: upcomingReturns || 0,
      overdue_rentals: overdueRentals || 0,
      rental_revenue: Number((revenueSum || 0).toFixed(2)),
      security_deposits_held: Number((depositsHeldSum || 0).toFixed(2)),
      late_fee_collection: Number((lateFeeCollectionSum || 0).toFixed(2)),
      currency: 'INR',
    };
  }

  /**
   * Active Rentals List
   */
  async getActiveRentals() {
    return await Order.findAll({
      where: { status: { [Op.in]: ['ACTIVE', 'PICKED_UP'] } },
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Product, as: 'product', attributes: ['id', 'name', 'category'] },
            { model: ProductVariant, as: 'variant' },
          ],
        },
        { model: RentalPickup, as: 'pickup' },
        { model: RentalReturn, as: 'return' },
      ],
      order: [['start_date', 'ASC']],
    });
  }

  /**
   * Rentals Due Today List
   */
  async getDueTodayRentals() {
    const { startToday, endToday } = this.getTodayRange();

    return await RentalReturn.findAll({
      where: {
        scheduled_return_at: { [Op.between]: [startToday, endToday] },
        status: { [Op.ne]: 'COMPLETED' },
      },
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: OrderItem,
              as: 'items',
              include: [{ model: Product, as: 'product' }],
            },
          ],
        },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
      order: [['scheduled_return_at', 'ASC']],
    });
  }

  /**
   * Upcoming Pickups List (Days parameter)
   */
  async getUpcomingPickups(days = 7) {
    const numDays = Number(days);
    if (isNaN(numDays) || numDays <= 0 || numDays > 365) {
      throw new AppError('Invalid days parameter. Must be an integer between 1 and 365', 400);
    }

    const now = new Date();
    const futureDate = new Date(now.getTime() + numDays * 24 * 60 * 60 * 1000);

    return await RentalPickup.findAll({
      where: {
        scheduled_at: { [Op.between]: [now, futureDate] },
        status: { [Op.ne]: 'COMPLETED' },
      },
      include: [
        { model: Order, as: 'order', attributes: ['id', 'order_number', 'status', 'start_date', 'end_date'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
      order: [['scheduled_at', 'ASC']],
    });
  }

  /**
   * Upcoming Returns List (Days parameter)
   */
  async getUpcomingReturns(days = 7) {
    const numDays = Number(days);
    if (isNaN(numDays) || numDays <= 0 || numDays > 365) {
      throw new AppError('Invalid days parameter. Must be an integer between 1 and 365', 400);
    }

    const now = new Date();
    const futureDate = new Date(now.getTime() + numDays * 24 * 60 * 60 * 1000);

    return await RentalReturn.findAll({
      where: {
        scheduled_return_at: { [Op.between]: [now, futureDate] },
        status: { [Op.ne]: 'COMPLETED' },
      },
      include: [
        {
          model: Order,
          as: 'order',
          include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
        },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
      order: [['scheduled_return_at', 'ASC']],
    });
  }

  /**
   * Overdue Rentals List
   */
  async getOverdueRentals() {
    const now = new Date();

    return await RentalReturn.findAll({
      where: {
        scheduled_return_at: { [Op.lt]: now },
        status: { [Op.ne]: 'COMPLETED' },
      },
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
            { model: SecurityDeposit, as: 'security_deposit' },
          ],
        },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: LateFee, as: 'late_fee' },
      ],
      order: [['scheduled_return_at', 'ASC']],
    });
  }

  /**
   * Rental Revenue (Date range filtered)
   */
  async getRentalRevenue({ from, to } = {}) {
    const where = {
      payment_type: 'RENTAL',
      status: 'SUCCESS',
    };

    if (from || to) {
      where.paid_at = {};
      if (from) {
        const fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) throw new AppError('Invalid from date format', 400);
        where.paid_at[Op.gte] = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (isNaN(toDate.getTime())) throw new AppError('Invalid to date format', 400);
        toDate.setHours(23, 59, 59, 999);
        where.paid_at[Op.lte] = toDate;
      }
    }

    const revenueSum = await Payment.sum('amount', { where });

    return {
      from: from || 'ALL_TIME',
      to: to || 'ALL_TIME',
      rental_revenue: Number((revenueSum || 0).toFixed(2)),
      currency: 'INR',
    };
  }

  /**
   * Total Security Deposits Currently Held
   */
  async getSecurityDepositsHeld() {
    const heldDeposits = await SecurityDeposit.findAll({
      where: { status: 'HELD' },
      include: [
        { model: Order, as: 'order', attributes: ['id', 'order_number'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
    });

    const totalHeld = heldDeposits.reduce((sum, dep) => sum + Number(dep.amount), 0);

    return {
      total_held_amount: Number(totalHeld.toFixed(2)),
      count: heldDeposits.length,
      deposits: heldDeposits,
      currency: 'INR',
    };
  }

  /**
   * Total Late Fees Collected / Settled
   */
  async getLateFeeCollection() {
    const settledFees = await LateFee.findAll({
      where: { status: 'SETTLED' },
      include: [
        { model: Order, as: 'order', attributes: ['id', 'order_number'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
    });

    const totalCollected = settledFees.reduce((sum, fee) => sum + Number(fee.final_amount), 0);

    return {
      late_fee_collection: Number(totalCollected.toFixed(2)),
      count: settledFees.length,
      fees: settledFees,
      currency: 'INR',
    };
  }

  /**
   * Dashboard Operational Priorities
   */
  async getPriorities() {
    const { startToday, endToday } = this.getTodayRange();
    const now = new Date();
    const items = [];

    // 1. Overdue Rentals (HIGH Priority)
    const overdue = await RentalReturn.findAll({
      where: { scheduled_return_at: { [Op.lt]: now }, status: { [Op.ne]: 'COMPLETED' } },
      include: [{ model: Order, as: 'order' }, { model: User, as: 'customer' }],
    });
    for (const ret of overdue) {
      items.push({
        type: 'OVERDUE_RENTAL',
        order_id: ret.order_id,
        order_number: ret.order ? ret.order.order_number : null,
        customer_name: ret.customer ? ret.customer.name : null,
        priority: 'HIGH',
        message: `Rental return scheduled for ${ret.scheduled_return_at} is overdue!`,
      });
    }

    // 2. Returns Due Today (MEDIUM Priority)
    const dueToday = await RentalReturn.findAll({
      where: { scheduled_return_at: { [Op.between]: [startToday, endToday] }, status: { [Op.ne]: 'COMPLETED' } },
      include: [{ model: Order, as: 'order' }, { model: User, as: 'customer' }],
    });
    for (const ret of dueToday) {
      items.push({
        type: 'RETURN_DUE_TODAY',
        order_id: ret.order_id,
        order_number: ret.order ? ret.order.order_number : null,
        customer_name: ret.customer ? ret.customer.name : null,
        priority: 'MEDIUM',
        message: 'Rental is scheduled for return today',
      });
    }

    // 3. Pickups Due Today (MEDIUM Priority)
    const pickupsToday = await RentalPickup.findAll({
      where: { scheduled_at: { [Op.between]: [startToday, endToday] }, status: { [Op.ne]: 'COMPLETED' } },
      include: [{ model: Order, as: 'order' }, { model: User, as: 'customer' }],
    });
    for (const pic of pickupsToday) {
      items.push({
        type: 'PICKUP_DUE_TODAY',
        order_id: pic.order_id,
        order_number: pic.order ? pic.order.order_number : null,
        customer_name: pic.customer ? pic.customer.name : null,
        priority: 'MEDIUM',
        message: 'Rental is scheduled for pickup today',
      });
    }

    // 4. Damage Reported (HIGH Priority)
    const damagedReturns = await RentalReturn.findAll({
      where: { repair_required: true, status: { [Op.ne]: 'COMPLETED' } },
      include: [{ model: Order, as: 'order' }, { model: User, as: 'customer' }],
    });
    for (const ret of damagedReturns) {
      items.push({
        type: 'DAMAGE_REPORTED',
        order_id: ret.order_id,
        order_number: ret.order ? ret.order.order_number : null,
        customer_name: ret.customer ? ret.customer.name : null,
        priority: 'HIGH',
        message: `Equipment damage reported: ${ret.damage_report || 'Repair required'}`,
      });
    }

    // 5. Outstanding Late Fees (HIGH Priority)
    const outstandingSettlements = await DepositSettlement.findAll({
      where: { outstanding_amount: { [Op.gt]: 0 } },
      include: [{ model: Order, as: 'order' }],
    });
    for (const set of outstandingSettlements) {
      items.push({
        type: 'OUTSTANDING_LATE_FEE',
        order_id: set.order_id,
        order_number: set.order ? set.order.order_number : null,
        priority: 'HIGH',
        message: `Outstanding penalty of ₹${set.outstanding_amount} pending collection`,
      });
    }

    return {
      total: items.length,
      items,
    };
  }

  /**
   * Rental Order Status Summary Breakdown
   */
  async getRentalStatusSummary() {
    const validStatuses = [
      'PENDING_PAYMENT',
      'CONFIRMED',
      'READY_FOR_PICKUP',
      'PICKED_UP',
      'ACTIVE',
      'RETURN_PENDING',
      'RETURNED',
      'COMPLETED',
      'CANCELLED',
    ];

    const results = await Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const summary = {};
    validStatuses.forEach((status) => {
      summary[status] = 0;
    });

    results.forEach((row) => {
      if (summary[row.status] !== undefined) {
        summary[row.status] = Number(row.count);
      }
    });

    return summary;
  }

  /**
   * Revenue Summary Breakdown (daily, weekly, monthly)
   */
  async getRevenueSummary(period = 'monthly') {
    const validPeriods = ['daily', 'weekly', 'monthly'];
    if (!validPeriods.includes(period.toLowerCase())) {
      throw new AppError('Invalid period parameter. Must be daily, weekly, or monthly', 400);
    }

    const payments = await Payment.findAll({
      where: { payment_type: 'RENTAL', status: 'SUCCESS' },
      order: [['paid_at', 'ASC']],
    });

    const summaryMap = {};

    payments.forEach((pay) => {
      const paidDate = new Date(pay.paid_at);
      let key;

      if (period === 'daily') {
        key = paidDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'weekly') {
        // Get week number
        const startOfYear = new Date(paidDate.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((paidDate - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        key = `${paidDate.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      } else {
        // monthly
        key = paidDate.toISOString().substring(0, 7); // YYYY-MM
      }

      summaryMap[key] = (summaryMap[key] || 0) + Number(pay.amount);
    });

    const data = Object.keys(summaryMap).map((key) => ({
      period: key,
      revenue: Number(summaryMap[key].toFixed(2)),
    }));

    return {
      period: period.toLowerCase(),
      currency: 'INR',
      data,
    };
  }
}

module.exports = new DashboardService();
