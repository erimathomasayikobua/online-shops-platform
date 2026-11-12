'use strict';

const { query, queryOne, withTransaction } = require('../config/database');
const { createId } = require('../utils/ids');

const mapCategory = (row, subcategories = []) => ({
  id: row.id,
  name: row.name,
  subcategories,
  status: row.status,
});

const groupSubcategories = (rows) =>
  rows.reduce((result, row) => {
    const list = result.get(row.category_id) || [];
    list.push(row.name);
    result.set(row.category_id, list);
    return result;
  }, new Map());

const listCategories = async () => {
  const [categoryRows, subcategoryRows] = await Promise.all([
    query('SELECT * FROM platform_categories ORDER BY sort_order ASC, name ASC'),
    query('SELECT * FROM platform_subcategories ORDER BY sort_order ASC, name ASC'),
  ]);

  const grouped = groupSubcategories(subcategoryRows);
  return categoryRows.map((row) => mapCategory(row, grouped.get(row.id) || []));
};

const listCategoryNames = async () => {
  const rows = await query('SELECT name FROM platform_categories ORDER BY sort_order ASC, name ASC');
  return rows.map((row) => row.name);
};

const findById = async (id) => {
  const row = await queryOne('SELECT * FROM platform_categories WHERE id = ?', [id]);
  if (!row) {
    return null;
  }

  const subcategoryRows = await query(
    'SELECT name FROM platform_subcategories WHERE category_id = ? ORDER BY sort_order ASC',
    [id]
  );

  return mapCategory(row, subcategoryRows.map((item) => item.name));
};

const replaceSubcategories = async (connection, categoryId, subcategories = []) => {
  await connection.query('DELETE FROM platform_subcategories WHERE category_id = ?', [categoryId]);

  const values = subcategories
    .map((name) => String(name || '').trim())
    .filter(Boolean)
    .map((name, index) => [categoryId, name, index]);

  if (!values.length) {
    return;
  }

  await connection.query(
    'INSERT INTO platform_subcategories (category_id, name, sort_order) VALUES ?',
    [values]
  );
};

const createCategory = async ({ name, subcategories = [], status = 'active' }) => {
  const id = createId('cat');

  await withTransaction(async (connection) => {
    const [orderRows] = await connection.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort FROM platform_categories'
    );

    await connection.query(
      'INSERT INTO platform_categories (id, name, status, sort_order) VALUES (?, ?, ?, ?)',
      [id, name, status, Number(orderRows[0].next_sort)]
    );

    await replaceSubcategories(connection, id, subcategories);
  });

  return findById(id);
};

const updateCategory = async (id, patch = {}) => {
  const existing = await findById(id);
  if (!existing) {
    return null;
  }

  await withTransaction(async (connection) => {
    const assignments = [];
    const values = [];

    if (patch.name !== undefined) {
      assignments.push('name = ?');
      values.push(patch.name);
    }

    if (patch.status !== undefined) {
      assignments.push('status = ?');
      values.push(patch.status);
    }

    if (assignments.length) {
      values.push(id);
      await connection.query(
        `UPDATE platform_categories SET ${assignments.join(', ')} WHERE id = ?`,
        values
      );
    }

    if (Array.isArray(patch.subcategories)) {
      await replaceSubcategories(connection, id, patch.subcategories);
    }
  });

  return findById(id);
};

const deleteCategory = async (id) => {
  const existing = await findById(id);
  if (!existing) {
    return null;
  }

  await query('DELETE FROM platform_categories WHERE id = ?', [id]);
  return existing;
};

module.exports = {
  listCategories,
  listCategoryNames,
  findById,
  createCategory,
  updateCategory,
  deleteCategory,
};
