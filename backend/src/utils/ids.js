'use strict';

/** Builds a collision-resistant string id such as `prod-1731400000000-ab12c`. */
const createId = (prefix) => {
  const random = Math.random().toString(36).slice(2, 7);
  return `${prefix}-${Date.now()}-${random}`;
};

const normalizeChatId = (shopId, customer) =>
  `chat-${shopId}-${String(customer || 'guest')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;

/** Postgres-style slug used for admin resource ids derived from a collection name. */
const collectionIdPrefix = (collection) =>
  String(collection || '')
    .replace(/[^a-z]/gi, '')
    .slice(0, 6)
    .toLowerCase() || 'item';

module.exports = { createId, normalizeChatId, collectionIdPrefix };
