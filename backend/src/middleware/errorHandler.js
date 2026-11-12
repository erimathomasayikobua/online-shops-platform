'use strict';

const env = require('../config/env');

const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'API route not found' });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || (error.code === 'ER_DUP_ENTRY' ? 409 : 500);

  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, error);
  }

  const message =
    statusCode === 500 && env.isProduction ? 'Internal server error' : error.message;

  res.status(statusCode).json({
    message: message || 'Internal server error',
    ...(error.details ? { details: error.details } : {}),
  });
};

module.exports = { notFoundHandler, errorHandler };
