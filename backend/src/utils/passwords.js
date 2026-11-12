'use strict';

const bcrypt = require('bcryptjs');

const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

const hashPassword = (plainText) => bcrypt.hash(String(plainText), ROUNDS);

const verifyPassword = (plainText, hash) => {
  if (!hash) {
    return Promise.resolve(false);
  }

  return bcrypt.compare(String(plainText), String(hash));
};

module.exports = { hashPassword, verifyPassword, ROUNDS };
