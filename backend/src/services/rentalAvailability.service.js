const { OrderItem, Product, ProductVariant } = require('../models');

class RentalAvailabilityService {
  /**
   * Mark products/variants as currently rented (ACTIVE)
   * @param {string} orderId
   * @param {Object} transaction - Sequelize transaction
   */
  async markItemsRented(orderId, transaction = null) {
    const options = transaction ? { transaction } : {};
    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId },
      ...options,
    });

    for (const item of orderItems) {
      if (item.variant_id) {
        await ProductVariant.update(
          { status: 'ACTIVE' },
          { where: { id: item.variant_id }, ...options }
        );
      }
      if (item.product_id) {
        await Product.update(
          { status: 'ACTIVE' },
          { where: { id: item.product_id }, ...options }
        );
      }
    }
  }

  /**
   * Mark products/variants as available again after return
   * @param {string} orderId
   * @param {Object} transaction - Sequelize transaction
   */
  async markItemsAvailable(orderId, transaction = null) {
    const options = transaction ? { transaction } : {};
    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId },
      ...options,
    });

    for (const item of orderItems) {
      if (item.variant_id) {
        await ProductVariant.update(
          { status: 'ACTIVE' },
          { where: { id: item.variant_id }, ...options }
        );
      }
      if (item.product_id) {
        await Product.update(
          { status: 'ACTIVE' },
          { where: { id: item.product_id }, ...options }
        );
      }
    }
  }
}

module.exports = new RentalAvailabilityService();
