const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RentalPickup = sequelize.define(
  'RentalPickup',
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
    pickup_type: {
      type: DataTypes.ENUM('DELIVERY', 'STORE_PICKUP'),
      allowNull: false,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'READY', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'SCHEDULED',
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    confirmed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    pickup_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    checklist: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'rental_pickups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = RentalPickup;
