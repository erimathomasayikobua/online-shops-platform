'use strict';

const fs = require('fs');
const path = require('path');

const env = require('../src/config/env');
const {
  ensureDatabaseExists,
  createMigrationConnection,
  closeDatabase,
} = require('../src/config/database');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'src', 'db', 'migrations');

const MIGRATIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename VARCHAR(255) NOT NULL,
    applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (filename)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const runMigrations = async () => {
  console.log(`Preparing database "${env.db.name}" on ${env.db.host}:${env.db.port}`);

  await ensureDatabaseExists();
  console.log(`Database "${env.db.name}" is available`);

  const connection = await createMigrationConnection();
  let appliedCount = 0;

  try {
    await connection.query(MIGRATIONS_TABLE_SQL);

    const [appliedRows] = await connection.query('SELECT filename FROM schema_migrations');
    const applied = new Set(appliedRows.map((row) => row.filename));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (!files.length) {
      console.log('No migration files found.');
      return;
    }

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  skipped  ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
      appliedCount += 1;
      console.log(`  applied  ${file}`);
    }

    console.log(
      appliedCount
        ? `Applied ${appliedCount} migration(s).`
        : 'Schema is already up to date.'
    );
  } finally {
    await connection.end();
    await closeDatabase();
  }
};

runMigrations().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Check DB_USER / DB_PASSWORD in backend/.env');
  }
  process.exitCode = 1;
});
