'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Load environment variables from the closest .env files. The backend is usually
 * started from its own folder (`npm run dev` inside backend/), but the repo also
 * ships a root level .env.example, so both locations are supported.
 * On Railway no .env files exist — variables are injected by the platform.
 */
const ENV_FILES = [
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '..', '..', '..', '.env'),
];

ENV_FILES.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
  }
});

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const firstValue = (...candidates) =>
  candidates.find(
    (candidate) => candidate !== undefined && candidate !== null && String(candidate).trim() !== ''
  );

/**
 * Hosted providers expose a single connection string. Railway's MySQL plugin
 * injects MYSQL_URL (private network) and MYSQL_PUBLIC_URL (proxy), others use
 * DATABASE_URL — all of them are accepted here.
 */
const parseConnectionUrl = (value) => {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    return {
      host: parsed.hostname || undefined,
      port: parsed.port ? Number(parsed.port) : undefined,
      user: parsed.username ? decodeURIComponent(parsed.username) : undefined,
      password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
      name: parsed.pathname ? parsed.pathname.replace(/^\//, '') || undefined : undefined,
    };
  } catch (error) {
    console.warn(`Ignoring an unparseable database connection URL (${error.message}).`);
    return null;
  }
};

const connectionUrl = parseConnectionUrl(
  firstValue(
    process.env.MYSQL_URL,
    process.env.MYSQL_PRIVATE_URL,
    process.env.DATABASE_URL,
    process.env.DB_URL
  )
);

const databaseName = firstValue(
  process.env.DB_NAME,
  process.env.MYSQLDATABASE,
  process.env.MYSQL_DATABASE,
  connectionUrl?.name,
  'erim_shops'
);

if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
  throw new Error(
    `Invalid database name "${databaseName}". Database names may only contain letters, numbers and underscores.`
  );
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const isRailway = Boolean(
  firstValue(
    process.env.RAILWAY_ENVIRONMENT_ID,
    process.env.RAILWAY_ENVIRONMENT,
    process.env.RAILWAY_PROJECT_ID,
    process.env.RAILWAY_SERVICE_ID
  )
);

const sslEnabled = ['true', '1', 'required'].includes(
  String(process.env.DB_SSL || '').toLowerCase()
);

const jwtSecret = process.env.JWT_SECRET || 'development-only-insecure-secret';

if (isProduction && !process.env.JWT_SECRET) {
  console.warn(
    'JWT_SECRET is not set. Deployed instances must define it — falling back to an insecure development secret.'
  );
}

const env = {
  nodeEnv,
  isProduction,
  isRailway,
  port: toNumber(process.env.PORT, 5000),
  host: process.env.HOST || '0.0.0.0',
  publicDomain: firstValue(process.env.RAILWAY_PUBLIC_DOMAIN, process.env.PUBLIC_DOMAIN),
  db: {
    host: firstValue(
      process.env.DB_HOST,
      process.env.MYSQLHOST,
      process.env.MYSQL_HOST,
      connectionUrl?.host,
      '127.0.0.1'
    ),
    port: toNumber(
      firstValue(
        process.env.DB_PORT,
        process.env.MYSQLPORT,
        process.env.MYSQL_PORT,
        connectionUrl?.port
      ),
      3306
    ),
    user: firstValue(
      process.env.DB_USER,
      process.env.MYSQLUSER,
      process.env.MYSQL_USER,
      connectionUrl?.user,
      'root'
    ),
    password: firstValue(
      process.env.DB_PASSWORD,
      process.env.MYSQLPASSWORD,
      process.env.MYSQL_PASSWORD,
      connectionUrl?.password,
      ''
    ),
    name: databaseName,
    ssl: sslEnabled,
    connectionLimit: toNumber(process.env.DB_POOL_SIZE, 10),
    connectTimeout: toNumber(process.env.DB_CONNECT_TIMEOUT, 10000),
    connectRetries: toNumber(process.env.DB_CONNECT_RETRIES, 5),
    connectRetryDelay: toNumber(process.env.DB_CONNECT_RETRY_DELAY_MS, 3000),
  },
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    developmentOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:5173',
    ],
    productionOrigins: (process.env.FRONTEND_URLS || '')
      .split(',')
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean),
  },
};

module.exports = env;
