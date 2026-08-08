const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DepositSettlement = sequelize.define(
  'DepositSettlement',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    deposit_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'security_deposits',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    late_fee_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'late_fees',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    deducted_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    refunded_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    outstanding_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    settlement_status: {
      type: DataTypes.ENUM('FULL_REFUND', 'PARTIAL_REFUND', 'FULL_DEDUCTION', 'OUTSTANDING'),
      allowNull: false,
    },
    settled_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'deposit_settlements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = DepositSettlement;
