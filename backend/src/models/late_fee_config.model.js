const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LateFeeConfig = sequelize.define(
  'LateFeeConfig',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    charging_unit: {
      type: DataTypes.ENUM('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'),
      allowNull: false,
      defaultValue: 'DAILY',
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    grace_period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Grace period in hours
    },
    max_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    tableName: 'late_fee_configs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = LateFeeConfig;
