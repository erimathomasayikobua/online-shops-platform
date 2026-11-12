'use strict';

const { query, queryOne } = require('../config/database');
const { toIso, toDbDate } = require('../utils/values');

const mapOtp = (row) => ({
  id: row.id,
  userId: row.user_id,
  otp: row.otp,
  channel: row.channel,
  destination: row.destination,
  consumed: Boolean(row.consumed),
  expiresAt: toIso(row.expires_at),
  createdAt: toIso(row.created_at),
});

const mapDelivery = (row) => ({
  id: row.id,
  userId: row.user_id,
  channel: row.channel,
  destination: row.destination,
  type: row.type,
  status: row.status,
  message: row.message,
  createdAt: toIso(row.created_at),
});

const createOtp = async ({ id, userId, otp, channel, destination, expiresAt }) => {
  await query(
    `INSERT INTO account_otps (id, user_id, otp, channel, destination, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, otp, channel, destination || null, toDbDate(expiresAt)]
  );

  return mapOtp(await queryOne('SELECT * FROM account_otps WHERE id = ?', [id]));
};

const findUnconsumedOtp = async (userId, otp) => {
  const row = await queryOne(
    `SELECT * FROM account_otps
      WHERE user_id = ? AND otp = ? AND consumed = 0
      ORDER BY created_at DESC LIMIT 1`,
    [userId, String(otp)]
  );

  return row ? mapOtp(row) : null;
};

const findLatestUnconsumedOtp = async (userId) => {
  const row = await queryOne(
    `SELECT * FROM account_otps
      WHERE user_id = ? AND consumed = 0
      ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  return row ? mapOtp(row) : null;
};

const consumeOtp = async (id) => {
  await query('UPDATE account_otps SET consumed = 1 WHERE id = ?', [id]);
};

const createDeliveryLog = async ({ id, userId, channel, destination, type, status, message }) => {
  await query(
    `INSERT INTO delivery_logs (id, user_id, channel, destination, type, status, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId || null, channel, destination || null, type, status || 'sent', message]
  );

  return mapDelivery(await queryOne('SELECT * FROM delivery_logs WHERE id = ?', [id]));
};

const listDeliveryLogs = async (limit = 100) => {
  const rows = await query(
    'SELECT * FROM delivery_logs ORDER BY created_at DESC, id DESC LIMIT ?',
    [Number(limit)]
  );

  return rows.map(mapDelivery);
};

module.exports = {
  createOtp,
  findUnconsumedOtp,
  findLatestUnconsumedOtp,
  consumeOtp,
  createDeliveryLog,
  listDeliveryLogs,
};
