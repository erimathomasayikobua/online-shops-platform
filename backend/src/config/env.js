'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Load environment variables from the closest .env files. The backend is usually
 * started from its own folder (`npm run dev` inside backend/), but the repo also
 * ships a root level .env.example, so both locations are supported.
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

const databaseName = process.env.DB_NAME || 'erim_shops';

if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
  throw new Error(
    `Invalid DB_NAME "${databaseName}". Database names may only contain letters, numbers and underscores.`
  );
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  port: toNumber(process.env.PORT, 5000),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: databaseName,
    connectionLimit: toNumber(process.env.DB_POOL_SIZE, 10),
    connectTimeout: toNumber(process.env.DB_CONNECT_TIMEOUT, 10000),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'development-only-insecure-secret',
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
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
};

module.exports = env;
