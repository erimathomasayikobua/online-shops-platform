'use strict';

const { query, queryOne } = require('../config/database');
const { toIso, parseJson, toJsonParam, compact } = require('../utils/values');

const mapShop = (row) => {
  if (!row) {
    return null;
  }

  return compact({
    id: row.id,
    name: row.name,
    owner: row.owner_name,
    category: row.category,
    status: row.status,
    plan: row.plan,
    rating: Number(row.rating || 0),
    orders: Number(row.orders_count || 0),
    revenue: Number(row.revenue || 0),
    location: row.location,
    contactPhone: row.contact_phone,
    whatsapp: row.whatsapp,
    email: row.email,
    returnPolicy: parseJson(row.return_policy, null),
    deliveryRegions: parseJson(row.delivery_regions, null),
    deliveryCharges: parseJson(row.delivery_charges, null),
    description: row.description,
    pickupAvailable: row.pickup_available ? true : undefined,
    createdAt: toIso(row.created_at),
  });
};

const listShops = async () => {
  const rows = await query('SELECT * FROM shops ORDER BY sort_order DESC, id ASC');
  return rows.map(mapShop);
};

const listActiveShops = async () => {
  const rows = await query(
    "SELECT * FROM shops WHERE status = 'active' ORDER BY sort_order DESC, id ASC"
  );
  return rows.map(mapShop);
};

const findShopById = async (id) => mapShop(await queryOne('SELECT * FROM shops WHERE id = ?', [id]));

/** Used as the fallback shop for POS sales and merchant endpoints. */
const getDefaultShopId = async () => {
  const row = await queryOne('SELECT id FROM shops ORDER BY sort_order DESC, id ASC LIMIT 1');
  return row ? row.id : null;
};

const updateStatus = async (id, status) => {
  if (status) {
    await query('UPDATE shops SET status = ? WHERE id = ?', [status, id]);
  }

  return findShopById(id);
};

const CONTACT_FIELDS = {
  contactPhone: { column: 'contact_phone' },
  whatsapp: { column: 'whatsapp' },
  email: { column: 'email' },
  deliveryRegions: { column: 'delivery_regions', json: true },
  deliveryCharges: { column: 'delivery_charges', json: true },
  pickupAvailable: { column: 'pickup_available', boolean: true },
};

const updateContact = async (id, patch = {}) => {
  const assignments = [];
  const values = [];

  Object.entries(CONTACT_FIELDS).forEach(([field, config]) => {
    if (patch[field] === undefined) {
      return;
    }

    assignments.push(`\`${config.column}\` = ?`);

    if (config.json) {
      values.push(toJsonParam(patch[field]));
    } else if (config.boolean) {
      values.push(patch[field] ? 1 : 0);
    } else {
      values.push(patch[field]);
    }
  });

  if (assignments.length) {
    values.push(id);
    await query(`UPDATE shops SET ${assignments.join(', ')} WHERE id = ?`, values);
  }

  return findShopById(id);
};

const updatePolicies = async (id, policy = {}) => {
  const shop = await findShopById(id);
  if (!shop) {
    return null;
  }

  const current = shop.returnPolicy || {};
  const nextPolicy = {
    windowDays: Number(policy.windowDays || current.windowDays || 7),
    conditions: policy.conditions || current.conditions || '',
    refundMethod: policy.refundMethod || current.refundMethod || '',
    returnShipping: policy.returnShipping || current.returnShipping || '',
    exclusions: policy.exclusions || current.exclusions || '',
  };

  await query('UPDATE shops SET return_policy = ? WHERE id = ?', [toJsonParam(nextPolicy), id]);
  return findShopById(id);
};

const countShops = async () => {
  const row = await queryOne('SELECT COUNT(*) AS total FROM shops');
  return Number(row.total);
};

const countByStatus = async (status) => {
  const row = await queryOne('SELECT COUNT(*) AS total FROM shops WHERE status = ?', [status]);
  return Number(row.total);
};

module.exports = {
  mapShop,
  listShops,
  listActiveShops,
  findShopById,
  getDefaultShopId,
  updateStatus,
  updateContact,
  updatePolicies,
  countShops,
  countByStatus,
};
