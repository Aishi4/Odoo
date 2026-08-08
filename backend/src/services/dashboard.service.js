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

  async getOverview() {
    const { startToday, endToday } = this.getTodayRange();
    const now = new Date();

    const activeRentals = await Order.count({
      where: { status: { [Op.in]: ['CONFIRMED', 'ACTIVE', 'PICKED_UP', 'PENDING_PAYMENT'] } },
    });

    const dueToday = await RentalReturn.count({
      where: { scheduled_return_at: { [Op.between]: [startToday, endToday] }, status: { [Op.ne]: 'COMPLETED' } },
    });

    const overdueRentals = await RentalReturn.count({
      where: { scheduled_return_at: { [Op.lt]: now }, status: { [Op.ne]: 'COMPLETED' } },
    });

    const successfulPayments = await Payment.findAll({
      where: { payment_type: 'RENTAL', status: 'SUCCESS' },
    });
    const rentalRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const heldDeposits = await SecurityDeposit.findAll({
      where: { status: 'HELD' },
    });
    const securityDepositsHeld = heldDeposits.reduce((sum, d) => sum + Number(d.amount), 0);

    return {
      active_rentals: activeRentals,
      due_today: dueToday,
      overdue_rentals: overdueRentals,
      rental_revenue: Number(rentalRevenue.toFixed(2)),
      security_deposits_held: Number(securityDepositsHeld.toFixed(2)),
      currency: 'INR',
    };
  }

  async getActiveRentals() {
    const orders = await Order.findAll({
      where: { status: { [Op.in]: ['CONFIRMED', 'ACTIVE', 'PICKED_UP', 'PENDING_PAYMENT'] } },
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return orders.map((o) => o.toJSON());
  }

  async getPriorities() {
    const { startToday, endToday } = this.getTodayRange();
    const now = new Date();
    const items = [];

    // 1. Newly Confirmed Customer Orders Awaiting Fulfillment (HIGH Priority)
    const newOrders = await Order.findAll({
      where: { status: 'CONFIRMED' },
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

    // 3. Returns Due Today (MEDIUM Priority)
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

    // 4. Pickups Due Today (MEDIUM Priority)
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
}

module.exports = new DashboardService();
