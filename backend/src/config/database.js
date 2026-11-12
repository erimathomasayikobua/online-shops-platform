'use strict';

const mysql = require('mysql2/promise');
const env = require('./env');

let pool = null;
let isConnected = false;

/**
 * Shared connection options. `decimalNumbers` keeps DECIMAL(16,2) money columns
 * as JS numbers (mysql2 returns strings otherwise), and `timezone: 'Z'` stores
 * every DATETIME in UTC so API timestamps stay ISO-serialisable.
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
  ...overrides,
});

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(
      buildConnectionOptions({
        database: env.db.name,
        waitForConnections: true,
        connectionLimit: env.db.connectionLimit,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      })
    );

    pool.on('connection', () => {
      if (!isConnected) {
        isConnected = true;
        console.log(`MySQL pool connected to ${env.db.name}`);
      }
    });

    pool.on('error', (error) => {
      console.error('Unexpected MySQL pool error:', error.message);
    });
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

/** Creates the database itself — migrations need this before any table exists. */
const ensureDatabaseExists = async () => {
  const connection = await mysql.createConnection(buildConnectionOptions());

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
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

const connectDatabase = async () => {
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
    };
  } catch (error) {
    throw new Error(
      `Could not connect to MySQL at ${env.db.host}:${env.db.port}/${env.db.name} as "${env.db.user}" ` +
        `(${error.code || 'CONNECTION_FAILED'}). Check backend/.env and run "npm run db:setup".`
    );
  }
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
