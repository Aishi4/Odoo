const pricelistService = require('../services/pricelist.service');
const { successResponse } = require('../utils/response');

const getAllPricelists = async (req, res, next) => {
  try {
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    const pricelists = await pricelistService.getAllPricelists(vendorId);
    return successResponse(res, 200, 'Pricelists retrieved successfully', pricelists);
  } catch (error) {
    next(error);
  }
};

const getPricelistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    const pricelist = await pricelistService.getPricelistById(id, vendorId);
    return successResponse(res, 200, 'Pricelist details retrieved', pricelist);
  } catch (error) {
    next(error);
  }
};

const createPricelist = async (req, res, next) => {
  try {
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    const pricelist = await pricelistService.createPricelist(req.body, vendorId);
    return successResponse(res, 201, 'Pricelist created successfully', pricelist);
  } catch (error) {
    next(error);
  }
};

const updatePricelist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    const pricelist = await pricelistService.updatePricelist(id, req.body, vendorId);
    return successResponse(res, 200, 'Pricelist updated successfully', pricelist);
  } catch (error) {
    next(error);
  }
};

const deletePricelist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    await pricelistService.deletePricelist(id, vendorId);
    return successResponse(res, 200, 'Pricelist deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

const addRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    const updatedPricelist = await pricelistService.addRuleToPricelist(id, req.body, vendorId);
    return successResponse(res, 201, 'Rule added to pricelist successfully', updatedPricelist);
  } catch (error) {
    next(error);
  }
};

const deleteRule = async (req, res, next) => {
  try {
    const { id, ruleId } = req.params;
    const vendorId = req.user?.role === 'VENDOR' ? req.user.id : null;
    const updatedPricelist = await pricelistService.deleteRuleFromPricelist(id, ruleId, vendorId);
    return successResponse(res, 200, 'Rule deleted from pricelist successfully', updatedPricelist);
  } catch (error) {
    next(error);
  }
};

const calculatePrice = async (req, res, next) => {
  try {
    const { productId, quantity, basePrice, pricelistId } = req.body;
    const result = await pricelistService.calculateDynamicPrice(productId, quantity, basePrice, new Date(), pricelistId);
    return successResponse(res, 200, 'Dynamic price calculated successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPricelists,
  getPricelistById,
  createPricelist,
  updatePricelist,
  deletePricelist,
  addRule,
  deleteRule,
  calculatePrice,
};
