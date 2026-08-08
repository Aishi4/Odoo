const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SecurityDeposit = sequelize.define('SecurityDeposit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rental_orders',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'HELD', 'PARTIALLY_REFUNDED', 'REFUNDED', 'DEDUCTED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  held_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refunded_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refunded_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  deducted_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
}, {
  tableName: 'security_deposits',
  timestamps: true,
  underscored: true,
});

module.exports = SecurityDeposit;
