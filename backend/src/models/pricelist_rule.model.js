const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PricelistRule = sequelize.define(
  'PricelistRule',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pricelist_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pricelists',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    min_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    rule_type: {
      type: DataTypes.ENUM('PERCENT', 'FIXED'),
      allowNull: false,
      defaultValue: 'PERCENT',
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    fixed_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: 'pricelist_rules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = PricelistRule;
