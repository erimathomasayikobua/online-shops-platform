'use strict';

const mysql = require('mysql2/promise');
const env = require('./env');

let pool = null;
let isConnected = false;

/**
 * Shared connection options. `decimalNumbers` keeps DECIMAL(16,2) money columns
 * as JS numbers (mysql2 returns strings otherwise), and `timezone: 'Z'` stores
 * every DATETIME in UTC so API timestamps stay ISO-serialisable.
 *
 * Managed providers that require TLS (Railway's public proxy, RDS, PlanetScale)
 * are supported with DB_SSL=true.
 */
const buildConnectionOptions = (overrides = {}) => ({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  charset: 'utf8mb4',
  timezone: 'Z',
  decimalNumbers: true,
  connectTimeout: env.db.connectTimeout,
  ...(env.db.ssl ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false } } : {}),
  ...overrides,
});

const createPool = () => {
  const nextPool = mysql.createPool(
    buildConnectionOptions({
      database: env.db.name,
      waitForConnections: true,
      connectionLimit: env.db.connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    })
  );

  nextPool.on('connection', () => {
    if (!isConnected) {
      isConnected = true;
      console.log(`MySQL pool connected to ${env.db.name}`);
    }
  });

  nextPool.on('error', (error) => {
    console.error('Unexpected MySQL pool error:', error.message);
  });

  return nextPool;
};

const getPool = () => {
  if (!pool) {
    pool = createPool();
  }

  return pool;
};

const query = async (sql, params = []) => {
  const [rows] = await getPool().query(sql, params);
  return rows;
};

const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows.length ? rows[0] : null;
};

const withTransaction = async (work) => {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('Failed to roll back MySQL transaction:', rollbackError.message);
    }
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Ensures the schema exists. Hosted providers normally provision the database
 * themselves and the application user may not hold CREATE privileges, so we first
 * try the database and only create it when MySQL reports it is missing.
 */
const ensureDatabaseExists = async () => {
  try {
    const existing = await mysql.createConnection(
      buildConnectionOptions({ database: env.db.name })
    );
    await existing.end();
    return false;
  } catch (error) {
    if (error.code !== 'ER_BAD_DB_ERROR') {
      throw error;
    }
  }

  const connection = await mysql.createConnection(buildConnectionOptions());

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Created database "${env.db.name}"`);
    return true;
  } finally {
    await connection.end();
  }
};

/** Dedicated connection for migration files (they contain multiple statements). */
const createMigrationConnection = () =>
  mysql.createConnection(
    buildConnectionOptions({
      database: env.db.name,
      multipleStatements: true,
    })
  );

/**
 * Connects at boot with retries — on hosted platforms the API container can start
 * before the database is reachable, and a crash loop is harder to diagnose than
 * a few logged retries.
 */
const connectDatabase = async ({
  retries = env.db.connectRetries,
  delayMs = env.db.connectRetryDelay,
} = {}) => {
  const attempts = Math.max(1, retries);
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const connection = await getPool().getConnection();
      await connection.ping();
      connection.release();
      isConnected = true;

      return {
        database: env.db.name,
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        ssl: env.db.ssl,
      };
    } catch (error) {
      lastError = error;
      console.error(
        `MySQL connection attempt ${attempt}/${attempts} failed (${error.code || error.message})`
      );

      if (pool) {
        try {
          await pool.end();
        } catch (closeError) {
          void closeError;
        }
        pool = null;
      }

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `Could not connect to MySQL at ${env.db.host}:${env.db.port}/${env.db.name} as "${env.db.user}" ` +
      `(${lastError?.code || 'CONNECTION_FAILED'}). ` +
      (env.isRailway
        ? 'Check that the MySQL service is linked to this service so MYSQL_URL / MYSQLHOST are injected.'
        : 'Check backend/.env and run "npm run db:setup".')
  );
};

const getDatabaseStatus = async () => {
  try {
    await query('SELECT 1');
    return 'Operational';
  } catch (error) {
    console.error('MySQL health check failed:', error.message);
    return 'Degraded';
  }
};

const closeDatabase = async () => {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
  isConnected = false;
};

module.exports = {
  getPool,
  query,
  queryOne,
  withTransaction,
  ensureDatabaseExists,
  createMigrationConnection,
  connectDatabase,
  getDatabaseStatus,
  closeDatabase,
  isConnected: () => isConnected,
  connectionTarget: () => ({
    database: env.db.name,
    host: env.db.host,
    port: env.db.port,
  }),
};
