const logger = require('../utils/logger');
const { ValidationError } = require('sequelize');
const { NODE_ENV } = process.env;

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Handle Sequelize validation errors
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle custom application errors
  else if (err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
    if (err.errors) {
      errors = err.errors;
    }
  }

  // Log the error in development
  if (NODE_ENV === 'development') {
    logger.error({
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  } else if (NODE_ENV === 'production' && !err.isOperational) {
    // Log unexpected errors in production
    logger.error('Unexpected error occurred', {
      message: err.message,
      stack: err.stack,
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
