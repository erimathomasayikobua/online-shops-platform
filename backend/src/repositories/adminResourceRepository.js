'use strict';

const { query, queryOne } = require('../config/database');
const { toIso, parseJson, toJsonParam } = require('../utils/values');
const { createId, collectionIdPrefix } = require('../utils/ids');

/**
 * Admin configuration collections (coupons, banners, taxes, roles, settings …)
 * all share one generic CRUD API, so they are stored as JSON documents keyed by
 * collection name. Newest items first, matching the previous `unshift` behaviour.
 */
const mapResource = (row) => {
  if (!row) {
    return null;
  }

  const payload = parseJson(row.payload, {});
  return {
    ...payload,
    id: row.item_id,
    status: row.status || payload.status,
    createdAt: toIso(row.created_at),
  };
};

const listResources = async (collection) => {
  const rows = await query(
    'SELECT * FROM admin_resources WHERE collection = ? ORDER BY seq DESC',
    [collection]
  );

  return rows.map(mapResource);
};

/** Loads several collections in one query, grouped by collection name. */
const listResourceGroups = async (collections = []) => {
  const grouped = collections.reduce((result, collection) => {
    result[collection] = [];
    return result;
  }, {});

  if (!collections.length) {
    return grouped;
  }

  const placeholders = collections.map(() => '?').join(',');
  const rows = await query(
    `SELECT * FROM admin_resources WHERE collection IN (${placeholders}) ORDER BY seq DESC`,
    collections
  );

  rows.forEach((row) => {
    if (!grouped[row.collection]) {
      grouped[row.collection] = [];
    }
    grouped[row.collection].push(mapResource(row));
  });

  return grouped;
};

const findResource = async (collection, itemId) => {
  const row = await queryOne(
    'SELECT * FROM admin_resources WHERE collection = ? AND item_id = ?',
    [collection, itemId]
  );

  return row ? mapResource(row) : null;
};

const createResource = async (collection, item = {}) => {
  const itemId = item.id || createId(collectionIdPrefix(collection));
  const payload = { ...item, id: itemId, status: item.status || 'active' };

  await query(
    `INSERT INTO admin_resources (collection, item_id, payload, status)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE payload = VALUES(payload), status = VALUES(status)`,
    [collection, itemId, toJsonParam(payload), payload.status]
  );

  return findResource(collection, itemId);
};

const updateResource = async (collection, itemId, patch = {}) => {
  const existing = await findResource(collection, itemId);
  if (!existing) {
    return null;
  }

  const { createdAt, ...currentPayload } = existing;
  const nextPayload = { ...currentPayload, ...patch, id: itemId };

  await query(
    'UPDATE admin_resources SET payload = ?, status = ? WHERE collection = ? AND item_id = ?',
    [
      toJsonParam(nextPayload),
      patch.status !== undefined ? patch.status : existing.status,
      collection,
      itemId,
    ]
  );

  return findResource(collection, itemId);
};

const deleteResource = async (collection, itemId) => {
  const existing = await findResource(collection, itemId);
  if (!existing) {
    return null;
  }

  await query('DELETE FROM admin_resources WHERE collection = ? AND item_id = ?', [
    collection,
    itemId,
  ]);

  return existing;
};

/** Aggregates a numeric JSON field, e.g. subscription revenue from `$.amount`. */
const sumNumericField = async (collection, field) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(field)) {
    throw new Error(`Unsupported admin resource field "${field}"`);
  }

  const row = await queryOne(
    `SELECT COALESCE(SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(payload, ?)) AS DECIMAL(16,2))), 0) AS total
       FROM admin_resources
      WHERE collection = ?`,
    [`$.${field}`, collection]
  );

  return Number(row.total || 0);
};

const countByStatus = async (collection, status) => {
  const row = await queryOne(
    'SELECT COUNT(*) AS total FROM admin_resources WHERE collection = ? AND status = ?',
    [collection, status]
  );

  return Number(row.total);
};

module.exports = {
  listResources,
  listResourceGroups,
  findResource,
  createResource,
  updateResource,
  deleteResource,
  sumNumericField,
  countByStatus,
};
