const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RentalPeriod = sequelize.define(
  'RentalPeriod',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vendor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Rental period name is required' },
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'Duration must be an integer' },
        min: { args: [1], msg: 'Duration must be at least 1' },
      },
    },
    unit: {
      type: DataTypes.ENUM('HOUR', 'DAY', 'WEEK', 'MONTH'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['HOUR', 'DAY', 'WEEK', 'MONTH']],
          msg: 'Unit must be HOUR, DAY, WEEK, or MONTH',
        },
      },
    },
    discount_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'Discount cannot be negative' },
        max: { args: [100], msg: 'Discount cannot exceed 100%' },
      },
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    tableName: 'rental_periods',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = RentalPeriod;
