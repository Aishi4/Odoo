const { sequelize } = require('../config/db');
const User = require('./user.model');
const Product = require('./product.model');
const ProductVariant = require('./variant.model');
const RentalPeriod = require('./rental_period.model');

// Define 1:N Relationship between Product and ProductVariant
Product.hasMany(ProductVariant, {
  foreignKey: 'product_id',
  as: 'variants',
  onDelete: 'CASCADE',
});

ProductVariant.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

module.exports = {
  sequelize,
  User,
  Product,
  ProductVariant,
  RentalPeriod,
};
