'use strict';

const { query, queryOne, withTransaction } = require('../config/database');
const { toIso } = require('../utils/values');
const { createId, normalizeChatId } = require('../utils/ids');

const mapMessage = (row) => ({
  id: row.id,
  sender: row.sender,
  text: row.body,
  createdAt: toIso(row.created_at),
});

const mapChat = (row, messages = []) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    shopId: row.shop_id,
    customer: row.customer,
    status: row.status,
    lastUpdated: toIso(row.last_updated),
    messages,
  };
};

const hydrate = async (rows) => {
  if (!rows.length) {
    return [];
  }

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => '?').join(',');
  const messageRows = await query(
    `SELECT * FROM chat_messages WHERE chat_id IN (${placeholders}) ORDER BY created_at ASC, id ASC`,
    ids
  );

  const messagesByChat = messageRows.reduce((result, row) => {
    const list = result.get(row.chat_id) || [];
    list.push(mapMessage(row));
    result.set(row.chat_id, list);
    return result;
  }, new Map());

  return rows.map((row) => mapChat(row, messagesByChat.get(row.id) || []));
};

const listByShop = async (shopId) => {
  const rows = await query(
    'SELECT * FROM merchant_chats WHERE shop_id = ? ORDER BY last_updated DESC, id DESC',
    [shopId]
  );

  return hydrate(rows);
};

/** Every conversation across all shops — used by admin chat monitoring. */
const listAll = async () => {
  const rows = await query(
    'SELECT * FROM merchant_chats ORDER BY last_updated DESC, id DESC'
  );

  return hydrate(rows);
};

const findById = async (id) => {
  const row = await queryOne('SELECT * FROM merchant_chats WHERE id = ?', [id]);
  if (!row) {
    return null;
  }

  const [chat] = await hydrate([row]);
  return chat;
};

const addMessage = async ({ shopId, customer, chatId, sender, text, status }) => {
  const resolvedCustomer = customer || 'Guest Customer';
  const resolvedChatId = chatId || normalizeChatId(shopId, resolvedCustomer);
  const messageId = createId('chat-msg');

  await withTransaction(async (connection) => {
    await connection.query(
      `INSERT INTO merchant_chats (id, shop_id, customer, status, last_updated)
       VALUES (?, ?, ?, 'open', NOW(3))
       ON DUPLICATE KEY UPDATE customer = VALUES(customer), last_updated = NOW(3)`,
      [resolvedChatId, shopId, resolvedCustomer]
    );

    await connection.query(
      'INSERT INTO chat_messages (id, chat_id, sender, body) VALUES (?, ?, ?, ?)',
      [messageId, resolvedChatId, sender || resolvedCustomer, String(text)]
    );

    if (status) {
      await connection.query('UPDATE merchant_chats SET status = ? WHERE id = ?', [
        status,
        resolvedChatId,
      ]);
    }
  });

  const chat = await findById(resolvedChatId);
  const message = chat.messages.find((item) => item.id === messageId) || null;

  return { chat, message };
};

module.exports = { mapChat, listByShop, listAll, findById, addMessage };
