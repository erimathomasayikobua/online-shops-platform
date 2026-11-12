'use strict';

const { query, queryOne, withTransaction } = require('../config/database');
const { toIso } = require('../utils/values');
const { createId } = require('../utils/ids');

const mapReply = (row) => ({
  id: row.id,
  agent: row.agent,
  message: row.body,
  createdAt: toIso(row.created_at),
});

const mapTicket = (row, notes = [], replies = []) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    customer: row.customer,
    subject: row.subject,
    priority: row.priority,
    status: row.status,
    channel: row.channel,
    orderId: row.order_id || null,
    email: row.email || '',
    phone: row.phone || '',
    category: row.category,
    assignedTo: row.assigned_to,
    issue: row.issue || '',
    notes,
    replies,
    lastUpdated: toIso(row.last_updated),
    createdAt: toIso(row.created_at),
  };
};

const hydrate = async (rows) => {
  if (!rows.length) {
    return [];
  }

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => '?').join(',');

  const [noteRows, replyRows] = await Promise.all([
    query(
      `SELECT * FROM ticket_notes WHERE ticket_id IN (${placeholders}) ORDER BY created_at ASC, id ASC`,
      ids
    ),
    query(
      `SELECT * FROM ticket_replies WHERE ticket_id IN (${placeholders}) ORDER BY created_at ASC, id ASC`,
      ids
    ),
  ]);

  const notesByTicket = noteRows.reduce((result, row) => {
    const list = result.get(row.ticket_id) || [];
    list.push(row.note);
    result.set(row.ticket_id, list);
    return result;
  }, new Map());

  const repliesByTicket = replyRows.reduce((result, row) => {
    const list = result.get(row.ticket_id) || [];
    list.push(mapReply(row));
    result.set(row.ticket_id, list);
    return result;
  }, new Map());

  return rows.map((row) =>
    mapTicket(row, notesByTicket.get(row.id) || [], repliesByTicket.get(row.id) || [])
  );
};

const listTickets = async () => {
  const rows = await query('SELECT * FROM tickets ORDER BY created_at DESC, id DESC');
  return hydrate(rows);
};

const findById = async (id) => {
  const row = await queryOne('SELECT * FROM tickets WHERE id = ?', [id]);
  if (!row) {
    return null;
  }

  const [ticket] = await hydrate([row]);
  return ticket;
};

/**
 * Support tickets may reference an order, but the client can also be opened
 * without one — unknown order ids are dropped so the foreign key stays valid.
 */
const resolveOrderId = async (connection, orderId) => {
  if (!orderId) {
    return null;
  }

  const [rows] = await connection.query('SELECT id FROM orders WHERE id = ?', [orderId]);
  return rows.length ? rows[0].id : null;
};

const create = async (ticket) => {
  const id = createId('ticket');

  await withTransaction(async (connection) => {
    const orderId = await resolveOrderId(connection, ticket.orderId);

    await connection.query(
      `INSERT INTO tickets
        (id, customer, subject, priority, status, channel, order_id, email, phone, category,
         assigned_to, issue, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3))`,
      [
        id,
        ticket.customer || 'Guest customer',
        ticket.subject || 'New support request',
        ticket.priority || 'medium',
        ticket.status || 'open',
        ticket.channel || 'form',
        orderId,
        ticket.email || '',
        ticket.phone || '',
        ticket.category || 'General Support',
        ticket.assignedTo || 'Sneha Chowdhury',
        ticket.issue || ticket.subject || 'New support request',
      ]
    );
  });

  return findById(id);
};

const FIELD_MAP = {
  status: 'status',
  priority: 'priority',
  assignedTo: 'assigned_to',
  category: 'category',
  subject: 'subject',
  issue: 'issue',
};

const update = async (id, patch = {}) => {
  const existing = await findById(id);
  if (!existing) {
    return null;
  }

  await withTransaction(async (connection) => {
    const assignments = [];
    const values = [];

    Object.entries(FIELD_MAP).forEach(([field, column]) => {
      if (patch[field] === undefined) {
        return;
      }

      assignments.push(`\`${column}\` = ?`);
      values.push(patch[field]);
    });

    if (assignments.length) {
      values.push(id);
      await connection.query(`UPDATE tickets SET ${assignments.join(', ')} WHERE id = ?`, values);
    }

    if (patch.note) {
      await connection.query('INSERT INTO ticket_notes (ticket_id, note) VALUES (?, ?)', [
        id,
        String(patch.note),
      ]);
    }

    await connection.query('UPDATE tickets SET last_updated = NOW(3) WHERE id = ?', [id]);
  });

  return findById(id);
};

const addReply = async (id, { agent, message, status } = {}) => {
  const existing = await findById(id);
  if (!existing) {
    return null;
  }

  const replyId = createId('reply');

  await withTransaction(async (connection) => {
    await connection.query(
      'INSERT INTO ticket_replies (id, ticket_id, agent, body) VALUES (?, ?, ?, ?)',
      [replyId, id, agent || 'Sneha Chowdhury', String(message || '')]
    );

    await connection.query('UPDATE tickets SET status = ?, last_updated = NOW(3) WHERE id = ?', [
      status || 'in_progress',
      id,
    ]);
  });

  const updated = await findById(id);
  const reply = updated.replies.find((item) => item.id === replyId) || null;

  return { ticket: updated, reply };
};

const countTickets = async () => {
  const row = await queryOne('SELECT COUNT(*) AS total FROM tickets');
  return Number(row.total);
};

const countByStatus = async (status) => {
  const row = await queryOne('SELECT COUNT(*) AS total FROM tickets WHERE status = ?', [status]);
  return Number(row.total);
};

const getStatusBreakdown = async () => {
  const rows = await query('SELECT status, COUNT(*) AS total FROM tickets GROUP BY status');

  return rows.reduce((result, row) => {
    result[row.status] = Number(row.total);
    return result;
  }, {});
};

const countResolved = async () => {
  const row = await queryOne(
    "SELECT COUNT(*) AS total FROM tickets WHERE status IN ('resolved', 'closed')"
  );
  return Number(row.total);
};

module.exports = {
  mapTicket,
  listTickets,
  findById,
  create,
  update,
  addReply,
  countTickets,
  countByStatus,
  countResolved,
  getStatusBreakdown,
};
