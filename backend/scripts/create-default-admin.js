'use strict';

const env = require('../src/config/env');
const { query, queryOne, closeDatabase } = require('../src/config/database');
const { hashPassword } = require('../src/utils/passwords');
const seed = require('../src/db/seedData');

/**
 * Creates the platform owner account without touching any other data.
 * Safe to run repeatedly: if the account already exists it is left untouched so
 * a password that has already been changed is never reset behind the user's back.
 */
const run = async () => {
  const adminDefinition = seed.users.find((user) => user.id === 'user-default-admin');
  const temporaryPassword = process.env.DEFAULT_ADMIN_PASSWORD || seed.DEFAULT_ADMIN_PASSWORD;

  console.log(`Checking for the default admin in "${env.db.name}" on ${env.db.host}:${env.db.port}`);

  const existing = await queryOne('SELECT id, email, must_change_password FROM users WHERE email = ?', [
    seed.DEFAULT_ADMIN_EMAIL,
  ]);

  if (existing) {
    console.log(`Default admin already exists: ${seed.DEFAULT_ADMIN_EMAIL} (${existing.id})`);
    console.log(
      existing.must_change_password
        ? 'It still requires a password change on first login.'
        : 'It has already been activated with a permanent password.'
    );
    return;
  }

  await query(
    `INSERT INTO users
      (id, name, email, password_hash, role, status, verification_status, admin_role,
       permissions, must_change_password, personal_email_required)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
    [
      adminDefinition.id,
      adminDefinition.name,
      seed.DEFAULT_ADMIN_EMAIL,
      await hashPassword(temporaryPassword),
      'admin',
      'active',
      'verified',
      'Super Admin',
      JSON.stringify(adminDefinition.permissions || ['all']),
    ]
  );

  console.log('Default admin created');
  console.log(`  account ID : ${seed.DEFAULT_ADMIN_EMAIL}`);
  console.log(`  temporary  : ${temporaryPassword}`);
  console.log(`  role       : Super Admin (all permissions)`);
  console.log('  The user is prompted to set a new password on first login.');
};

run()
  .catch((error) => {
    console.error(`Could not create the default admin: ${error.message}`);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('Run "npm run db:migrate" first.');
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Check DB_USER / DB_PASSWORD in backend/.env');
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await closeDatabase();
    } catch (closeError) {
      void closeError;
    }
  });
