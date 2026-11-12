'use strict';

const shopRepository = require('../repositories/shopRepository');

/**
 * Attaches the owning shop object to products/orders. Keeps the API responses
 * identical to the previous in-memory implementation without N+1 queries.
 */
const attachShops = async (records) => {
  if (!records.length) {
    return records;
  }

  const shops = await shopRepository.listShops();
  const shopsById = new Map(shops.map((shop) => [shop.id, shop]));

  return records.map((record) => ({ ...record, shop: shopsById.get(record.shopId) || null }));
};

module.exports = { attachShops };
