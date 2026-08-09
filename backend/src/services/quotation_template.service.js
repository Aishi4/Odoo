const { Op } = require('sequelize');
const { QuotationTemplate } = require('../models');
const AppError = require('../utils/errors');

const getAllTemplates = async (vendorId = null) => {
  const where = vendorId
    ? { [Op.or]: [{ vendor_id: vendorId }, { vendor_id: null }] }
    : {};

  const templates = await QuotationTemplate.findAll({
    where,
    order: [['created_at', 'DESC']],
  });
  return templates.map((t) => t.toJSON());
};

const getTemplateById = async (id, vendorId = null) => {
  const template = await QuotationTemplate.findByPk(id);
  if (!template) {
    throw new AppError('Quotation Template not found', 404);
  }
  if (vendorId && template.vendor_id && template.vendor_id !== vendorId) {
    throw new AppError('Access denied to this quotation template', 403);
  }
  return template.toJSON();
};

const createTemplate = async (data, vendorId = null) => {
  const { name, validity_days, note, items } = data;
  if (!name) {
    throw new AppError('Template name is required', 400);
  }

  const existingWhere = vendorId
    ? { name, [Op.or]: [{ vendor_id: vendorId }, { vendor_id: null }] }
    : { name };

  const existing = await QuotationTemplate.findOne({ where: existingWhere });
  if (existing) {
    throw new AppError('Quotation Template with this name already exists', 400);
  }

  const template = await QuotationTemplate.create({
    name,
    vendor_id: vendorId || null,
    validity_days: validity_days || 30,
    note: note || '',
    items: items || [],
  });

  return template.toJSON();
};

const updateTemplate = async (id, data, vendorId = null) => {
  const template = await QuotationTemplate.findByPk(id);
  if (!template) {
    throw new AppError('Quotation Template not found', 404);
  }

  if (vendorId && template.vendor_id && template.vendor_id !== vendorId) {
    throw new AppError('Access denied to update this quotation template', 403);
  }

  const { name, validity_days, note, items } = data;

  if (name && name !== template.name) {
    const existingWhere = vendorId
      ? { name, [Op.or]: [{ vendor_id: vendorId }, { vendor_id: null }] }
      : { name };

    const existing = await QuotationTemplate.findOne({ where: existingWhere });
    if (existing && existing.id !== id) {
      throw new AppError('Quotation Template with this name already exists', 400);
    }
    template.name = name;
  }

  if (validity_days !== undefined) template.validity_days = validity_days;
  if (note !== undefined) template.note = note;
  if (items !== undefined) template.items = items;

  await template.save();
  return template.toJSON();
};

const deleteTemplate = async (id, vendorId = null) => {
  const template = await QuotationTemplate.findByPk(id);
  if (!template) {
    throw new AppError('Quotation Template not found', 404);
  }

  if (vendorId && template.vendor_id && template.vendor_id !== vendorId) {
    throw new AppError('Access denied to delete this quotation template', 403);
  }

  await template.destroy();
  return { id };
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
