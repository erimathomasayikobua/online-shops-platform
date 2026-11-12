'use strict';

const { query } = require('../config/database');
const { toIso } = require('../utils/values');
const { createId } = require('../utils/ids');

const mapLog = (row) => ({
  id: row.id,
  actor: row.actor,
  action: row.action,
  target: row.target,
  ip: row.ip,
  createdAt: toIso(row.created_at),
});

const record = async ({ actor, action, target, ip }) => {
  const log = {
    id: createId('audit'),
    actor: actor || 'Admin User',
    action,
    target: target || null,
    ip: ip || '127.0.0.1',
  };

  await query('INSERT INTO audit_logs (id, actor, action, target, ip) VALUES (?, ?, ?, ?, ?)', [
    log.id,
    log.actor,
    log.action,
    log.target,
    log.ip,
  ]);

  return { ...log, createdAt: new Date().toISOString() };
};

const list = async (limit = 200) => {
  const rows = await query('SELECT * FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT ?', [
    Number(limit),
  ]);

  return rows.map(mapLog);
};

module.exports = { record, list };
