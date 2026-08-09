const templateService = require('../services/quotation_template.service');
const { successResponse } = require('../utils/response');

const getAllTemplates = async (req, res, next) => {
  try {
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    const templates = await templateService.getAllTemplates(vendorId);
    return successResponse(res, 200, 'Quotation templates retrieved successfully', templates);
  } catch (error) {
    next(error);
  }
};

const getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    const template = await templateService.getTemplateById(id, vendorId);
    return successResponse(res, 200, 'Quotation template details retrieved', template);
  } catch (error) {
    next(error);
  }
};

const createTemplate = async (req, res, next) => {
  try {
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    const template = await templateService.createTemplate(req.body, vendorId);
    return successResponse(res, 201, 'Quotation template created successfully', template);
  } catch (error) {
    next(error);
  }
};

const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    const template = await templateService.updateTemplate(id, req.body, vendorId);
    return successResponse(res, 200, 'Quotation template updated successfully', template);
  } catch (error) {
    next(error);
  }
};

const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    await templateService.deleteTemplate(id, vendorId);
    return successResponse(res, 200, 'Quotation template deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
