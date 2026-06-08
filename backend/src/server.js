const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const state = {
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
      revenue: 64250,
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
      revenue: 38400,
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
      revenue: 120900,
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
      price: 88,
      stock: 42,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-cookware',
      shopId: 'shop-aurora',
      name: 'Ceramic Cookware Bundle',
      category: 'Kitchen',
      price: 132,
      stock: 18,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-weekender',
      shopId: 'shop-kitenge',
      name: 'Wax Print Weekender Bag',
      category: 'Bags',
      price: 64,
      stock: 25,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-midi',
      shopId: 'shop-kitenge',
      name: 'Tailored Midi Dress',
      category: 'Apparel',
      price: 79,
      stock: 11,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-earbuds',
      shopId: 'shop-techlane',
      name: 'Noise Shield Earbuds',
      category: 'Audio',
      price: 49,
      stock: 64,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-charger',
      shopId: 'shop-techlane',
      name: 'GaN Travel Charger',
      category: 'Accessories',
      price: 36,
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
      total: 220,
      status: 'fulfilled',
      items: 2,
      createdAt: '2026-06-08T08:10:00.000Z'
    },
    {
      id: 'ord-1009',
      customer: 'Daniel K.',
      shopId: 'shop-kitenge',
      total: 64,
      status: 'paid',
      items: 1,
      createdAt: '2026-06-08T09:35:00.000Z'
    },
    {
      id: 'ord-1010',
      customer: 'Sarah M.',
      shopId: 'shop-techlane',
      total: 85,
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
      lastUpdated: '2026-06-08T10:50:00.000Z'
    },
    {
      id: 'ticket-78',
      customer: 'Leah N.',
      subject: 'Invoice request',
      priority: 'low',
      status: 'waiting',
      channel: 'email',
      orderId: 'ord-1008',
      lastUpdated: '2026-06-08T08:45:00.000Z'
    }
  ]
};

const getShop = (shopId) => state.shops.find((shop) => shop.id === shopId);
const money = (value) => Number(value.toFixed(2));

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
  const order = {
    id: `ord-${1000 + state.orders.length + 1}`,
    customer: req.body.customer || 'Guest customer',
    shopId: req.body.shopId || state.products[0].shopId,
    total: money(Number(req.body.total || 0)),
    status: 'paid',
    items: Number(req.body.items || 1),
    createdAt: new Date().toISOString()
  };

  state.orders.unshift(order);
  res.status(201).json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = state.orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = req.body.status || order.status;
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
  res.json({
    metrics: {
      openTickets: state.tickets.filter((ticket) => ticket.status === 'open').length,
      waitingTickets: state.tickets.filter((ticket) => ticket.status === 'waiting').length,
      ordersToday: state.orders.length,
      averageResponseMinutes: 7
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
    lastUpdated: new Date().toISOString()
  };

  state.tickets.unshift(ticket);
  res.status(201).json(ticket);
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`Commerce API running at http://localhost:${PORT}`);
});

module.exports = app;
