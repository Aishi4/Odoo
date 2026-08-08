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
      type: DataTypes.ENUM('DAY', 'WEEK', 'MONTH'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['DAY', 'WEEK', 'MONTH']],
          msg: 'Unit must be DAY, WEEK, or MONTH',
        },
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
