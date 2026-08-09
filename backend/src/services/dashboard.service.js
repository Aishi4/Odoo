const { Op, fn, col } = require('sequelize');
const { Order, OrderItem, RentalPickup, RentalReturn, SecurityDeposit, DepositSettlement, Payment, Product, User } = require('../models');
const AppError = require('../utils/errors');

class DashboardService {
  getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return { startToday: start, endToday: end };
  }

  /**
   * Helper to retrieve array of Order IDs containing items owned by a vendor.
   * Returns null if vendorId is not provided (Admin / SuperAdmin mode).
   */
  async getVendorOrderIds(vendorId) {
    if (!vendorId) return null;
    const vendorItems = await OrderItem.findAll({
      attributes: ['order_id'],
      include: [
        {
          model: Product,
          as: 'product',
          where: { vendor_id: vendorId },
          required: true,
          attributes: [],
        },
      ],
      raw: true,
    });
    return Array.from(new Set(vendorItems.map((item) => item.order_id)));
  }

  async getOverview(vendorId = null) {
    const { startToday, endToday } = this.getTodayRange();
    const now = new Date();

    const productWhere = { status: 'ACTIVE' };
    if (vendorId) {
      productWhere.vendor_id = vendorId;
    }
    const totalProducts = await Product.count({ where: productWhere });

    const orderIds = await this.getVendorOrderIds(vendorId);

    const orderWhere = { status: { [Op.in]: ['CONFIRMED', 'ACTIVE', 'PICKED_UP', 'PENDING_PAYMENT'] } };
    if (orderIds) {
      orderWhere.id = { [Op.in]: orderIds };
    }
    const activeRentals = await Order.count({ where: orderWhere });

    const revenueWhere = { status: { [Op.in]: ['CONFIRMED', 'ACTIVE', 'COMPLETED', 'RETURNED', 'PICKED_UP'] } };
    if (orderIds) {
      revenueWhere.id = { [Op.in]: orderIds };
    }
    const ordersTotal = await Order.sum('subtotal', { where: revenueWhere });
    const rentalRevenue = Number(ordersTotal || 0);

    const dueTodayWhere = { scheduled_return_at: { [Op.between]: [startToday, endToday] }, status: { [Op.ne]: 'COMPLETED' } };
    if (orderIds) {
      dueTodayWhere.order_id = { [Op.in]: orderIds };
    }
    const dueToday = await RentalReturn.count({ where: dueTodayWhere });

    const overdueWhere = { scheduled_return_at: { [Op.lt]: now }, status: { [Op.ne]: 'COMPLETED' } };
    if (orderIds) {
      overdueWhere.order_id = { [Op.in]: orderIds };
    }
    const overdueRentals = await RentalReturn.count({ where: overdueWhere });

    const depositWhere = { status: 'HELD' };
    if (orderIds) {
      depositWhere.order_id = { [Op.in]: orderIds };
    }
    const heldDeposits = await SecurityDeposit.findAll({ where: depositWhere });
    const securityDepositsHeld = heldDeposits.reduce((sum, d) => sum + Number(d.amount), 0);

    const utilizationRate = totalProducts > 0 ? Math.min(100, Math.round((activeRentals / totalProducts) * 100)) : 0;

    return {
      active_rentals: activeRentals,
      due_today: dueToday,
      overdue_rentals: overdueRentals,
      rental_revenue: Number(rentalRevenue.toFixed(2)),
      security_deposits_held: Number(securityDepositsHeld.toFixed(2)),
      utilization_rate: utilizationRate,
      currency: 'INR',
    };
  }

  async getActiveRentals(vendorId = null) {
    const orderIds = await this.getVendorOrderIds(vendorId);
    const where = { status: { [Op.in]: ['CONFIRMED', 'ACTIVE', 'PICKED_UP', 'PENDING_PAYMENT'] } };
    if (orderIds) {
      where.id = { [Op.in]: orderIds };
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return orders.map((o) => o.toJSON());
  }

  async getPriorities(vendorId = null) {
    const { startToday, endToday } = this.getTodayRange();
    const now = new Date();
    const items = [];

    const orderIds = await this.getVendorOrderIds(vendorId);

    // 1. Newly Confirmed Customer Orders Awaiting Fulfillment (HIGH Priority)
    const newOrderWhere = { status: 'CONFIRMED' };
    if (orderIds) {
      newOrderWhere.id = { [Op.in]: orderIds };
    }
    const newOrders = await Order.findAll({
      where: newOrderWhere,
      include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: 10,
    });
    for (const ord of newOrders) {
      items.push({
        type: 'NEW_CUSTOMER_ORDER',
        order_id: ord.id,
        order_number: ord.order_number || ord.id.slice(0, 8),
        customer_name: ord.customer ? ord.customer.name : null,
        priority: 'HIGH',
        message: `New purchase of ₹${ord.subtotal} confirmed! Awaiting vendor fulfillment.`,
      });
    }

    // 2. Overdue Rentals (HIGH Priority)
    const overdueWhere = { scheduled_return_at: { [Op.lt]: now }, status: { [Op.ne]: 'COMPLETED' } };
    if (orderIds) {
      overdueWhere.order_id = { [Op.in]: orderIds };
    }
    const overdue = await RentalReturn.findAll({
      where: overdueWhere,
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

    // 3. Returns Due Today (MEDIUM Priority)
    const dueTodayWhere = { scheduled_return_at: { [Op.between]: [startToday, endToday] }, status: { [Op.ne]: 'COMPLETED' } };
    if (orderIds) {
      dueTodayWhere.order_id = { [Op.in]: orderIds };
    }
    const dueToday = await RentalReturn.findAll({
      where: dueTodayWhere,
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

    // 4. Pickups Due Today (MEDIUM Priority)
    const pickupsWhere = { scheduled_at: { [Op.between]: [startToday, endToday] }, status: { [Op.ne]: 'COMPLETED' } };
    if (orderIds) {
      pickupsWhere.order_id = { [Op.in]: orderIds };
    }
    const pickupsToday = await RentalPickup.findAll({
      where: pickupsWhere,
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

    // 5. Outstanding Late Fees (HIGH Priority)
    const settlementWhere = { outstanding_amount: { [Op.gt]: 0 } };
    if (orderIds) {
      settlementWhere.order_id = { [Op.in]: orderIds };
    }
    const outstandingSettlements = await DepositSettlement.findAll({
      where: settlementWhere,
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

  async getDueTodayRentals(vendorId = null) {
    const { startToday, endToday } = this.getTodayRange();
    const orderIds = await this.getVendorOrderIds(vendorId);

    const where = { scheduled_return_at: { [Op.between]: [startToday, endToday] }, status: { [Op.ne]: 'COMPLETED' } };
    if (orderIds) {
      where.order_id = { [Op.in]: orderIds };
    }

    const items = await RentalReturn.findAll({
      where,
      include: [{ model: Order, as: 'order' }],
    });
    return items.map((i) => i.toJSON());
  }

  async getUpcomingPickups(days = 7, vendorId = null) {
    const numDays = Number(days);
    if (isNaN(numDays) || numDays <= 0) {
      throw new AppError('Days parameter must be a positive number', 400);
    }
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + numDays);

    const orderIds = await this.getVendorOrderIds(vendorId);
    const where = { scheduled_at: { [Op.between]: [start, end] } };
    if (orderIds) {
      where.order_id = { [Op.in]: orderIds };
    }

    const items = await RentalPickup.findAll({
      where,
      include: [{ model: Order, as: 'order' }],
    });
    return items.map((i) => i.toJSON());
  }

  async getUpcomingReturns(days = 7, vendorId = null) {
    const numDays = Number(days);
    if (isNaN(numDays) || numDays <= 0) {
      throw new AppError('Days parameter must be a positive number', 400);
    }
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + numDays);

    const orderIds = await this.getVendorOrderIds(vendorId);
    const where = { scheduled_return_at: { [Op.between]: [start, end] } };
    if (orderIds) {
      where.order_id = { [Op.in]: orderIds };
    }

    const items = await RentalReturn.findAll({
      where,
      include: [{ model: Order, as: 'order' }],
    });
    return items.map((i) => i.toJSON());
  }

  async getOverdueRentals(vendorId = null) {
    const now = new Date();
    const orderIds = await this.getVendorOrderIds(vendorId);
    const where = { scheduled_return_at: { [Op.lt]: now }, status: { [Op.ne]: 'COMPLETED' } };
    if (orderIds) {
      where.order_id = { [Op.in]: orderIds };
    }

    const items = await RentalReturn.findAll({
      where,
      include: [{ model: Order, as: 'order' }],
    });
    return items.map((i) => i.toJSON());
  }

  async getRentalRevenue({ from, to, vendorId = null } = {}) {
    if (from && isNaN(new Date(from).getTime())) {
      throw new AppError('Invalid date format', 400);
    }
    if (to && isNaN(new Date(to).getTime())) {
      throw new AppError('Invalid date format', 400);
    }
    const orderIds = await this.getVendorOrderIds(vendorId);

    const where = { payment_type: 'RENTAL', status: 'SUCCESS' };
    if (from && to) {
      where.created_at = { [Op.between]: [new Date(from), new Date(to)] };
    }
    if (orderIds) {
      where.order_id = { [Op.in]: orderIds };
    }

    const payments = await Payment.findAll({
      where,
      include: [{ model: Order, as: 'order' }],
    });
    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return { rental_revenue: Number(total.toFixed(2)), currency: 'INR', count: payments.length };
  }

  async getSecurityDepositsHeld(vendorId = null) {
    const orderIds = await this.getVendorOrderIds(vendorId);
    const where = { status: 'HELD' };
    if (orderIds) {
      where.order_id = { [Op.in]: orderIds };
    }

    const deposits = await SecurityDeposit.findAll({
      where,
      include: [{ model: Order, as: 'order' }],
    });
    const total = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
    return { total: Number(total.toFixed(2)), currency: 'INR', count: deposits.length };
  }

  async getLateFeeCollection(vendorId = null) {
    const orderIds = await this.getVendorOrderIds(vendorId);
    const where = {};
    if (orderIds) {
      where.order_id = { [Op.in]: orderIds };
    }

    const settlements = await DepositSettlement.findAll({
      where,
      include: [{ model: Order, as: 'order' }],
    });
    const totalCollected = settlements.reduce((sum, s) => sum + Number(s.deduction_amount || 0), 0);
    const totalOutstanding = settlements.reduce((sum, s) => sum + Number(s.outstanding_amount || 0), 0);
    return {
      collected: Number(totalCollected.toFixed(2)),
      outstanding: Number(totalOutstanding.toFixed(2)),
      currency: 'INR',
    };
  }

  async getRentalStatusSummary(vendorId = null) {
    const overview = await this.getOverview(vendorId);
    return { ACTIVE: overview.active_rentals, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
  }

  async getRevenueSummary(period = 'monthly', vendorId = null) {
    const validPeriods = ['daily', 'weekly', 'monthly'];
    if (period && !validPeriods.includes(period)) {
      throw new AppError('Invalid period parameter. Must be daily, weekly, or monthly', 400);
    }
    const overview = await this.getOverview(vendorId);
    return { period, total_revenue: overview.rental_revenue, currency: 'INR' };
  }

  async getTopRentedProducts(limit = 5, vendorId = null) {
    let productWhereClause = {};
    if (vendorId) {
      const vendorProducts = await Product.findAll({
        where: { vendor_id: vendorId },
        attributes: ['id'],
        raw: true,
      });
      const productIds = vendorProducts.map((p) => p.id);
      productWhereClause = { product_id: { [Op.in]: productIds } };
    }

    const items = await OrderItem.findAll({
      where: productWhereClause,
      attributes: [
        'product_id',
        'product_name',
        [fn('SUM', col('quantity')), 'total_quantity'],
        [fn('SUM', col('total_price')), 'total_revenue'],
      ],
      group: ['product_id', 'product_name'],
      order: [[col('total_quantity'), 'DESC']],
      limit: Number(limit),
      raw: true,
    });

    return items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      total_quantity: Number(item.total_quantity || 0),
      total_revenue: Number(Number(item.total_revenue || 0).toFixed(2)),
    }));
  }
}

module.exports = new DashboardService();
