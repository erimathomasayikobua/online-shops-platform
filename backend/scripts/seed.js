'use strict';

const env = require('../src/config/env');
const { withTransaction, closeDatabase } = require('../src/config/database');
const { hashPassword } = require('../src/utils/passwords');
const seed = require('../src/db/seedData');

/**
 * Dev-only reset: truncates every application table, then loads the demo dataset.
 * Run `npm run db:migrate` first so the schema exists.
 */
const TABLES = [
  'chat_messages',
  'order_messages',
  'order_items',
  'ticket_replies',
  'ticket_notes',
  'tickets',
  'merchant_chats',
  'kyc_submissions',
  'account_otps',
  'delivery_logs',
  'products',
  'orders',
  'users',
  'platform_subcategories',
  'platform_categories',
  'shops',
  'admin_resources',
  'audit_logs',
];

const BASE_TIME = Date.now() - 10 * 60 * 1000;
const timestampAt = (index) => new Date(BASE_TIME + index * 1000);

const assertSchema = async (connection) => {
  const [rows] = await connection.query(
    "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
    [env.db.name]
  );

  if (!rows.length) {
    throw new Error('Schema not found. Run "npm run db:migrate" before seeding.');
  }
};

const truncateAll = async (connection) => {
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of TABLES) {
    await connection.query(`TRUNCATE TABLE \`${table}\``);
  }
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
};

const insertCategories = async (connection) => {
  for (const [index, category] of seed.categories.entries()) {
    await connection.query(
      'INSERT INTO platform_categories (id, name, status, sort_order) VALUES (?, ?, ?, ?)',
      [category.id, category.name, 'active', index]
    );

    for (const [subIndex, name] of category.subcategories.entries()) {
      await connection.query(
        'INSERT INTO platform_subcategories (category_id, name, sort_order) VALUES (?, ?, ?)',
        [category.id, name, subIndex]
      );
    }
  }
};

const insertUsers = async (connection) => {
  for (const [index, user] of seed.users.entries()) {
    await connection.query(
      `INSERT INTO users
        (id, name, email, password_hash, role, status, verification_status, admin_role,
         permissions, shop_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.name,
        user.email.toLowerCase(),
        await hashPassword(user.password),
        user.role,
        user.status || 'active',
        user.verificationStatus || 'verified',
        user.adminRole || null,
        JSON.stringify(user.permissions || []),
        user.shopId || null,
        timestampAt(index),
      ]
    );
  }
};

const insertShops = async (connection) => {
  const total = seed.shops.length;

  for (const [index, shop] of seed.shops.entries()) {
    await connection.query(
      `INSERT INTO shops
        (id, name, owner_name, owner_user_id, category, status, plan, rating, orders_count,
         revenue, location, contact_phone, whatsapp, email, description, return_policy,
         sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shop.id,
        shop.name,
        shop.owner,
        shop.ownerUserId || null,
        shop.category,
        shop.status,
        shop.plan,
        shop.rating,
        shop.orders,
        shop.revenue,
        shop.location,
        shop.contactPhone,
        shop.whatsapp,
        shop.email,
        shop.description,
        JSON.stringify(shop.returnPolicy),
        total - index,
        timestampAt(index),
      ]
    );
  }
};

const insertKyc = async (connection) => {
  for (const submission of seed.kycSubmissions) {
    await connection.query(
      `INSERT INTO kyc_submissions
        (id, user_id, account_type, legal_name, country, document_type, document_number,
         business_name, tax_id, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        submission.id,
        submission.userId,
        submission.accountType,
        submission.legalName,
        submission.country,
        submission.documentType,
        submission.documentNumber,
        submission.businessName || '',
        submission.taxId || '',
        submission.status,
        new Date(submission.submittedAt),
      ]
    );
  }
};

const insertProducts = async (connection) => {
  const total = seed.products.length;

  for (const [index, product] of seed.products.entries()) {
    await connection.query(
      `INSERT INTO products
        (id, shop_id, name, category, price, stock, status, image, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.shopId,
        product.name,
        product.category,
        product.price,
        product.stock,
        product.status,
        product.image,
        total - index,
        timestampAt(index),
      ]
    );
  }
};

const insertOrders = async (connection) => {
  for (const order of seed.orders) {
    await connection.query(
      `INSERT INTO orders
        (id, customer, shop_id, total, status, items_count, arrangement, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.customer,
        order.shopId,
        order.total,
        order.status,
        order.items,
        JSON.stringify(order.arrangement || null),
        new Date(order.createdAt),
      ]
    );

    for (const message of order.messages || []) {
      await connection.query(
        'INSERT INTO order_messages (id, order_id, sender, body, created_at) VALUES (?, ?, ?, ?, ?)',
        [message.id, order.id, message.sender, message.text, new Date(message.createdAt)]
      );
    }
  }
};

const insertTickets = async (connection) => {
  for (const ticket of seed.tickets) {
    await connection.query(
      `INSERT INTO tickets
        (id, customer, subject, priority, status, channel, order_id, email, phone, category,
         assigned_to, issue, last_updated, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket.id,
        ticket.customer,
        ticket.subject,
        ticket.priority,
        ticket.status,
        ticket.channel,
        ticket.orderId || null,
        ticket.email || '',
        ticket.phone || '',
        ticket.category,
        ticket.assignedTo,
        ticket.issue,
        new Date(ticket.lastUpdated),
        new Date(ticket.createdAt),
      ]
    );

    for (const note of ticket.notes || []) {
      await connection.query('INSERT INTO ticket_notes (ticket_id, note) VALUES (?, ?)', [
        ticket.id,
        note,
      ]);
    }
  }
};

const insertChats = async (connection) => {
  for (const chat of seed.merchantChats) {
    await connection.query(
      `INSERT INTO merchant_chats (id, shop_id, customer, status, last_updated)
       VALUES (?, ?, ?, ?, ?)`,
      [chat.id, chat.shopId, chat.customer, chat.status, new Date(chat.lastUpdated)]
    );

    for (const message of chat.messages || []) {
      await connection.query(
        'INSERT INTO chat_messages (id, chat_id, sender, body, created_at) VALUES (?, ?, ?, ?, ?)',
        [message.id, chat.id, message.sender, message.text, new Date(message.createdAt)]
      );
    }
  }
};

const insertAdminResources = async (connection) => {
  for (const [collection, items] of Object.entries(seed.adminResources)) {
    // Reverse insertion so the API's "newest first" ordering preserves seed order.
    for (const item of [...items].reverse()) {
      await connection.query(
        'INSERT INTO admin_resources (collection, item_id, payload, status) VALUES (?, ?, ?, ?)',
        [collection, item.id, JSON.stringify(item), item.status || null]
      );
    }
  }
};

const insertAuditLogs = async (connection) => {
  for (const log of seed.auditLogs) {
    await connection.query(
      'INSERT INTO audit_logs (id, actor, action, target, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [log.id, log.actor, log.action, log.target, log.ip, new Date(log.createdAt)]
    );
  }
};

const runSeed = async () => {
  console.log(`Seeding database "${env.db.name}" on ${env.db.host}:${env.db.port}`);

  await withTransaction(async (connection) => {
    await assertSchema(connection);
    await truncateAll(connection);
    await insertCategories(connection);
    // Shops must exist before users — users.shop_id references shops(id).
    await insertShops(connection);
    await insertUsers(connection);
    await insertKyc(connection);
    await insertProducts(connection);
    await insertOrders(connection);
    await insertTickets(connection);
    await insertChats(connection);
    await insertAdminResources(connection);
    await insertAuditLogs(connection);
  });

  console.log('Seed complete:');
  console.log(`  ${seed.users.length} users (password: pass123)`);
  console.log(`  ${seed.shops.length} shops, ${seed.products.length} products`);
  console.log(`  ${seed.orders.length} orders, ${seed.tickets.length} tickets`);
  console.log(`  ${Object.keys(seed.adminResources).length} admin resource collections`);

  await closeDatabase();
};

runSeed().catch(async (error) => {
  console.error(`Seeding failed: ${error.message}`);
  if (error.code === 'ER_NO_SUCH_TABLE') {
    console.error('Run "npm run db:migrate" first.');
  }
  try {
    await closeDatabase();
  } catch (closeError) {
    void closeError;
  }
  process.exitCode = 1;
});
