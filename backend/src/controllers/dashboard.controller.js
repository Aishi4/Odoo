const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/response');

const getOverview = async (req, res, next) => {
  try {
    const overview = await dashboardService.getOverview();
    return successResponse(res, 200, 'Dashboard overview retrieved successfully', overview);
  } catch (error) {
    next(error);
  }
};

const getActiveRentals = async (req, res, next) => {
  try {
    const activeRentals = await dashboardService.getActiveRentals();
    return successResponse(res, 200, 'Active rentals retrieved successfully', activeRentals);
  } catch (error) {
    next(error);
  }
};

const getDueTodayRentals = async (req, res, next) => {
  try {
    const dueToday = await dashboardService.getDueTodayRentals();
    return successResponse(res, 200, 'Rentals due today retrieved successfully', dueToday);
  } catch (error) {
    next(error);
  }
};

const getUpcomingPickups = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const upcomingPickups = await dashboardService.getUpcomingPickups(days);
    return successResponse(res, 200, 'Upcoming pickups retrieved successfully', upcomingPickups);
  } catch (error) {
    next(error);
  }
};

const getUpcomingReturns = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const upcomingReturns = await dashboardService.getUpcomingReturns(days);
    return successResponse(res, 200, 'Upcoming returns retrieved successfully', upcomingReturns);
  } catch (error) {
    next(error);
  }
};

const getOverdueRentals = async (req, res, next) => {
  try {
    const overdueRentals = await dashboardService.getOverdueRentals();
    return successResponse(res, 200, 'Overdue rentals retrieved successfully', overdueRentals);
  } catch (error) {
    next(error);
  }
};

const getRentalRevenue = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const revenue = await dashboardService.getRentalRevenue({ from, to });
    return successResponse(res, 200, 'Rental revenue retrieved successfully', revenue);
  } catch (error) {
    next(error);
  }
};

const getSecurityDepositsHeld = async (req, res, next) => {
  try {
    const depositsHeld = await dashboardService.getSecurityDepositsHeld();
    return successResponse(res, 200, 'Held security deposits retrieved successfully', depositsHeld);
  } catch (error) {
    next(error);
  }
};

const getLateFeeCollection = async (req, res, next) => {
  try {
    const lateFees = await dashboardService.getLateFeeCollection();
    return successResponse(res, 200, 'Late fee collection retrieved successfully', lateFees);
  } catch (error) {
    next(error);
  }
};

const getPriorities = async (req, res, next) => {
  try {
    const priorities = await dashboardService.getPriorities();
    return successResponse(res, 200, 'Dashboard priorities retrieved successfully', priorities);
  } catch (error) {
    next(error);
  }
};

const getRentalStatusSummary = async (req, res, next) => {
  try {
    const statusSummary = await dashboardService.getRentalStatusSummary();
    return successResponse(res, 200, 'Rental status summary retrieved successfully', statusSummary);
  } catch (error) {
    next(error);
  }
};

const getRevenueSummary = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    const summary = await dashboardService.getRevenueSummary(period);
    return successResponse(res, 200, 'Revenue summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getActiveRentals,
  getDueTodayRentals,
  getUpcomingPickups,
  getUpcomingReturns,
  getOverdueRentals,
  getRentalRevenue,
  getSecurityDepositsHeld,
  getLateFeeCollection,
  getPriorities,
  getRentalStatusSummary,
  getRevenueSummary,
};
