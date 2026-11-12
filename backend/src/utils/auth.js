'use strict';

const users = require('../repositories/userRepository');

const TOKEN_PREFIX = 'demo-token-';

const issueToken = (userId) => `${TOKEN_PREFIX}${userId}`;

/**
 * Resolves the caller from the Authorization header. The token format is
 * unchanged (`demo-token-<userId>`) so the existing frontends keep working;
 * swapping in signed JWTs later only needs to change this module.
 */
const getAuthUser = async (req) => {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : header;

  if (!token.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  const userId = token.slice(TOKEN_PREFIX.length);
  if (!userId) {
    return null;
  }

  return users.findById(userId);
};

module.exports = { issueToken, getAuthUser };
