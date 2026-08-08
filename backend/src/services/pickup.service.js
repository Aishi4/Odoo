const { sequelize, RentalPickup, Order, User, OrderItem, Product, ProductVariant } = require('../models');
const rentalAvailabilityService = require('./rentalAvailability.service');
const AppError = require('../utils/errors');
const crypto = require('crypto');

class PickupService {
  /**
   * Helper to generate unique pickup reference code e.g. RNT-PICKUP-8F3K92
   */
  generatePickupCode() {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `RNT-PICKUP-${randomHex}`;
  }

  /**
   * Automatically create a pickup schedule record when an order is confirmed
   * @param {Object} params
   * @param {string} params.orderId
   * @param {string} params.customerId
   * @param {string} params.pickupType - 'DELIVERY' or 'STORE_PICKUP'
   * @param {Date|string} params.scheduledAt
   * @param {Object} transaction - Sequelize transaction
   */
  async createPickupRecord({ orderId, customerId, pickupType, scheduledAt }, transaction = null) {
    const options = transaction ? { transaction } : {};
    const pickupCode = this.generatePickupCode();

    const defaultChecklist = [
      { name: 'Primary Item Body', checked: true },
      { name: 'Power Adaptor & Cables', checked: true },
      { name: 'Protective Carrying Case / Box', checked: true },
    ];

    return await RentalPickup.create({
      order_id: orderId,
      customer_id: customerId,
      pickup_type: pickupType,
      scheduled_at: scheduledAt,
      status: 'READY',
      pickup_code: pickupCode,
      checklist: defaultChecklist,
    }, options);
  }

  /**
   * Admin view pickup schedule with filtering
   * @param {Object} filters - { status, pickup_type, date, customer_id }
   */
  async getAdminPickups(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.pickup_type) where.pickup_type = filters.pickup_type;
    if (filters.customer_id) where.customer_id = filters.customer_id;
    if (filters.date) where.scheduled_at = filters.date;

    return await RentalPickup.findAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'status', 'start_date', 'end_date', 'delivery_address'],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['scheduled_at', 'ASC']],
    });
  }

  /**
   * Admin view pickup details by ID
   * @param {string} id
   */
  async getPickupById(id) {
    const pickup = await RentalPickup.findByPk(id, {
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
        {
          model: User,
          as: 'confirmer',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!pickup) {
      throw new AppError('Pickup record not found', 404);
    }

    return pickup;
  }

  /**
   * Admin search pickup by Barcode / QR pickup_code
   * @param {string} code
   */
  async getPickupByCode(code) {
    const pickup = await RentalPickup.findOne({
      where: { pickup_code: code },
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

    if (!pickup) {
      throw new AppError(`Pickup record with code '${code}' not found`, 404);
    }

    return pickup;
  }

  /**
   * Admin Confirm Pickup / Handover (Atomic Transaction)
   * @param {string} pickupId
   * @param {string} adminId
   * @param {Object} payload - { checklist, notes }
   */
  async confirmPickup(pickupId, adminId, { checklist, notes } = {}) {
    const transaction = await sequelize.transaction();

    try {
      const pickup = await RentalPickup.findByPk(pickupId, { transaction });
      if (!pickup) {
        throw new AppError('Pickup record not found', 404);
      }

      if (pickup.status === 'COMPLETED') {
        throw new AppError('Pickup has already been confirmed and completed', 400);
      }

      const order = await Order.findByPk(pickup.order_id, { transaction });
      if (!order) {
        throw new AppError('Associated rental order not found', 404);
      }

      // Update pickup state
      pickup.status = 'COMPLETED';
      pickup.confirmed_at = new Date();
      pickup.confirmed_by = adminId;
      if (checklist) pickup.checklist = checklist;
      if (notes) pickup.notes = notes;
      await pickup.save({ transaction });

      // Update order state to ACTIVE (or PICKED_UP)
      order.status = 'ACTIVE';
      await order.save({ transaction });

      // Mark items availability/rented state
      await rentalAvailabilityService.markItemsRented(order.id, transaction);

      await transaction.commit();

      return pickup;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Customer view pickup details for their own order
   * @param {string} orderId
   * @param {string} customerId
   */
  async getCustomerPickup(orderId, customerId) {
    const pickup = await RentalPickup.findOne({
      where: {
        order_id: orderId,
        customer_id: customerId,
      },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'status', 'delivery_method', 'delivery_address'],
        },
      ],
    });

    if (!pickup) {
      throw new AppError('Pickup record not found for this order', 404);
    }

    return pickup;
  }
}

module.exports = new PickupService();
