const { Op } = require('sequelize');
const { Pricelist, PricelistRule, Product } = require('../models');
const AppError = require('../utils/errors');

const getAllPricelists = async (vendorId = null) => {
  const where = vendorId
    ? { [Op.or]: [{ vendor_id: vendorId }, { vendor_id: null }] }
    : {};

  const pricelists = await Pricelist.findAll({
    where,
    include: [
      {
        model: PricelistRule,
        as: 'rules',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'base_price', 'vendor_id'] }],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  return pricelists.map((p) => {
    const json = p.toJSON();
    if (vendorId && json.rules) {
      json.rules = json.rules.filter(
        (rule) => !rule.product || !rule.product.vendor_id || rule.product.vendor_id === vendorId
      );
    }
    return json;
  });
};

const getPricelistById = async (id, vendorId = null) => {
  const pricelist = await Pricelist.findByPk(id, {
    include: [
      {
        model: PricelistRule,
        as: 'rules',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'base_price', 'vendor_id'] }],
      },
    ],
  });

  if (!pricelist) {
    throw new AppError('Pricelist not found', 404);
  }
  if (vendorId && pricelist.vendor_id && pricelist.vendor_id !== vendorId) {
    throw new AppError('Access denied to this pricelist', 403);
  }

  const json = pricelist.toJSON();
  if (vendorId && json.rules) {
    json.rules = json.rules.filter(
      (rule) => !rule.product || !rule.product.vendor_id || rule.product.vendor_id === vendorId
    );
  }
  return json;
};

const createPricelist = async (data, vendorId = null) => {
  const { name, currency, is_selectable, status } = data;
  if (!name) {
    throw new AppError('Pricelist name is required', 400);
  }

  const existingWhere = vendorId
    ? { name, [Op.or]: [{ vendor_id: vendorId }, { vendor_id: null }] }
    : { name };

  const existing = await Pricelist.findOne({ where: existingWhere });
  if (existing) {
    throw new AppError('Pricelist with this name already exists', 400);
  }

  const pricelist = await Pricelist.create({
    name,
    vendor_id: vendorId || null,
    currency: currency || 'INR',
    is_selectable: is_selectable !== undefined ? is_selectable : true,
    status: status || 'ACTIVE',
  });

  return await getPricelistById(pricelist.id, vendorId);
};

const updatePricelist = async (id, data, vendorId = null) => {
  const pricelist = await Pricelist.findByPk(id);
  if (!pricelist) {
    throw new AppError('Pricelist not found', 404);
  }

  if (vendorId && pricelist.vendor_id && pricelist.vendor_id !== vendorId) {
    throw new AppError('Access denied to update this pricelist', 403);
  }

  const { name, currency, is_selectable, status } = data;
  if (name && name !== pricelist.name) {
    const existingWhere = vendorId
      ? { name, [Op.or]: [{ vendor_id: vendorId }, { vendor_id: null }] }
      : { name };

    const existing = await Pricelist.findOne({ where: existingWhere });
    if (existing && existing.id !== id) {
      throw new AppError('Pricelist with this name already exists', 400);
    }
    pricelist.name = name;
  }

  if (currency) pricelist.currency = currency;
  if (is_selectable !== undefined) pricelist.is_selectable = is_selectable;
  if (status) pricelist.status = status;

  await pricelist.save();
  return await getPricelistById(id, vendorId);
};

const deletePricelist = async (id, vendorId = null) => {
  const pricelist = await Pricelist.findByPk(id);
  if (!pricelist) {
    throw new AppError('Pricelist not found', 404);
  }
  if (vendorId && pricelist.vendor_id && pricelist.vendor_id !== vendorId) {
    throw new AppError('Access denied to delete this pricelist', 403);
  }

  await pricelist.destroy();
  return { id };
};

const addRuleToPricelist = async (pricelistId, ruleData, vendorId = null) => {
  const pricelist = await getPricelistById(pricelistId, vendorId);

  const { product_id, min_quantity, rule_type, discount_percentage, fixed_price, start_date, end_date } = ruleData;

  if (product_id && vendorId) {
    const product = await Product.findByPk(product_id);
    if (!product || (product.vendor_id && product.vendor_id !== vendorId)) {
      throw new AppError('Cannot add rule for a product owned by another vendor', 403);
    }
  }

  await PricelistRule.create({
    pricelist_id: pricelistId,
    product_id: product_id || null,
    min_quantity: min_quantity || 1,
    rule_type: rule_type || 'PERCENT',
    discount_percentage: discount_percentage || 0,
    fixed_price: fixed_price || 0,
    start_date: start_date || null,
    end_date: end_date || null,
  });

  return await getPricelistById(pricelistId, vendorId);
};

const deleteRuleFromPricelist = async (pricelistId, ruleId, vendorId = null) => {
  await getPricelistById(pricelistId, vendorId);

  const rule = await PricelistRule.findOne({
    where: { id: ruleId, pricelist_id: pricelistId },
  });

  if (!rule) {
    throw new AppError('Pricelist rule not found', 404);
  }

  await rule.destroy();
  return await getPricelistById(pricelistId, vendorId);
};

/**
 * Dynamic Price Calculation Engine
 * Applies matching pricelist rules strictly scoped to the product's vendor
 */
const calculateDynamicPrice = async (productId, quantity = 1, basePrice = 0, date = new Date(), pricelistId = null) => {
  // 1. Fetch Product details to get vendor_id
  const product = await Product.findByPk(productId);
  const productVendorId = product ? product.vendor_id : null;

  let activePricelistId = pricelistId;

  // 2. Validate requested pricelistId or find default pricelist for product's vendor
  if (activePricelistId) {
    const specifiedPricelist = await Pricelist.findByPk(activePricelistId);
    if (!specifiedPricelist || (specifiedPricelist.vendor_id && specifiedPricelist.vendor_id !== productVendorId)) {
      // Specified pricelist belongs to another vendor; ignore it
      activePricelistId = null;
    }
  }

  if (!activePricelistId) {
    const whereCondition = { status: 'ACTIVE' };
    if (productVendorId) {
      whereCondition[Op.or] = [{ vendor_id: productVendorId }, { vendor_id: null }];
    } else {
      whereCondition.vendor_id = null;
    }

    const defaultPricelist = await Pricelist.findOne({
      where: whereCondition,
      order: [['vendor_id', 'DESC NULLS LAST']], // Prioritize vendor-specific pricelist over global admin default
    });

    if (defaultPricelist) {
      activePricelistId = defaultPricelist.id;
    }
  }

  if (!activePricelistId) {
    return { finalPrice: Number(basePrice), discountApplied: 0 };
  }

  const dateStr = new Date(date).toISOString().slice(0, 10);
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
  const productFilter = isValidUuid ? [{ product_id: productId }, { product_id: null }] : [{ product_id: null }];

  const rules = await PricelistRule.findAll({
    where: {
      pricelist_id: activePricelistId,
      min_quantity: { [Op.lte]: quantity },
      [Op.and]: [
        {
          [Op.or]: productFilter,
        },
        {
          [Op.or]: [{ start_date: null }, { start_date: { [Op.lte]: dateStr } }],
        },
        {
          [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: dateStr } }],
        },
      ],
    },
    order: [
      ['product_id', 'DESC NULLS LAST'],
      ['min_quantity', 'DESC'],
    ],
  });

  if (rules.length === 0) {
    return { finalPrice: Number(basePrice), discountApplied: 0 };
  }

  const matchedRule = rules[0];
  let finalPrice = Number(basePrice);
  let discountApplied = 0;

  if (matchedRule.rule_type === 'FIXED' && matchedRule.fixed_price > 0) {
    finalPrice = Number(matchedRule.fixed_price);
    discountApplied = Math.max(0, Number(basePrice) - finalPrice);
  } else if (matchedRule.rule_type === 'PERCENT' && matchedRule.discount_percentage > 0) {
    discountApplied = (Number(basePrice) * Number(matchedRule.discount_percentage)) / 100;
    finalPrice = Math.max(0, Number(basePrice) - discountApplied);
  }

  return {
    finalPrice,
    discountApplied,
    appliedRule: matchedRule.toJSON(),
  };
};

module.exports = {
  getAllPricelists,
  getPricelistById,
  createPricelist,
  updatePricelist,
  deletePricelist,
  addRuleToPricelist,
  deleteRuleFromPricelist,
  calculateDynamicPrice,
};
