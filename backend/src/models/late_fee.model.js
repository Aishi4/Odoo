const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LateFee = sequelize.define(
  'LateFee',
  {
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
    return_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rental_returns',
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
    config_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'late_fee_configs',
        key: 'id',
      },
    },
    late_duration_hours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    chargeable_units: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    charging_unit: {
      type: DataTypes.ENUM('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'),
      allowNull: false,
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    calculated_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('CALCULATED', 'SETTLED', 'WAIVED'),
      allowNull: false,
      defaultValue: 'CALCULATED',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'late_fees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = LateFee;
