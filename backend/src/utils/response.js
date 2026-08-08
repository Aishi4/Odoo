/**
 * Standard Success Response Handler
 */
const successResponse = (res, statusCode, message, data = null) => {
  const responsePayload = {
    success: true,
    message,
  };
  if (data !== null) {
    responsePayload.data = data;
  }
  return res.status(statusCode).json(responsePayload);
};

/**
 * Standard Error Response Handler
 */
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
