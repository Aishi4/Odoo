/**
 * Server-Side Pricing Engine
 * Calculates rental price based on product base_price, start_date, end_date, and rental_period.
 */
const calculateRentalPrice = ({ basePrice, startDate, endDate, rentalPeriod, quantity = 1 }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const timeDiff = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

  let periodDays = 1;
  const duration = Number(rentalPeriod.duration) || 1;
  const unit = (rentalPeriod.unit || 'DAY').toUpperCase();

  if (unit === 'DAY') {
    periodDays = duration * 1;
  } else if (unit === 'WEEK') {
    periodDays = duration * 7;
  } else if (unit === 'MONTH') {
    periodDays = duration * 30;
  }

  const multiplier = Math.max(1, Math.ceil(diffDays / periodDays));
  const numericBasePrice = Number(basePrice);

  const unitPrice = Number((numericBasePrice * multiplier).toFixed(2));
  const totalPrice = Number((unitPrice * Number(quantity)).toFixed(2));

  return {
    diffDays,
    multiplier,
    unitPrice,
    totalPrice,
  };
};

module.exports = {
  calculateRentalPrice,
};
