const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RentalReturn = sequelize.define(
  'RentalReturn',
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
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    scheduled_return_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    actual_return_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'INSPECTION', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    condition: {
      type: DataTypes.ENUM('GOOD', 'DAMAGED', 'MISSING_ITEMS'),
      allowNull: false,
      defaultValue: 'GOOD',
    },
    damage_report: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    missing_accessories: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    repair_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    return_timing: {
      type: DataTypes.ENUM('ON_TIME', 'LATE'),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    inspected_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'rental_returns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = RentalReturn;
