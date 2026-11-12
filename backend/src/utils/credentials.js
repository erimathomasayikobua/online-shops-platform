'use strict';

const credentials = require('../repositories/credentialRepository');
const { createId } = require('./ids');

const OTP_TTL_MS = 3 * 60 * 1000;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const generateTemporaryPassword = () =>
  `Erim-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

const otpExpiry = () => new Date(Date.now() + OTP_TTL_MS);

/**
 * Records credential delivery. In this environment OTPs and temporary passwords
 * are persisted in `delivery_logs` instead of being emailed, which keeps the
 * existing demo flow (the API returns the delivery record) intact.
 */
const deliverCredentials = ({ user, channel = 'email', destination, type, secret }) =>
  credentials.createDeliveryLog({
    id: createId('delivery'),
    userId: user.id,
    channel,
    destination: destination || user.email,
    type,
    status: 'sent',
    message:
      type === 'temporary_password'
        ? `Temporary ERIM password sent. User must change it on first login: ${secret}`
        : `ERIM verification OTP sent: ${secret}`,
  });

module.exports = {
  OTP_TTL_MS,
  generateOtp,
  generateTemporaryPassword,
  otpExpiry,
  deliverCredentials,
};
