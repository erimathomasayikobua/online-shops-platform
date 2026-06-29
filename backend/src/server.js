const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const platformCategories = [
  {
    id: 'cat-health',
    name: 'Health and Wellness',
    subcategories: ['Pharmacy', 'Optician', 'Gym', 'Clinic', 'Salon / Spa']
  },
  {
    id: 'cat-retail',
    name: 'Retail',
    subcategories: ['Hardware', 'Fashion', 'Electronics', 'Bookshop', 'Baby Shop']
  },
  {
    id: 'cat-home-services',
    name: 'Home and Services',
    subcategories: ['Cleaning', 'Plumbing', 'Furniture', 'Laundry', 'Garden']
  },
  {
    id: 'cat-professional',
    name: 'Professional and Other',
    subcategories: ['Printing', 'Photography', 'Tutoring', 'Vet Clinic', 'Travel']
  },
  {
    id: 'cat-hospitality',
    name: 'Hospitality',
    subcategories: ['Hotel', 'Tours and Travel', 'Motel / Hotel', 'Night Clubs']
  }
];

const state = {
  users: [
    {
      id: 'user-demo-customer',
      name: 'Demo Customer',
      email: 'customer@erim.test',
      password: 'pass123',
      role: 'customer',
      status: 'active',
      verificationStatus: 'verified'
    },
    {
      id: 'user-demo-seller',
      name: 'Maya Chen',
      email: 'seller@erim.test',
      password: 'pass123',
      role: 'seller',
      shopId: 'shop-aurora',
      status: 'active',
      verificationStatus: 'verified'
    },
    {
      id: 'user-demo-admin',
      name: 'Admin User',
      email: 'admin@erim.test',
      password: 'pass123',
      role: 'admin',
      status: 'active',
      adminRole: 'Super Admin',
      permissions: ['all']
    },
    {
      id: 'user-demo-care',
      name: 'Care Agent',
      email: 'care@erim.test',
      password: 'pass123',
      role: 'care',
      status: 'active',
      adminRole: 'Support Agent',
      permissions: ['tickets', 'chat', 'knowledge_base']
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
      contactPhone: '+256 701 222 333',
      whatsapp: '+256 701 222 333',
      email: 'aurora@erim.test',
      returnPolicy: {
        windowDays: 7,
        conditions: 'Items must be unused, in original packaging, and include the ERIM order reference.',
        refundMethod: 'Mobile money refund or store credit after merchant inspection.',
        returnShipping: 'Customer pays return delivery unless the item is wrong, damaged, or not as described.',
        exclusions: 'Opened personal-care items, perishable goods, custom-made products, and clearance items.'
      },
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
      contactPhone: '+256 702 444 555',
      whatsapp: '+256 702 444 555',
      email: 'kitenge@erim.test',
      returnPolicy: {
        windowDays: 5,
        conditions: 'Fashion items must be unworn, unwashed, and returned with tags attached.',
        refundMethod: 'Exchange, store credit, or mobile money refund where approved.',
        returnShipping: 'Customer pays return delivery unless the merchant sent the wrong size or item.',
        exclusions: 'Custom measurements, altered garments, intimate wear, and sale-final items.'
      },
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
      contactPhone: '+255 713 555 777',
      whatsapp: '+255 713 555 777',
      email: 'techlane@erim.test',
      returnPolicy: {
        windowDays: 7,
        conditions: 'Electronics must include packaging, accessories, serial numbers, and pass merchant inspection.',
        refundMethod: 'Replacement, repair, store credit, or refund after inspection.',
        returnShipping: 'Merchant covers returns for verified defects reported within the policy window.',
        exclusions: 'Water damage, misuse, missing accessories, and opened consumable accessories.'
      },
      description: 'Phones, accessories, and repair kits from verified regional suppliers.'
    }
  ],
  products: [
    {
      id: 'prod-linen-set',
      shopId: 'shop-aurora',
      name: 'Washed Linen Sheet Set',
      category: 'Furniture',
      price: 334400,
      stock: 42,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-cookware',
      shopId: 'shop-aurora',
      name: 'Ceramic Cookware Bundle',
      category: 'Hardware',
      price: 501600,
      stock: 18,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-weekender',
      shopId: 'shop-kitenge',
      name: 'Wax Print Weekender Bag',
      category: 'Fashion',
      price: 243200,
      stock: 25,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-midi',
      shopId: 'shop-kitenge',
      name: 'Tailored Midi Dress',
      category: 'Fashion',
      price: 300200,
      stock: 11,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-earbuds',
      shopId: 'shop-techlane',
      name: 'Noise Shield Earbuds',
      category: 'Electronics',
      price: 186200,
      stock: 64,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'prod-charger',
      shopId: 'shop-techlane',
      name: 'GaN Travel Charger',
      category: 'Electronics',
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
      arrangement: {
        method: 'delivery',
        contact: '+256 701 100 200',
        details: 'Please deliver to Nakasero after 4 PM. Payment was agreed by mobile money on delivery.'
      },
      messages: [
        { id: 'msg-ord-1008-1', sender: 'Leah N.', text: 'Can you deliver after 4 PM?', createdAt: '2026-06-08T08:12:00.000Z' },
        { id: 'msg-ord-1008-2', sender: 'Merchant', text: 'Yes, we can deliver after 4 PM and confirm payment on delivery.', createdAt: '2026-06-08T08:16:00.000Z' }
      ],
      createdAt: '2026-06-08T08:10:00.000Z'
    },
    {
      id: 'ord-1009',
      customer: 'Daniel K.',
      shopId: 'shop-kitenge',
      total: 243200,
      status: 'paid',
      items: 1,
      arrangement: {
        method: 'pickup',
        contact: '+256 702 200 300',
        details: 'Customer wants pickup details and payment terms confirmed by chat.'
      },
      messages: [
        { id: 'msg-ord-1009-1', sender: 'Daniel K.', text: 'Can I pick this up tomorrow morning?', createdAt: '2026-06-08T09:38:00.000Z' }
      ],
      createdAt: '2026-06-08T09:35:00.000Z'
    },
    {
      id: 'ord-1010',
      customer: 'Sarah M.',
      shopId: 'shop-techlane',
      total: 323000,
      status: 'packing',
      items: 2,
      arrangement: {
        method: 'delivery',
        contact: '+256 703 300 400',
        details: 'Confirm courier price and payment terms before dispatch.'
      },
      messages: [
        { id: 'msg-ord-1010-1', sender: 'Sarah M.', text: 'Please share delivery fee before sending.', createdAt: '2026-06-08T10:24:00.000Z' }
      ],
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
  ],
  merchantChats: [
    {
      id: 'chat-shop-aurora-demo',
      shopId: 'shop-aurora',
      customer: 'Demo Customer',
      status: 'open',
      lastUpdated: '2026-06-08T11:00:00.000Z',
      messages: [
        { id: 'chat-msg-1', sender: 'Demo Customer', text: 'Hello, do you deliver around Kampala?', createdAt: '2026-06-08T10:58:00.000Z' },
        { id: 'chat-msg-2', sender: 'Aurora Home', text: 'Yes, we can arrange delivery or pickup depending on your order.', createdAt: '2026-06-08T11:00:00.000Z' }
      ]
    }
  ],
  adminResources: {
    returns: [
      { id: 'ret-1001', customer: 'Demo Customer', orderId: 'ord-1008', reason: 'Wrong size delivered', status: 'pending', refundAmount: 334400 },
      { id: 'ret-1002', customer: 'Daniel K.', orderId: 'ord-1009', reason: 'Changed mind before pickup', status: 'approved', refundAmount: 243200 }
    ],
    brands: [
      { id: 'brand-1', name: 'ERIM Basics', partner: 'Platform', status: 'active', requests: 0 },
      { id: 'brand-2', name: 'Kitenge Studio', partner: 'Kitenge Studio', status: 'review', requests: 3 }
    ],
    coupons: [
      { id: 'coupon-1', code: 'WELCOME10', description: 'New customer discount', usage: 76, status: 'active' },
      { id: 'coupon-2', code: 'FASHION20', description: 'Fashion promo', usage: 28, status: 'active' },
      { id: 'coupon-3', code: 'SHIPFREE', description: 'Delivery support', usage: 12, status: 'review' }
    ],
    banners: [
      { id: 'banner-1', title: 'Homepage Hero', placement: 'Home Page', priority: 1, status: 'active' },
      { id: 'banner-2', title: 'Category Page', placement: 'Category Page', priority: 2, status: 'active' },
      { id: 'banner-3', title: 'Mobile App', placement: 'App promotion', priority: 4, status: 'inactive' }
    ],
    ads: [
      { id: 'ad-1', title: 'Featured Stores', owner: 'Aurora Home', budget: 250000, status: 'active' },
      { id: 'ad-2', title: 'Sponsored Products', owner: 'TechLane Market', budget: 120000, status: 'review' }
    ],
    campaigns: [
      { id: 'camp-1', title: 'June Flash Sale', audience: 'All customers', budget: 850000, status: 'active' },
      { id: 'camp-2', title: 'Holiday Promotions', audience: 'Retail merchants', budget: 450000, status: 'draft' }
    ],
    subscriptionPlans: [
      { id: 'plan-monthly', name: 'Monthly', price: 10000, validityDays: 30, trialDays: 30, billingStarts: 'second_month', status: 'active' },
      { id: 'plan-half-year', name: 'Half Year', price: 55000, validityDays: 180, trialDays: 30, billingStarts: 'second_month', status: 'active' },
      { id: 'plan-annual', name: 'Annual', price: 100000, validityDays: 365, trialDays: 30, billingStarts: 'second_month', status: 'active' }
    ],
    subscriptions: [
      { id: 'sub-aurora', shopId: 'shop-aurora', plan: 'Annual', amount: 100000, daysRemaining: 284, status: 'active' },
      { id: 'sub-kitenge', shopId: 'shop-kitenge', plan: 'Monthly', amount: 10000, daysRemaining: 12, status: 'active' },
      { id: 'sub-techlane', shopId: 'shop-techlane', plan: 'Half Year', amount: 55000, daysRemaining: 0, status: 'expired' }
    ],
    payments: [
      { id: 'txn-10044', merchant: 'TechLane Market', method: 'MTN Mobile Money', amount: 235000, status: 'completed' },
      { id: 'txn-10045', merchant: 'Urban Style', method: 'Visa Card', amount: 145000, status: 'completed' },
      { id: 'txn-10046', merchant: 'Fashion Hub', method: 'Airtel Money', amount: 371000, status: 'pending' },
      { id: 'txn-10047', merchant: 'Home & Living', method: 'Bank Transfer', amount: 812000, status: 'completed' }
    ],
    payouts: [
      { id: 'pay-1', merchant: 'Aurora Home', amount: 1840000, method: 'MTN Mobile Money', status: 'pending' },
      { id: 'pay-2', merchant: 'Kitenge Studio', amount: 960000, method: 'Bank Transfer', status: 'approved' }
    ],
    taxes: [
      { id: 'tax-vat', name: 'VAT', rate: 18, region: 'Uganda', status: 'active' },
      { id: 'tax-service', name: 'Digital service levy', rate: 5, region: 'Platform', status: 'review' }
    ],
    pages: [
      { id: 'page-home', title: 'Homepage', owner: 'Content Manager', version: 4, status: 'published' },
      { id: 'page-sell', title: 'Start Selling', owner: 'Marketing Manager', version: 2, status: 'draft' }
    ],
    blog: [
      { id: 'blog-1', title: 'How to Sell Better on ERIM', author: 'Admin User', category: 'Merchant Education', status: 'published' },
      { id: 'blog-2', title: 'Safe Shopping Guide', author: 'Content Manager', category: 'Customer Trust', status: 'draft' }
    ],
    faqs: [
      { id: 'faq-1', question: 'How do I contact a merchant?', category: 'Shopping', status: 'published' },
      { id: 'faq-2', question: 'How are subscriptions paid?', category: 'Merchants', status: 'published' }
    ],
    announcements: [
      { id: 'ann-1', title: 'Platform maintenance', audience: 'All Users', status: 'sent' },
      { id: 'ann-2', title: 'New commission rates', audience: 'Merchants', status: 'scheduled' }
    ],
    shipping: [
      { id: 'ship-1', partner: 'ERIM Delivery', zones: 'Kampala, Wakiso, Mukono', baseRate: 5000, status: 'active' },
      { id: 'ship-2', partner: 'Regional Courier', zones: 'Nationwide', baseRate: 15000, status: 'review' }
    ],
    security: [
      { id: 'sec-2fa', name: 'Admin two-factor authentication', risk: 'low', status: 'enforced' },
      { id: 'sec-fraud', name: 'Fraud detection rules', risk: 'medium', status: 'monitoring' },
      { id: 'sec-ip', name: 'IP block list', risk: 'low', status: 'active' }
    ],
    roles: [
      { id: 'role-super-admin', name: 'Super Admin', description: 'Full access to all system features', users: 1, status: 'active' },
      { id: 'role-admin', name: 'Admin', description: 'Manage platform operations', users: 5, status: 'active' },
      { id: 'role-ops', name: 'Operations Manager', description: 'Orders, logistics, disputes', users: 2, status: 'active' },
      { id: 'role-finance', name: 'Finance Officer', description: 'Payments, payouts, tax', users: 2, status: 'active' },
      { id: 'role-care-manager', name: 'Customer Care Manager', description: 'Tickets and agent oversight', users: 1, status: 'active' },
      { id: 'role-support', name: 'Support Agent', description: 'Handle customer tickets and chat', users: 8, status: 'active' },
      { id: 'role-marketing', name: 'Marketing Manager', description: 'Coupons, banners, ads, campaigns', users: 3, status: 'active' },
      { id: 'role-content', name: 'Content Manager', description: 'Pages, blogs, FAQs', users: 3, status: 'active' }
    ],
    settings: [
      { id: 'set-currency', name: 'Base currency', value: 'UGX', status: 'active' },
      { id: 'set-mtn', name: 'MTN Mobile Money gateway', value: 'Enabled', status: 'active' },
      { id: 'set-airtel', name: 'Airtel Money gateway', value: 'Enabled', status: 'active' },
      { id: 'set-email', name: 'Email service', value: 'Enabled', status: 'active' },
      { id: 'set-whatsapp', name: 'WhatsApp service', value: 'Enabled', status: 'active' }
    ],
    aiAutomation: [
      { id: 'ai-review', name: 'Fake review detection', coverage: 'Reviews', status: 'monitoring' },
      { id: 'ai-fraud', name: 'Fraud transaction detection', coverage: 'Payments', status: 'active' },
      { id: 'auto-renewal', name: 'Subscription renewal alerts', coverage: 'Merchants', status: 'active' },
      { id: 'auto-tax', name: 'Auto tax calculations', coverage: 'Finance', status: 'active' },
      { id: 'auto-payout', name: 'Auto payout scheduling', coverage: 'Payouts', status: 'review' }
    ],
    backups: [
      { id: 'backup-1', name: 'Daily database backup', target: 'Primary storage', status: 'completed' },
      { id: 'backup-2', name: 'Disaster recovery restore point', target: 'Secondary storage', status: 'ready' }
    ]
  },
  auditLogs: [
    { id: 'audit-1', actor: 'Admin User', action: 'Login Successful', target: 'Admin Console', ip: '192.168.1.1', createdAt: '2026-06-13T08:30:00.000Z' },
    { id: 'audit-2', actor: 'System', action: 'Backup completed', target: 'Daily database backup', ip: '192.168.1.1', createdAt: '2026-06-13T02:00:00.000Z' }
  ],
  accountOtps: [],
  deliveryLogs: []
};

const getShop = (shopId) => state.shops.find((shop) => shop.id === shopId);
const money = (value) => Number(value.toFixed(2));
const sanitizeUser = ({ password, ...user }) => user;
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const generateTemporaryPassword = () => `Erim-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
const otpExpiry = () => new Date(Date.now() + 3 * 60 * 1000).toISOString();
const queueCredentialDelivery = ({ user, channel = 'email', destination, type, secret }) => {
  const delivery = {
    id: `delivery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: user.id,
    channel,
    destination: destination || user.email,
    type,
    status: 'sent',
    message: type === 'temporary_password'
      ? `Temporary ERIM password sent. User must change it on first login: ${secret}`
      : `ERIM verification OTP sent: ${secret}`,
    createdAt: new Date().toISOString()
  };
  state.deliveryLogs.unshift(delivery);
  return delivery;
};
const normalizeChatId = (shopId, customer) => `chat-${shopId}-${String(customer || 'guest').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const getProduct = (productId) => state.products.find((product) => product.id === productId);
const recordAudit = (actor, action, target, ip = '127.0.0.1') => {
  const log = {
    id: `audit-${Date.now()}`,
    actor: actor || 'Admin User',
    action,
    target,
    ip,
    createdAt: new Date().toISOString()
  };
  state.auditLogs.unshift(log);
  return log;
};
const getAdminCollection = (collection) => {
  if (collection === 'categories') return platformCategories;
  if (collection === 'kyc') return state.kycSubmissions;
  if (collection === 'tickets') return state.tickets;
  if (collection === 'merchantChats') return state.merchantChats;
  if (collection === 'deliveryLogs') return state.deliveryLogs;
  return state.adminResources[collection];
};
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

  if (user.status === 'pending_verification' || user.verificationStatus === 'otp_sent') {
    return res.status(403).json({
      message: 'Account OTP verification is required before accessing ERIM.',
      user: sanitizeUser(user),
      otpRequired: true
    });
  }

  res.json({
    user: sanitizeUser(user),
    token: `demo-token-${user.id}`,
    requiresPasswordChange: Boolean(user.mustChangePassword),
    personalEmailRequired: Boolean(user.personalEmailRequired)
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
    role: req.body.role || 'customer',
    status: 'pending_verification',
    verificationStatus: 'otp_sent',
    phone: req.body.phone || '',
    whatsapp: req.body.whatsapp || ''
  };

  state.users.unshift(user);
  const otp = generateOtp();
  const channel = req.body.deliveryChannel === 'whatsapp' ? 'whatsapp' : 'email';
  const destination = channel === 'whatsapp' ? user.whatsapp : user.email;
  if (channel === 'whatsapp' && !destination) {
    return res.status(400).json({ message: 'WhatsApp number is required to receive OTP by WhatsApp' });
  }
  state.accountOtps.unshift({
    id: `otp-${Date.now()}`,
    userId: user.id,
    otp,
    channel,
    destination,
    consumed: false,
    expiresAt: otpExpiry(),
    createdAt: new Date().toISOString()
  });
  const delivery = queueCredentialDelivery({ user, channel, destination, type: 'otp', secret: otp });
  recordAudit('System', 'Created OTP for account registration', user.email, req.ip);

  res.status(201).json({
    user: sanitizeUser(user),
    otpRequired: true,
    delivery
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  const user = state.users.find((item) => item.email.toLowerCase() === email || item.id === req.body.userId);
  if (!user) {
    return res.status(404).json({ message: 'Account not found' });
  }

  const record = state.accountOtps.find((item) => item.userId === user.id && item.otp === String(req.body.otp || '') && !item.consumed);
  if (!record) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  record.consumed = true;
  user.status = 'active';
  user.verificationStatus = 'verified';
  recordAudit('System', 'Verified account OTP', user.email, req.ip);
  res.json({ user: sanitizeUser(user), token: `demo-token-${user.id}`, message: 'Account verified successfully.' });
});

app.post('/api/auth/resend-otp', (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  const user = state.users.find((item) => item.email.toLowerCase() === email || item.id === req.body.userId);
  if (!user) {
    return res.status(404).json({ message: 'Account not found' });
  }

  if (user.verificationStatus === 'verified') {
    return res.status(409).json({ message: 'Account is already verified' });
  }

  const latest = state.accountOtps.find((item) => item.userId === user.id && !item.consumed);
  if (latest && new Date(latest.expiresAt).getTime() > Date.now()) {
    return res.status(429).json({
      message: 'Current OTP is still active. Request a new OTP after it expires.',
      expiresAt: latest.expiresAt
    });
  }

  const channel = req.body.deliveryChannel === 'whatsapp' ? 'whatsapp' : 'email';
  const destination = channel === 'whatsapp' ? (req.body.whatsapp || user.whatsapp) : user.email;
  if (channel === 'whatsapp' && !destination) {
    return res.status(400).json({ message: 'WhatsApp number is required to receive OTP by WhatsApp' });
  }

  const otp = generateOtp();
  state.accountOtps.unshift({
    id: `otp-${Date.now()}`,
    userId: user.id,
    otp,
    channel,
    destination,
    consumed: false,
    expiresAt: otpExpiry(),
    createdAt: new Date().toISOString()
  });
  user.verificationStatus = 'otp_sent';
  user.status = 'pending_verification';
  const delivery = queueCredentialDelivery({ user, channel, destination, type: 'otp', secret: otp });
  recordAudit('System', 'Regenerated OTP for account registration', user.email, req.ip);

  res.status(201).json({ user: sanitizeUser(user), otpRequired: true, delivery });
});

app.post('/api/auth/change-password', (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  const user = state.users.find((item) => item.id === req.body.userId || item.email.toLowerCase() === email);
  if (!user || user.password !== req.body.currentPassword) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  if (!req.body.newPassword || String(req.body.newPassword).length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  user.password = req.body.newPassword;
  user.mustChangePassword = false;
  user.personalEmailRequired = false;
  user.personalEmail = req.body.personalEmail || user.personalEmail || user.email;
  user.verificationStatus = user.verificationStatus || 'verified';
  user.status = user.status === 'pending_verification' ? 'active' : user.status;
  recordAudit(user.name, 'Changed temporary password', user.email, req.ip);

  res.json({
    user: sanitizeUser(user),
    token: `demo-token-${user.id}`,
    message: 'Password changed successfully.'
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
    categories: platformCategories.map((category) => category.name),
    categoryTree: platformCategories
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

app.patch('/api/shops/:id/contact', (req, res) => {
  const shop = getShop(req.params.id);
  if (!shop) {
    return res.status(404).json({ message: 'Shop not found' });
  }

  ['contactPhone', 'whatsapp', 'email', 'deliveryRegions', 'deliveryCharges', 'pickupAvailable'].forEach((field) => {
    if (req.body[field] !== undefined) {
      shop[field] = req.body[field];
    }
  });

  recordAudit(req.body.actor || shop.owner, 'Updated merchant contact details', shop.name, req.ip);
  res.json(shop);
});

app.patch('/api/shops/:id/policies', (req, res) => {
  const shop = getShop(req.params.id);
  if (!shop) {
    return res.status(404).json({ message: 'Shop not found' });
  }

  const policy = req.body.returnPolicy || req.body;
  shop.returnPolicy = {
    ...(shop.returnPolicy || {}),
    windowDays: Number(policy.windowDays || shop.returnPolicy?.windowDays || 7),
    conditions: policy.conditions || shop.returnPolicy?.conditions || '',
    refundMethod: policy.refundMethod || shop.returnPolicy?.refundMethod || '',
    returnShipping: policy.returnShipping || shop.returnPolicy?.returnShipping || '',
    exclusions: policy.exclusions || shop.returnPolicy?.exclusions || ''
  };

  recordAudit(req.body.actor || shop.owner, 'Updated merchant return policy', shop.name, req.ip);
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
    status: req.body.status || 'awaiting_arrangement',
    items: lineItems.length ? lineItems.reduce((sum, line) => sum + line.quantity, 0) : Number(req.body.itemCount || 1),
    lineItems,
    stockCommitted: false,
    delivery: req.body.delivery || null,
    payment: req.body.payment || null,
    arrangement: req.body.arrangement || null,
    messages: req.body.message ? [{
      id: `msg-${Date.now()}`,
      sender: req.body.customer || 'Guest customer',
      text: req.body.message,
      createdAt: new Date().toISOString()
    }] : [],
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

app.post('/api/orders/:id/messages', (req, res) => {
  const order = state.orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!req.body.text) {
    return res.status(400).json({ message: 'Message text is required' });
  }

  const message = {
    id: `msg-${Date.now()}`,
    sender: req.body.sender || 'Merchant',
    text: req.body.text,
    createdAt: new Date().toISOString()
  };

  order.messages = [...(order.messages || []), message];
  order.status = req.body.status || order.status;

  res.status(201).json({ order, message });
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

app.get('/api/merchant/chats', (req, res) => {
  const shopId = req.query.shopId || state.shops[0].id;
  const chats = state.merchantChats
    .filter((chat) => chat.shopId === shopId)
    .map((chat) => ({ ...chat, shop: getShop(chat.shopId) }))
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  res.json(chats);
});

app.post('/api/merchant/chats/messages', (req, res) => {
  const shopId = req.body.shopId || state.shops[0].id;
  const customer = req.body.customer || 'Guest Customer';
  const text = String(req.body.text || '').trim();

  if (!text) {
    return res.status(400).json({ message: 'Message text is required' });
  }

  const chatId = req.body.chatId || normalizeChatId(shopId, customer);
  let chat = state.merchantChats.find((item) => item.id === chatId);

  if (!chat) {
    chat = {
      id: chatId,
      shopId,
      customer,
      status: 'open',
      lastUpdated: new Date().toISOString(),
      messages: []
    };
    state.merchantChats.unshift(chat);
  }

  const message = {
    id: `chat-msg-${Date.now()}`,
    sender: req.body.sender || customer,
    text,
    createdAt: new Date().toISOString()
  };

  chat.messages.push(message);
  chat.customer = customer;
  chat.lastUpdated = message.createdAt;
  chat.status = req.body.status || chat.status;

  res.status(201).json({ chat, message });
});

app.get('/api/admin/overview', (req, res) => {
  res.json({
    metrics: {
      shops: state.shops.length,
      activeShops: state.shops.filter((shop) => shop.status === 'active').length,
      reviewQueue: state.shops.filter((shop) => shop.status === 'review').length,
      grossMerchandiseValue: money(state.orders.reduce((sum, order) => sum + order.total, 0)),
      totalUsers: state.users.length,
      totalProducts: state.products.length,
      subscriptionRevenue: money(state.adminResources.subscriptions.reduce((sum, item) => sum + Number(item.amount || 0), 0)),
      openTickets: state.tickets.filter((ticket) => ticket.status === 'open').length,
      pendingPayouts: state.adminResources.payouts.filter((item) => item.status === 'pending').length
    },
    shops: state.shops,
    orders: state.orders,
    users: state.users.map(sanitizeUser),
    products: state.products,
    categories: platformCategories,
    kycSubmissions: state.kycSubmissions,
    tickets: state.tickets,
    merchantChats: state.merchantChats,
    deliveryLogs: state.deliveryLogs,
    resources: state.adminResources,
    auditLogs: state.auditLogs
  });
});

app.get('/api/admin/users', (req, res) => {
  res.json(state.users.map(sanitizeUser));
});

app.post('/api/admin/users', (req, res) => {
  if (!req.body.name || !req.body.email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  if (state.users.some((user) => user.email.toLowerCase() === req.body.email.toLowerCase())) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const temporaryPassword = generateTemporaryPassword();
  const user = {
    id: `user-${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    password: temporaryPassword,
    role: req.body.role || 'customer',
    status: req.body.status || 'active',
    verificationStatus: req.body.verificationStatus || 'temporary_password_sent',
    adminRole: req.body.adminRole || undefined,
    permissions: req.body.permissions || [],
    phone: req.body.phone || '',
    whatsapp: req.body.whatsapp || '',
    mustChangePassword: true,
    personalEmailRequired: true
  };

  state.users.unshift(user);
  const channel = req.body.deliveryChannel === 'whatsapp' ? 'whatsapp' : 'email';
  const destination = channel === 'whatsapp' ? user.whatsapp : user.email;
  if (channel === 'whatsapp' && !destination) {
    return res.status(400).json({ message: 'WhatsApp number is required to receive credentials by WhatsApp' });
  }
  const delivery = queueCredentialDelivery({ user, channel, destination, type: 'temporary_password', secret: temporaryPassword });
  recordAudit(req.body.actor, 'Created user account', user.email, req.ip);
  res.status(201).json({
    ...sanitizeUser(user),
    temporaryPassword,
    delivery
  });
});

app.patch('/api/admin/users/:id', (req, res) => {
  const user = state.users.find((item) => item.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  ['name', 'email', 'role', 'status', 'phone', 'verificationStatus', 'adminRole', 'permissions'].forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  recordAudit(req.body.actor, `Updated user ${req.body.status || req.body.role || 'profile'}`, user.email, req.ip);
  res.json(sanitizeUser(user));
});

app.delete('/api/admin/users/:id', (req, res) => {
  const index = state.users.findIndex((item) => item.id === req.params.id);
  if (index < 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  const [removed] = state.users.splice(index, 1);
  recordAudit(req.body?.actor, 'Deleted user account', removed.email, req.ip);
  res.json(sanitizeUser(removed));
});

app.get('/api/admin/system-status', (req, res) => {
  res.json({
    server: 'Operational',
    database: 'Operational',
    paymentGateway: 'Operational',
    emailService: 'Operational'
  });
});

app.get('/api/admin/resources/:collection', (req, res) => {
  const collection = getAdminCollection(req.params.collection);
  if (!collection) {
    return res.status(404).json({ message: 'Admin resource not found' });
  }

  res.json(collection);
});

app.post('/api/admin/resources/:collection', (req, res) => {
  const collection = getAdminCollection(req.params.collection);
  if (!collection || !Array.isArray(collection)) {
    return res.status(404).json({ message: 'Admin resource not found' });
  }

  const idPrefix = req.params.collection.replace(/[^a-z]/gi, '').slice(0, 6).toLowerCase() || 'item';
  const item = {
    id: req.body.id || `${idPrefix}-${Date.now()}`,
    ...req.body,
    status: req.body.status || 'active'
  };

  collection.unshift(item);
  recordAudit(req.body.actor, `Created ${req.params.collection} item`, item.name || item.title || item.code || item.id, req.ip);
  res.status(201).json(item);
});

app.patch('/api/admin/resources/:collection/:id', (req, res) => {
  const collection = getAdminCollection(req.params.collection);
  if (!collection || !Array.isArray(collection)) {
    return res.status(404).json({ message: 'Admin resource not found' });
  }

  const item = collection.find((entry) => entry.id === req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Admin item not found' });
  }

  Object.assign(item, req.body);
  recordAudit(req.body.actor, `Updated ${req.params.collection}`, item.name || item.title || item.code || item.id, req.ip);
  res.json(item);
});

app.delete('/api/admin/resources/:collection/:id', (req, res) => {
  const collection = getAdminCollection(req.params.collection);
  if (!collection || !Array.isArray(collection)) {
    return res.status(404).json({ message: 'Admin resource not found' });
  }

  const index = collection.findIndex((entry) => entry.id === req.params.id);
  if (index < 0) {
    return res.status(404).json({ message: 'Admin item not found' });
  }

  const [removed] = collection.splice(index, 1);
  recordAudit(req.body?.actor, `Deleted ${req.params.collection}`, removed.name || removed.title || removed.code || removed.id, req.ip);
  res.json(removed);
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
