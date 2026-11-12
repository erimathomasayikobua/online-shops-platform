'use strict';

const { query, queryOne, withTransaction } = require('../config/database');
const { money, toIso, parseJson, toJsonParam, compact } = require('../utils/values');
const { createId } = require('../utils/ids');
const HttpError = require('../utils/httpError');

const LOW_STOCK_THRESHOLD = 12;

const mapItem = (row) => ({
  productId: row.product_id,
  name: row.name,
  image: row.image,
  quantity: Number(row.quantity),
  price: money(row.price),
});

const mapMessage = (row) => ({
  id: row.id,
  sender: row.sender,
  text: row.body,
  createdAt: toIso(row.created_at),
});

const mapOrder = (row, lineItems = [], messages = []) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    customer: row.customer,
    shopId: row.shop_id,
    total: money(row.total),
    status: row.status,
    items: Number(row.items_count || 0),
    ...compact({
      subtotal: row.subtotal === null ? null : money(row.subtotal),
      deliveryFee: row.delivery_fee === null ? null : money(row.delivery_fee),
      delivery: parseJson(row.delivery, null),
      payment: parseJson(row.payment, null),
      arrangement: parseJson(row.arrangement, null),
    }),
    stockCommitted: Boolean(row.stock_committed),
    lineItems,
    messages,
    createdAt: toIso(row.created_at),
  };
};

const groupBy = (rows, key, mapper) =>
  rows.reduce((result, row) => {
    const list = result.get(row[key]) || [];
    list.push(mapper(row));
    result.set(row[key], list);
    return result;
  }, new Map());

/** Loads line items and messages for a set of orders in two queries (no N+1). */
const hydrate = async (rows) => {
  if (!rows.length) {
    return [];
  }

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => '?').join(',');

  const [itemRows, messageRows] = await Promise.all([
    query(`SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`, ids),
    query(
      `SELECT * FROM order_messages WHERE order_id IN (${placeholders}) ORDER BY created_at ASC, id ASC`,
      ids
    ),
  ]);

  const itemsByOrder = groupBy(itemRows, 'order_id', mapItem);
  const messagesByOrder = groupBy(messageRows, 'order_id', mapMessage);

  return rows.map((row) =>
    mapOrder(row, itemsByOrder.get(row.id) || [], messagesByOrder.get(row.id) || [])
  );
};

const listOrders = async ({ shopId } = {}) => {
  const rows = shopId
    ? await query('SELECT * FROM orders WHERE shop_id = ? ORDER BY created_at DESC, id DESC', [shopId])
    : await query('SELECT * FROM orders ORDER BY created_at DESC, id DESC');

  return hydrate(rows);
};

const findOrderById = async (id) => {
  const row = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
  if (!row) {
    return null;
  }

  const [order] = await hydrate([row]);
  return order;
};

const nextOrderId = async (connection) => {
  const [rows] = await connection.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(id, 5) AS UNSIGNED)), 1000) + 1 AS next_id FROM orders WHERE id LIKE 'ord-%'"
  );

  return `ord-${rows[0].next_id}`;
};

/**
 * Decrements stock for every line item once an order is fulfilled. Guarded by
 * `stock_committed` so repeated status updates never double-count inventory.
 */
const commitStock = async (connection, orderId) => {
  const [orderRows] = await connection.query(
    'SELECT stock_committed FROM orders WHERE id = ? FOR UPDATE',
    [orderId]
  );

  if (!orderRows.length || orderRows[0].stock_committed) {
    return;
  }

  const [itemRows] = await connection.query(
    'SELECT product_id, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL',
    [orderId]
  );

  for (const item of itemRows) {
    const [productRows] = await connection.query('SELECT stock FROM products WHERE id = ? FOR UPDATE', [
      item.product_id,
    ]);

    if (!productRows.length) {
      continue;
    }

    const nextStock = Math.max(0, Number(productRows[0].stock) - Number(item.quantity));

    await connection.query('UPDATE products SET stock = ?, status = ? WHERE id = ?', [
      nextStock,
      nextStock < LOW_STOCK_THRESHOLD ? 'low_stock' : 'active',
      item.product_id,
    ]);
  }

  await connection.query('UPDATE orders SET stock_committed = 1 WHERE id = ?', [orderId]);
};

const createOrder = async (payload = {}) => {
  const requestedLines = payload.lineItems || payload.items || [];

  const orderId = await withTransaction(async (connection) => {
    const lines = [];

    for (const line of requestedLines) {
      const productId = line.productId || line.id;
      const [productRows] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [
        productId,
      ]);
      const product = productRows[0];

      if (!product) {
        continue;
      }

      const quantity = Math.max(1, Number(line.quantity || line.qty || 1));

      lines.push({
        productId: product.id,
        shopId: product.shop_id,
        name: product.name,
        image: product.image,
        quantity,
        price: money(Number(line.price || product.price)),
        available: Number(product.stock),
      });
    }

    const unavailable = lines.find((line) => line.available < line.quantity);
    if (unavailable) {
      throw new HttpError(409, `${unavailable.name} does not have enough stock for this order.`);
    }

    let shopId = payload.shopId || (lines[0] ? lines[0].shopId : null);

    if (!shopId) {
      const [shopRows] = await connection.query(
        'SELECT id FROM shops ORDER BY sort_order DESC, id ASC LIMIT 1'
      );
      shopId = shopRows.length ? shopRows[0].id : null;
    }

    if (!shopId) {
      throw new HttpError(400, 'No shop is available to receive this order.');
    }

    const subtotal = money(
      lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
    );
    const deliveryFee = money(Number(payload.deliveryFee || 0));
    const total = money(Number(payload.total || subtotal + deliveryFee || 0));
    const itemsCount = lines.length
      ? lines.reduce((sum, line) => sum + line.quantity, 0)
      : Number(payload.itemCount || 1);
    const status = payload.status || 'awaiting_arrangement';
    const id = await nextOrderId(connection);

    await connection.query(
      `INSERT INTO orders
        (id, customer, customer_user_id, shop_id, total, subtotal, delivery_fee, status,
         items_count, delivery, payment, arrangement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.customer || 'Guest customer',
        payload.customerUserId || null,
        shopId,
        total,
        subtotal,
        deliveryFee,
        status,
        itemsCount,
        toJsonParam(payload.delivery || null),
        toJsonParam(payload.payment || null),
        toJsonParam(payload.arrangement || null),
      ]
    );

    if (lines.length) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, name, image, quantity, price) VALUES ?',
        [
          lines.map((line) => [
            id,
            line.productId,
            line.name,
            line.image,
            line.quantity,
            line.price,
          ]),
        ]
      );
    }

    if (payload.message) {
      await connection.query(
        'INSERT INTO order_messages (id, order_id, sender, body) VALUES (?, ?, ?, ?)',
        [
          createId('msg'),
          id,
          payload.customer || 'Guest customer',
          String(payload.message),
        ]
      );
    }

    if (status === 'fulfilled') {
      await commitStock(connection, id);
    }

    return id;
  });

  return findOrderById(orderId);
};

const updateStatus = async (id, status) => {
  const existing = await findOrderById(id);
  if (!existing) {
    return null;
  }

  await withTransaction(async (connection) => {
    if (status) {
      await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    }

    if ((status || existing.status) === 'fulfilled') {
      await commitStock(connection, id);
    }
  });

  return findOrderById(id);
};

const addMessage = async (id, { sender, text, status } = {}) => {
  const existing = await findOrderById(id);
  if (!existing) {
    return null;
  }

  const messageId = createId('msg');

  await withTransaction(async (connection) => {
    await connection.query(
      'INSERT INTO order_messages (id, order_id, sender, body) VALUES (?, ?, ?, ?)',
      [messageId, id, sender || 'Merchant', String(text)]
    );

    if (status) {
      await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    }
  });

  const updated = await findOrderById(id);
  const message = updated.messages.find((item) => item.id === messageId);

  return { order: updated, message };
};

const getTotals = async ({ shopId } = {}) => {
  const row = shopId
    ? await queryOne(
        'SELECT COUNT(*) AS order_count, COALESCE(SUM(total), 0) AS revenue FROM orders WHERE shop_id = ?',
        [shopId]
      )
    : await queryOne('SELECT COUNT(*) AS order_count, COALESCE(SUM(total), 0) AS revenue FROM orders');

  return {
    orders: Number(row.order_count),
    revenue: money(row.revenue),
  };
};

const countOrders = async () => {
  const row = await queryOne('SELECT COUNT(*) AS total FROM orders');
  return Number(row.total);
};

module.exports = {
  mapOrder,
  listOrders,
  findOrderById,
  createOrder,
  updateStatus,
  addMessage,
  getTotals,
  countOrders,
};
