'use strict';

const { query, queryOne } = require('../config/database');
const { toIso, parseJson, toJsonParam, compact } = require('../utils/values');

const mapUser = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    verificationStatus: row.verification_status,
    ...compact({
      adminRole: row.admin_role,
      shopId: row.shop_id,
      phone: row.phone,
      whatsapp: row.whatsapp,
      personalEmail: row.personal_email,
    }),
    permissions: parseJson(row.permissions, []),
    mustChangePassword: Boolean(row.must_change_password),
    personalEmailRequired: Boolean(row.personal_email_required),
    createdAt: toIso(row.created_at),
  };
};

/** Adds the password hash for authentication checks — never send this to a client. */
const mapAuthUser = (row) => (row ? { ...mapUser(row), passwordHash: row.password_hash } : null);

const FIELD_MAP = {
  name: 'name',
  email: 'email',
  role: 'role',
  status: 'status',
  phone: 'phone',
  whatsapp: 'whatsapp',
  verificationStatus: 'verification_status',
  adminRole: 'admin_role',
  permissions: 'permissions',
  shopId: 'shop_id',
  personalEmail: 'personal_email',
  mustChangePassword: 'must_change_password',
  personalEmailRequired: 'personal_email_required',
  passwordHash: 'password_hash',
};

const toColumnValue = (field, value) => {
  if (field === 'permissions') {
    return toJsonParam(value);
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  return value;
};

const listUsers = async () => {
  const rows = await query('SELECT * FROM users ORDER BY created_at ASC, id ASC');
  return rows.map(mapUser);
};

const findById = async (id) => mapUser(await queryOne('SELECT * FROM users WHERE id = ?', [id]));

const findByEmail = async (email) =>
  mapUser(await queryOne('SELECT * FROM users WHERE email = ?', [String(email || '').toLowerCase()]));

const findAuthByEmail = async (email) =>
  mapAuthUser(
    await queryOne('SELECT * FROM users WHERE email = ?', [String(email || '').toLowerCase()])
  );

const emailExists = async (email) => {
  const row = await queryOne('SELECT id FROM users WHERE email = ?', [
    String(email || '').toLowerCase(),
  ]);
  return Boolean(row);
};

const createUser = async (user) => {
  await query(
    `INSERT INTO users
      (id, name, email, password_hash, role, status, verification_status, admin_role, permissions,
       phone, whatsapp, shop_id, personal_email, must_change_password, personal_email_required)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.name,
      String(user.email || '').toLowerCase(),
      user.passwordHash,
      user.role || 'customer',
      user.status || 'active',
      user.verificationStatus || 'verified',
      user.adminRole || null,
      toJsonParam(user.permissions || []),
      user.phone || null,
      user.whatsapp || null,
      user.shopId || null,
      user.personalEmail || null,
      user.mustChangePassword ? 1 : 0,
      user.personalEmailRequired ? 1 : 0,
    ]
  );

  return findById(user.id);
};

const updateUser = async (id, patch = {}) => {
  const assignments = [];
  const values = [];

  Object.entries(FIELD_MAP).forEach(([field, column]) => {
    if (patch[field] === undefined) {
      return;
    }

    assignments.push(`\`${column}\` = ?`);
    values.push(toColumnValue(field, patch[field]));
  });

  if (!assignments.length) {
    return findById(id);
  }

  values.push(id);
  await query(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`, values);

  return findById(id);
};

const deleteUser = async (id) => {
  const user = await findById(id);
  if (!user) {
    return null;
  }

  await query('DELETE FROM users WHERE id = ?', [id]);
  return user;
};

const countUsers = async () => {
  const row = await queryOne('SELECT COUNT(*) AS total FROM users');
  return Number(row.total);
};

module.exports = {
  mapUser,
  listUsers,
  findById,
  findByEmail,
  findAuthByEmail,
  emailExists,
  createUser,
  updateUser,
  deleteUser,
  countUsers,
};
