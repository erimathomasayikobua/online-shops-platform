'use strict';

const express = require('express');
const users = require('../repositories/userRepository');
const shops = require('../repositories/shopRepository');
const products = require('../repositories/productRepository');
const orders = require('../repositories/orderRepository');
const tickets = require('../repositories/ticketRepository');
const kyc = require('../repositories/kycRepository');
const categories = require('../repositories/categoryRepository');
const chats = require('../repositories/chatRepository');
const adminResources = require('../repositories/adminResourceRepository');
const credentials = require('../repositories/credentialRepository');
const audit = require('../repositories/auditRepository');
const { getDatabaseStatus } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword } = require('../utils/passwords');
const { createId } = require('../utils/ids');
const { generateTemporaryPassword, deliverCredentials } = require('../utils/credentials');

const router = express.Router();

/** Generic JSON-backed admin collections exposed by /api/admin/resources. */
const ADMIN_COLLECTIONS = [
  'returns',
  'brands',
  'coupons',
  'banners',
  'ads',
  'campaigns',
  'subscriptionPlans',
  'subscriptions',
  'payments',
  'payouts',
  'taxes',
  'pages',
  'blog',
  'faqs',
  'announcements',
  'shipping',
  'security',
  'roles',
  'settings',
  'aiAutomation',
  'backups',
];

const DEDICATED_COLLECTIONS = ['categories', 'kyc', 'tickets', 'merchantChats', 'deliveryLogs'];

const isKnownCollection = (collection) =>
  ADMIN_COLLECTIONS.includes(collection) || DEDICATED_COLLECTIONS.includes(collection);

const readCollection = (collection) => {
  switch (collection) {
    case 'categories':
      return categories.listCategories();
    case 'kyc':
      return kyc.listSubmissions();
    case 'tickets':
      return tickets.listTickets();
    case 'merchantChats':
      return chats.listAll();
    case 'deliveryLogs':
      return credentials.listDeliveryLogs();
    default:
      return adminResources.listResources(collection);
  }
};

const resourceLabel = (item) => item.name || item.title || item.code || item.id;

const USER_PATCH_FIELDS = [
  'name',
  'email',
  'role',
  'status',
  'phone',
  'verificationStatus',
  'adminRole',
  'permissions',
];

const pickFields = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
    return result;
  }, {});

router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const [
      shopList,
      activeShops,
      reviewQueue,
      userList,
      productList,
      orderList,
      categoryTree,
      kycSubmissions,
      ticketList,
      chatList,
      deliveryLogs,
      resources,
      auditLogs,
      totals,
      totalUsers,
      totalProducts,
      subscriptionRevenue,
      openTickets,
      pendingPayouts,
    ] = await Promise.all([
      shops.listShops(),
      shops.countByStatus('active'),
      shops.countByStatus('review'),
      users.listUsers(),
      products.listProducts(),
      orders.listOrders(),
      categories.listCategories(),
      kyc.listSubmissions(),
      tickets.listTickets(),
      chats.listAll(),
      credentials.listDeliveryLogs(),
      adminResources.listResourceGroups(ADMIN_COLLECTIONS),
      audit.list(200),
      orders.getTotals(),
      users.countUsers(),
      products.countProducts(),
      adminResources.sumNumericField('subscriptions', 'amount'),
      tickets.countByStatus('open'),
      adminResources.countByStatus('payouts', 'pending'),
    ]);

    res.json({
      metrics: {
        shops: shopList.length,
        activeShops,
        reviewQueue,
        grossMerchandiseValue: totals.revenue,
        totalUsers,
        totalProducts,
        subscriptionRevenue,
        openTickets,
        pendingPayouts,
      },
      shops: shopList,
      orders: orderList,
      users: userList,
      products: productList,
      categories: categoryTree,
      kycSubmissions,
      tickets: ticketList,
      merchantChats: chatList,
      deliveryLogs,
      resources,
      auditLogs,
    });
  })
);

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    res.json(await users.listUsers());
  })
);

router.post(
  '/users',
  asyncHandler(async (req, res) => {
    if (!req.body.name || !req.body.email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const email = String(req.body.email).toLowerCase();

    if (await users.emailExists(email)) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const channel = req.body.deliveryChannel === 'whatsapp' ? 'whatsapp' : 'email';
    const destination = channel === 'whatsapp' ? req.body.whatsapp : email;

    if (channel === 'whatsapp' && !destination) {
      return res.status(400).json({
        message: 'WhatsApp number is required to receive credentials by WhatsApp',
      });
    }

    const temporaryPassword = generateTemporaryPassword();
    const user = await users.createUser({
      id: createId('user'),
      name: req.body.name,
      email,
      passwordHash: await hashPassword(temporaryPassword),
      role: req.body.role || 'customer',
      status: req.body.status || 'active',
      verificationStatus: req.body.verificationStatus || 'temporary_password_sent',
      adminRole: req.body.adminRole || null,
      permissions: req.body.permissions || [],
      phone: req.body.phone || null,
      whatsapp: req.body.whatsapp || null,
      mustChangePassword: true,
      personalEmailRequired: true,
    });

    const delivery = await deliverCredentials({
      user,
      channel,
      destination,
      type: 'temporary_password',
      secret: temporaryPassword,
    });

    await audit.record({
      actor: req.body.actor,
      action: 'Created user account',
      target: user.email,
      ip: req.ip,
    });

    return res.status(201).json({ ...user, temporaryPassword, delivery });
  })
);

router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const existing = await users.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

    const patch = pickFields(req.body, USER_PATCH_FIELDS);

    if (patch.email) {
      patch.email = String(patch.email).toLowerCase();
    }

    const updated = await users.updateUser(existing.id, patch);

    await audit.record({
      actor: req.body.actor,
      action: `Updated user ${req.body.status || req.body.role || 'profile'}`,
      target: updated.email,
      ip: req.ip,
    });

    return res.json(updated);
  })
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const removed = await users.deleteUser(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: 'User not found' });
    }

    await audit.record({
      actor: req.body?.actor,
      action: 'Deleted user account',
      target: removed.email,
      ip: req.ip,
    });

    return res.json(removed);
  })
);

router.get(
  '/system-status',
  asyncHandler(async (req, res) => {
    res.json({
      server: 'Operational',
      database: await getDatabaseStatus(),
      paymentGateway: 'Operational',
      emailService: 'Operational',
    });
  })
);

router.get(
  '/resources/:collection',
  asyncHandler(async (req, res) => {
    const { collection } = req.params;

    if (!isKnownCollection(collection)) {
      return res.status(404).json({ message: 'Admin resource not found' });
    }

    return res.json(await readCollection(collection));
  })
);

router.post(
  '/resources/:collection',
  asyncHandler(async (req, res) => {
    const { collection } = req.params;

    if (collection === 'categories') {
      const created = await categories.createCategory(req.body);
      await audit.record({
        actor: req.body.actor,
        action: `Created ${collection} item`,
        target: resourceLabel(created),
        ip: req.ip,
      });
      return res.status(201).json(created);
    }

    if (DEDICATED_COLLECTIONS.includes(collection)) {
      return res.status(400).json({
        message: `The ${collection} collection is managed through its dedicated endpoint.`,
      });
    }

    const created = await adminResources.createResource(collection, req.body);

    await audit.record({
      actor: req.body.actor,
      action: `Created ${collection} item`,
      target: resourceLabel(created),
      ip: req.ip,
    });

    return res.status(201).json(created);
  })
);

router.patch(
  '/resources/:collection/:id',
  asyncHandler(async (req, res) => {
    const { collection, id } = req.params;
    let updated = null;

    if (collection === 'categories') {
      updated = await categories.updateCategory(id, req.body);
    } else if (collection === 'kyc') {
      const submission = await kyc.findById(id);
      updated = submission ? await kyc.updateStatus(id, req.body.status) : null;
    } else if (collection === 'tickets') {
      updated = await tickets.update(id, req.body);
    } else if (DEDICATED_COLLECTIONS.includes(collection)) {
      return res.status(400).json({
        message: `The ${collection} collection is managed through its dedicated endpoint.`,
      });
    } else {
      updated = await adminResources.updateResource(collection, id, req.body);
    }

    if (!updated) {
      return res.status(404).json({ message: 'Admin item not found' });
    }

    await audit.record({
      actor: req.body.actor,
      action: `Updated ${collection}`,
      target: resourceLabel(updated),
      ip: req.ip,
    });

    return res.json(updated);
  })
);

router.delete(
  '/resources/:collection/:id',
  asyncHandler(async (req, res) => {
    const { collection, id } = req.params;
    let removed = null;

    if (collection === 'categories') {
      removed = await categories.deleteCategory(id);
    } else if (DEDICATED_COLLECTIONS.includes(collection)) {
      return res.status(400).json({
        message: `The ${collection} collection is managed through its dedicated endpoint.`,
      });
    } else {
      removed = await adminResources.deleteResource(collection, id);
    }

    if (!removed) {
      return res.status(404).json({ message: 'Admin item not found' });
    }

    await audit.record({
      actor: req.body?.actor,
      action: `Deleted ${collection}`,
      target: resourceLabel(removed),
      ip: req.ip,
    });

    return res.json(removed);
  })
);

module.exports = router;
