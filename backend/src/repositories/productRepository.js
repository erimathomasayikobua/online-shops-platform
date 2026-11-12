'use strict';

const { query, queryOne } = require('../config/database');
const { money, toIso, compact } = require('../utils/values');

const LOW_STOCK_THRESHOLD = 12;

const mapProduct = (row) => {
  if (!row) {
    return null;
  }

  return compact({
    id: row.id,
    shopId: row.shop_id,
    name: row.name,
    category: row.category,
    price: money(row.price),
    stock: Number(row.stock || 0),
    status: row.status,
    image: row.image,
    createdAt: toIso(row.created_at),
  });
};

const listProducts = async ({ shopId, category, q } = {}) => {
  const conditions = [];
  const params = [];

  if (shopId) {
    conditions.push('shop_id = ?');
    params.push(shopId);
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (q) {
    conditions.push('name LIKE ?');
    params.push(`%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await query(
    `SELECT * FROM products ${where} ORDER BY sort_order DESC, created_at DESC, id ASC`,
    params
  );

  return rows.map(mapProduct);
};

const listByShop = async (shopId) => listProducts({ shopId });

const findById = async (id) =>
  mapProduct(await queryOne('SELECT * FROM products WHERE id = ?', [id]));

/**
 * New products are inserted with the highest sort order so they surface first in
 * the merchant catalogue, matching the previous in-memory `unshift` behaviour.
 */
const create = async ({ id, shopId, name, category, price, stock, status, image }) => {
  await query(
    `INSERT INTO products (id, shop_id, name, category, price, stock, status, image, sort_order)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(MAX(sort_order), 0) + 1 FROM products`,
    [
      id,
      shopId,
      name,
      category || 'General',
      money(price),
      Number(stock || 0),
      status || 'active',
      image || null,
    ]
  );

  return findById(id);
};

const FIELD_MAP = {
  name: 'name',
  category: 'category',
  price: 'price',
  stock: 'stock',
  status: 'status',
  image: 'image',
  shopId: 'shop_id',
};

const update = async (id, patch = {}) => {
  const assignments = [];
  const values = [];

  Object.entries(FIELD_MAP).forEach(([field, column]) => {
    if (patch[field] === undefined) {
      return;
    }

    assignments.push(`\`${column}\` = ?`);
    values.push(field === 'price' ? money(patch[field]) : patch[field]);
  });

  if (assignments.length) {
    values.push(id);
    await query(`UPDATE products SET ${assignments.join(', ')} WHERE id = ?`, values);
  }

  return findById(id);
};

const countProducts = async () => {
  const row = await queryOne('SELECT COUNT(*) AS total FROM products');
  return Number(row.total);
};

const countLowStock = async (threshold = LOW_STOCK_THRESHOLD) => {
  const row = await queryOne('SELECT COUNT(*) AS total FROM products WHERE stock < ?', [threshold]);
  return Number(row.total);
};

module.exports = {
  LOW_STOCK_THRESHOLD,
  mapProduct,
  listProducts,
  listByShop,
  findById,
  create,
  update,
  countProducts,
  countLowStock,
};
