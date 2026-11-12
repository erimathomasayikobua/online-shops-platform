'use strict';

/** Rounds currency values to 2 decimals, mirroring the platform's money helper. */
const money = (value) => Number(Number(value || 0).toFixed(2));

/** Converts a mysql2 DATETIME/Date into an ISO string, or null when empty. */
const toIso = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

/** JSON columns come back already parsed from mysql2, but tolerate string input. */
const parseJson = (value, fallback = null) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

/** mysql2 needs an explicit string when writing to JSON columns. */
const toJsonParam = (value) => (value === null || value === undefined ? null : JSON.stringify(value));

/** Accepts an ISO string, Date or null and normalises it for DATETIME(3) columns. */
const toDbDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Omits null/undefined keys so API payloads keep their original shape. */
const compact = (object) =>
  Object.entries(object).reduce((result, [key, value]) => {
    if (value !== null && value !== undefined) {
      result[key] = value;
    }
    return result;
  }, {});

module.exports = { money, toIso, parseJson, toJsonParam, toDbDate, compact };
