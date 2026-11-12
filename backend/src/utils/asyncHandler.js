'use strict';

/**
 * Express 4 does not forward rejected promises to the error middleware, so every
 * async route handler is wrapped with this helper.
 */
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = asyncHandler;
