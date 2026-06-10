const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const state = {
  users: [
    {
      id: 'user-demo-customer',
      name: 'Demo Customer',
      email: 'customer@erim.test',
      password: 'pass123',
      role: 'customer'
    },
    {
      id: 'user-demo-seller',
      name: 'Maya Chen',
      email: 'seller@erim.test',
      password: 'pass123',
      role: 'seller',
      shopId: 'shop-aurora'
    },
    {
      id: 'user-demo-admin',
      name: 'Admin User',
      email: 'admin@erim.test',
      password: 'pass123',
      role: 'admin'
    },
    {
      id: 'user-demo-care',
      name: 'Care Agent',
      email: 'care@erim.test',
      password: 'pass123',
      role: 'care'
    }
  ],
  kycSubmissions: [
    {
      id: 'kyc-demo-seller',
      userId: 'user-demo-seller',
      accountType: 'seller',
      legalName: 'Maya Chen',
      country: 'Kenya',
      documentType: 'National ID',
      documentNumber: 'ID-ERIM-2048',
      businessName: 'Aurora Home',
      taxId: 'PIN-AURORA-22',
      status: 'approved',
      submittedAt: '2026-06-08T12:00:00.000Z'
    }
  ],
  shops: [
    {
      id: 'shop-aurora',
      name: 'Aurora Home',
      owner: 'Maya Chen',
      category: 'Home and Living',
      status: 'active',
      plan: 'Growth',
      rating: 4.8,
      orders: 348,
      revenue: 244150000,
      location: 'Nairobi',
      description: 'Modern kitchenware, bedding, and home accents for small urban spaces.'
    },
    {
      id: 'shop-kitenge',
      name: 'Kitenge Studio',
      owner: 'Amina Otieno',
      category: 'Fashion',
      status: 'active',
      plan: 'Starter',
      rating: 4.6,
      orders: 215,
      revenue: 145920000,
      location: 'Kampala',
      description: 'Made-to-order apparel, bags, and accessories from independent designers.'
    },
    {
      id: 'shop-techlane',
      name: 'TechLane Market',
      owner: 'Jonah Reed',
      category: 'Electronics',
      status: 'review',
      plan: 'Scale',
      rating: 4.3,
      orders: 501,
      revenue: 459420000,
      location: 'Dar es Salaam',
      description: 'Phones, accessories, and repair kits from verified regional suppliers.'
    }
  ],
  products: [
    {
      id: 'prod-linen-set',
      shopId: 'shop-aurora',
      name: 'Washed Linen Sheet Set',
      category: 'Bedding',
      price: 334400,
      stock: 42,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-cookware',
      shopId: 'shop-aurora',
      name: 'Ceramic Cookware Bundle',
      category: 'Kitchen',
      price: 501600,
      stock: 18,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-weekender',
      shopId: 'shop-kitenge',
      name: 'Wax Print Weekender Bag',
      category: 'Bags',
      price: 243200,
      stock: 25,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-midi',
      shopId: 'shop-kitenge',
      name: 'Tailored Midi Dress',
      category: 'Apparel',
      price: 300200,
      stock: 11,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-earbuds',
      shopId: 'shop-techlane',
      name: 'Noise Shield Earbuds',
      category: 'Audio',
      price: 186200,
      stock: 64,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-charger',
      shopId: 'shop-techlane',
      name: 'GaN Travel Charger',
      category: 'Accessories',
      price: 136800,
      stock: 7,
      status: 'low_stock',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80'
    }
  ],
  orders: [
    {
      id: 'ord-1008',
      customer: 'Leah N.',
      shopId: 'shop-aurora',
      total: 836000,
      status: 'fulfilled',
      items: 2,
      createdAt: '2026-06-08T08:10:00.000Z'
    },
    {
      id: 'ord-1009',
      customer: 'Daniel K.',
      shopId: 'shop-kitenge',
      total: 243200,
      status: 'paid',
      items: 1,
      createdAt: '2026-06-08T09:35:00.000Z'
    },
    {
      id: 'ord-1010',
      customer: 'Sarah M.',
      shopId: 'shop-techlane',
      total: 323000,
      status: 'packing',
      items: 2,
      createdAt: '2026-06-08T10:20:00.000Z'
    }
  ],
  tickets: [
    {
      id: 'ticket-77',
      customer: 'Daniel K.',
      subject: 'Change delivery address',
      priority: 'medium',
      status: 'open',
      channel: 'chat',
      orderId: 'ord-1009',
      email: 'daniel.k@example.com',
      phone: '+256 701 222 333',
      category: 'Shipping & Delivery',
      assignedTo: 'Sneha Chowdhury',
      issue: 'Customer wants to change the delivery address before dispatch.',
      notes: ['Customer confirmed the new address is in Kampala Central.'],
      replies: [],
      lastUpdated: '2026-06-08T10:50:00.000Z',
      createdAt: '2026-06-08T10:30:00.000Z'
    },
    {
      id: 'ticket-78',
      customer: 'Leah N.',
      subject: 'Invoice request',
      priority: 'low',
      status: 'waiting',
      channel: 'email',
      orderId: 'ord-1008',
      email: 'leah.n@example.com',
      phone: '+256 702 444 555',
      category: 'Payments & Invoices',
      assignedTo: 'Rohit Das',
      issue: 'Customer needs an invoice copy for a completed order.',
      notes: [],
      replies: [],
      lastUpdated: '2026-06-08T08:45:00.000Z',
      createdAt: '2026-06-08T08:20:00.000Z'
    }
  ]
};

const getShop = (shopId) => state.shops.find((shop) => shop.id === shopId);
const money = (value) => Number(value.toFixed(2));
const sanitizeUser = ({ password, ...user }) => user;
const getProduct = (productId) => state.products.find((product) => product.id === productId);
const normalizeOrderLines = (lines = []) => lines
  .map((line) => {
    const product = getProduct(line.productId || line.id);
    if (!product) return null;

    const quantity = Math.max(1, Number(line.quantity || line.qty || 1));

    return {
      productId: product.id,
      name: product.name,
      image: product.image,
      quantity,
      price: money(Number(line.price || product.price))
    };
  })
  .filter(Boolean);
const applyFulfillmentStock = (order) => {
  if (order.stockCommitted || !Array.isArray(order.lineItems)) return;

  order.lineItems.forEach((line) => {
    const product = getProduct(line.productId);
    if (product) {
      product.stock = Math.max(0, Number(product.stock || 0) - Number(line.quantity || 0));
      product.status = product.stock < 12 ? 'low_stock' : 'active';
    }
  });

  order.stockCommitted = true;
};
const getAuthUser = (req) => {
  const token = String(req.headers.authorization || '').replace('Bearer ', '');
  const userId = token.replace('demo-token-', '');
  return state.users.find((item) => item.id === userId);
};

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URLS?.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:5173'],
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'online-shops-platform',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  const user = state.users.find((item) => item.email.toLowerCase() === email && item.password === req.body.password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    user: sanitizeUser(user),
    token: `demo-token-${user.id}`
  });
});

app.post('/api/auth/register', (req, res) => {
  const email = String(req.body.email || '').toLowerCase();

  if (!req.body.name || !email || !req.body.password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (state.users.some((user) => user.email.toLowerCase() === email)) {
    return res.status(409).json({ message: 'An Erim account already exists for this email' });
  }

  const user = {
    id: `user-${Date.now()}`,
    name: req.body.name,
    email,
    password: req.body.password,
    role: req.body.role || 'customer'
  };

  state.users.unshift(user);

  res.status(201).json({
    user: sanitizeUser(user),
    token: `demo-token-${user.id}`
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);

  if (!user) {
    return res.status(401).json({ message: 'Not signed in' });
  }

  res.json(sanitizeUser(user));
});

app.get('/api/kyc/status', (req, res) => {
  const user = getAuthUser(req);

  if (!user) {
    return res.status(401).json({ message: 'Sign in before starting KYC' });
  }

  const submission = state.kycSubmissions.find((item) => item.userId === user.id);

  res.json({
    status: submission?.status || 'not_started',
    submission: submission || null
  });
});

app.post('/api/kyc/submit', (req, res) => {
  const user = getAuthUser(req);

  if (!user) {
    return res.status(401).json({ message: 'Sign in before submitting KYC' });
  }

  const required = ['legalName', 'country', 'documentType', 'documentNumber'];
  const missing = required.filter((field) => !req.body[field]);

  if (missing.length) {
    return res.status(400).json({ message: `Missing KYC fields: ${missing.join(', ')}` });
  }

  const existingIndex = state.kycSubmissions.findIndex((item) => item.userId === user.id);
  const submission = {
    id: existingIndex >= 0 ? state.kycSubmissions[existingIndex].id : `kyc-${Date.now()}`,
    userId: user.id,
    accountType: req.body.accountType || user.role,
    legalName: req.body.legalName,
    country: req.body.country,
    documentType: req.body.documentType,
    documentNumber: req.body.documentNumber,
    businessName: req.body.businessName || '',
    taxId: req.body.taxId || '',
    documentFrontName: req.body.documentFrontName || '',
    documentBackName: req.body.documentBackName || '',
    status: 'under_review',
    submittedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    state.kycSubmissions[existingIndex] = submission;
  } else {
    state.kycSubmissions.unshift(submission);
  }

  res.status(201).json({
    status: submission.status,
    submission
  });
});

app.get('/api/catalog', (req, res) => {
  const products = state.products.map((product) => ({
    ...product,
    shop: getShop(product.shopId)
  }));

  res.json({
    shops: state.shops.filter((shop) => shop.status === 'active'),
    products,
    categories: [...new Set(state.products.map((product) => product.category))]
  });
});

app.get('/api/shops', (req, res) => {
  res.json(state.shops);
});

app.get('/api/shops/:id', (req, res) => {
  const shop = getShop(req.params.id);
  if (!shop) {
    return res.status(404).json({ message: 'Shop not found' });
  }

  res.json({
    ...shop,
    products: state.products.filter((product) => product.shopId === shop.id),
    orders: state.orders.filter((order) => order.shopId === shop.id)
  });
});

app.patch('/api/shops/:id/status', (req, res) => {
  const shop = getShop(req.params.id);
  if (!shop) {
    return res.status(404).json({ message: 'Shop not found' });
  }

  shop.status = req.body.status || shop.status;
  res.json(shop);
});

app.get('/api/products', (req, res) => {
  const { shopId, category, q } = req.query;
  const query = (q || '').toLowerCase();
  const products = state.products
    .filter((product) => !shopId || product.shopId === shopId)
    .filter((product) => !category || product.category === category)
    .filter((product) => !query || product.name.toLowerCase().includes(query))
    .map((product) => ({ ...product, shop: getShop(product.shopId) }));

  res.json(products);
});

app.post('/api/products', (req, res) => {
  const product = {
    id: `prod-${Date.now()}`,
    shopId: req.body.shopId || state.shops[0].id,
    name: req.body.name,
    category: req.body.category || 'General',
    price: Number(req.body.price || 0),
    stock: Number(req.body.stock || 0),
    status: 'active',
    image: req.body.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
  };

  state.products.unshift(product);
  res.status(201).json(product);
});

app.patch('/api/products/:id', (req, res) => {
  const product = state.products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  Object.assign(product, req.body);
  res.json(product);
});

app.get('/api/orders', (req, res) => {
  const orders = state.orders.map((order) => ({
    ...order,
    shop: getShop(order.shopId)
  }));

  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const lineItems = normalizeOrderLines(req.body.lineItems || req.body.items || []);
  const firstLineProduct = lineItems[0] ? getProduct(lineItems[0].productId) : null;
  const shopId = req.body.shopId || firstLineProduct?.shopId || state.products[0].shopId;
  const unavailable = lineItems.find((line) => {
    const product = getProduct(line.productId);
    return !product || product.stock < line.quantity;
  });

  if (unavailable) {
    return res.status(409).json({ message: `${unavailable.name} does not have enough stock for this order.` });
  }

  const subtotal = lineItems.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const deliveryFee = Number(req.body.deliveryFee || 0);
  const order = {
    id: `ord-${1000 + state.orders.length + 1}`,
    customer: req.body.customer || 'Guest customer',
    shopId,
    total: money(Number(req.body.total || subtotal + deliveryFee || 0)),
    subtotal: money(subtotal),
    deliveryFee: money(deliveryFee),
    status: req.body.status || 'paid',
    items: lineItems.length ? lineItems.reduce((sum, line) => sum + line.quantity, 0) : Number(req.body.itemCount || 1),
    lineItems,
    stockCommitted: false,
    delivery: req.body.delivery || null,
    payment: req.body.payment || null,
    createdAt: new Date().toISOString()
  };

  if (order.status === 'fulfilled') {
    applyFulfillmentStock(order);
  }

  state.orders.unshift(order);
  res.status(201).json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = state.orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = req.body.status || order.status;

  if (order.status === 'fulfilled') {
    applyFulfillmentStock(order);
  }

  res.json(order);
});

app.get('/api/merchant/overview', (req, res) => {
  const shopId = req.query.shopId || state.shops[0].id;
  const shop = getShop(shopId);
  const products = state.products.filter((product) => product.shopId === shopId);
  const orders = state.orders.filter((order) => order.shopId === shopId);
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  res.json({
    shop,
    metrics: {
      revenue: money(revenue),
      orders: orders.length,
      products: products.length,
      lowStock: products.filter((product) => product.stock < 12).length
    },
    products,
    orders
  });
});

app.get('/api/admin/overview', (req, res) => {
  res.json({
    metrics: {
      shops: state.shops.length,
      activeShops: state.shops.filter((shop) => shop.status === 'active').length,
      reviewQueue: state.shops.filter((shop) => shop.status === 'review').length,
      grossMerchandiseValue: money(state.orders.reduce((sum, order) => sum + order.total, 0))
    },
    shops: state.shops,
    orders: state.orders
  });
});

app.get('/api/customer-care/overview', (req, res) => {
  const resolvedTickets = state.tickets.filter((ticket) => ['resolved', 'closed'].includes(ticket.status)).length;
  res.json({
    metrics: {
      totalTickets: state.tickets.length,
      openTickets: state.tickets.filter((ticket) => ticket.status === 'open').length,
      inProgressTickets: state.tickets.filter((ticket) => ticket.status === 'in_progress').length,
      waitingTickets: state.tickets.filter((ticket) => ticket.status === 'waiting').length,
      resolvedTickets,
      ordersToday: state.orders.length,
      averageResponseMinutes: 135
    },
    tickets: state.tickets,
    orders: state.orders.map((order) => ({ ...order, shop: getShop(order.shopId) }))
  });
});

app.post('/api/customer-care/tickets', (req, res) => {
  const ticket = {
    id: `ticket-${Date.now()}`,
    customer: req.body.customer || 'Guest customer',
    subject: req.body.subject || 'New support request',
    priority: req.body.priority || 'medium',
    status: 'open',
    channel: req.body.channel || 'form',
    orderId: req.body.orderId || null,
    email: req.body.email || '',
    phone: req.body.phone || '',
    category: req.body.category || 'General Support',
    assignedTo: req.body.assignedTo || 'Sneha Chowdhury',
    issue: req.body.issue || req.body.subject || 'New support request',
    notes: [],
    replies: [],
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  state.tickets.unshift(ticket);
  res.status(201).json(ticket);
});

app.patch('/api/customer-care/tickets/:id', (req, res) => {
  const ticket = state.tickets.find((item) => item.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  const allowedFields = ['status', 'priority', 'assignedTo', 'category', 'subject', 'issue'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      ticket[field] = req.body[field];
    }
  });

  if (req.body.note) {
    ticket.notes = [...(ticket.notes || []), req.body.note];
  }

  ticket.lastUpdated = new Date().toISOString();
  res.json(ticket);
});

app.post('/api/customer-care/tickets/:id/replies', (req, res) => {
  const ticket = state.tickets.find((item) => item.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  const reply = {
    id: `reply-${Date.now()}`,
    agent: req.body.agent || 'Sneha Chowdhury',
    message: req.body.message || '',
    createdAt: new Date().toISOString()
  };

  ticket.replies = [...(ticket.replies || []), reply];
  ticket.status = req.body.status || 'in_progress';
  ticket.lastUpdated = reply.createdAt;

  res.status(201).json({ ticket, reply });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`Commerce API running at http://localhost:${PORT}`);
});

module.exports = app;
