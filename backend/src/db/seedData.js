'use strict';

/**
 * Demo dataset that previously lived inline in server.js. Keeping it in one
 * module lets the seed script and tests share the same fixtures.
 * Passwords are stored in plain text here only to be hashed by scripts/seed.js.
 */
const categories = [
  {
    id: 'cat-health',
    name: 'Health and Wellness',
    subcategories: ['Pharmacy', 'Optician', 'Gym', 'Clinic', 'Salon / Spa'],
  },
  {
    id: 'cat-retail',
    name: 'Retail',
    subcategories: ['Hardware', 'Fashion', 'Electronics', 'Bookshop', 'Baby Shop'],
  },
  {
    id: 'cat-home-services',
    name: 'Home and Services',
    subcategories: ['Cleaning', 'Plumbing', 'Furniture', 'Laundry', 'Garden'],
  },
  {
    id: 'cat-professional',
    name: 'Professional and Other',
    subcategories: ['Printing', 'Photography', 'Tutoring', 'Vet Clinic', 'Travel'],
  },
  {
    id: 'cat-hospitality',
    name: 'Hospitality',
    subcategories: ['Hotel', 'Tours and Travel', 'Motel / Hotel', 'Night Clubs'],
  },
];

const users = [
  {
    id: 'user-demo-customer',
    name: 'Demo Customer',
    email: 'customer@erim.test',
    password: 'pass123',
    role: 'customer',
    status: 'active',
    verificationStatus: 'verified',
  },
  {
    id: 'user-demo-seller',
    name: 'Maya Chen',
    email: 'seller@erim.test',
    password: 'pass123',
    role: 'seller',
    shopId: 'shop-aurora',
    status: 'active',
    verificationStatus: 'verified',
  },
  {
    id: 'user-demo-admin',
    name: 'Admin User',
    email: 'admin@erim.test',
    password: 'pass123',
    role: 'admin',
    status: 'active',
    adminRole: 'Super Admin',
    permissions: ['all'],
  },
  {
    id: 'user-demo-care',
    name: 'Care Agent',
    email: 'care@erim.test',
    password: 'pass123',
    role: 'care',
    status: 'active',
    adminRole: 'Support Agent',
    permissions: ['tickets', 'chat', 'knowledge_base'],
  },
];

const kycSubmissions = [
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
    submittedAt: '2026-06-08T12:00:00.000Z',
  },
];

const shops = [
  {
    id: 'shop-aurora',
    name: 'Aurora Home',
    owner: 'Maya Chen',
    ownerUserId: 'user-demo-seller',
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
      conditions:
        'Items must be unused, in original packaging, and include the ERIM order reference.',
      refundMethod: 'Mobile money refund or store credit after merchant inspection.',
      returnShipping:
        'Customer pays return delivery unless the item is wrong, damaged, or not as described.',
      exclusions:
        'Opened personal-care items, perishable goods, custom-made products, and clearance items.',
    },
    description: 'Modern kitchenware, bedding, and home accents for small urban spaces.',
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
      returnShipping:
        'Customer pays return delivery unless the merchant sent the wrong size or item.',
      exclusions: 'Custom measurements, altered garments, intimate wear, and sale-final items.',
    },
    description: 'Made-to-order apparel, bags, and accessories from independent designers.',
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
      conditions:
        'Electronics must include packaging, accessories, serial numbers, and pass merchant inspection.',
      refundMethod: 'Replacement, repair, store credit, or refund after inspection.',
      returnShipping:
        'Merchant covers returns for verified defects reported within the policy window.',
      exclusions: 'Water damage, misuse, missing accessories, and opened consumable accessories.',
    },
    description: 'Phones, accessories, and repair kits from verified regional suppliers.',
  },
];

const products = [
  {
    id: 'prod-linen-set',
    shopId: 'shop-aurora',
    name: 'Washed Linen Sheet Set',
    category: 'Furniture',
    price: 334400,
    stock: 42,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'prod-cookware',
    shopId: 'shop-aurora',
    name: 'Ceramic Cookware Bundle',
    category: 'Hardware',
    price: 501600,
    stock: 18,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'prod-weekender',
    shopId: 'shop-kitenge',
    name: 'Wax Print Weekender Bag',
    category: 'Fashion',
    price: 243200,
    stock: 25,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'prod-midi',
    shopId: 'shop-kitenge',
    name: 'Tailored Midi Dress',
    category: 'Fashion',
    price: 300200,
    stock: 11,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'prod-earbuds',
    shopId: 'shop-techlane',
    name: 'Noise Shield Earbuds',
    category: 'Electronics',
    price: 186200,
    stock: 64,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'prod-charger',
    shopId: 'shop-techlane',
    name: 'GaN Travel Charger',
    category: 'Electronics',
    price: 136800,
    stock: 7,
    status: 'low_stock',
    image:
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80',
  },
];

const orders = [
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
      details:
        'Please deliver to Nakasero after 4 PM. Payment was agreed by mobile money on delivery.',
    },
    messages: [
      {
        id: 'msg-ord-1008-1',
        sender: 'Leah N.',
        text: 'Can you deliver after 4 PM?',
        createdAt: '2026-06-08T08:12:00.000Z',
      },
      {
        id: 'msg-ord-1008-2',
        sender: 'Merchant',
        text: 'Yes, we can deliver after 4 PM and confirm payment on delivery.',
        createdAt: '2026-06-08T08:16:00.000Z',
      },
    ],
    createdAt: '2026-06-08T08:10:00.000Z',
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
      details: 'Customer wants pickup details and payment terms confirmed by chat.',
    },
    messages: [
      {
        id: 'msg-ord-1009-1',
        sender: 'Daniel K.',
        text: 'Can I pick this up tomorrow morning?',
        createdAt: '2026-06-08T09:38:00.000Z',
      },
    ],
    createdAt: '2026-06-08T09:35:00.000Z',
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
      details: 'Confirm courier price and payment terms before dispatch.',
    },
    messages: [
      {
        id: 'msg-ord-1010-1',
        sender: 'Sarah M.',
        text: 'Please share delivery fee before sending.',
        createdAt: '2026-06-08T10:24:00.000Z',
      },
    ],
    createdAt: '2026-06-08T10:20:00.000Z',
  },
];

const tickets = [
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
    lastUpdated: '2026-06-08T10:50:00.000Z',
    createdAt: '2026-06-08T10:30:00.000Z',
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
    lastUpdated: '2026-06-08T08:45:00.000Z',
    createdAt: '2026-06-08T08:20:00.000Z',
  },
];

const merchantChats = [
  {
    // Matches normalizeChatId('shop-aurora', 'Demo Customer') so the demo
    // conversation continues instead of spawning a second thread.
    id: 'chat-shop-aurora-demo-customer',
    shopId: 'shop-aurora',
    customer: 'Demo Customer',
    status: 'open',
    lastUpdated: '2026-06-08T11:00:00.000Z',
    messages: [
      {
        id: 'chat-msg-1',
        sender: 'Demo Customer',
        text: 'Hello, do you deliver around Kampala?',
        createdAt: '2026-06-08T10:58:00.000Z',
      },
      {
        id: 'chat-msg-2',
        sender: 'Aurora Home',
        text: 'Yes, we can arrange delivery or pickup depending on your order.',
        createdAt: '2026-06-08T11:00:00.000Z',
      },
    ],
  },
];

const adminResources = {
  returns: [
    {
      id: 'ret-1001',
      customer: 'Demo Customer',
      orderId: 'ord-1008',
      reason: 'Wrong size delivered',
      status: 'pending',
      refundAmount: 334400,
    },
    {
      id: 'ret-1002',
      customer: 'Daniel K.',
      orderId: 'ord-1009',
      reason: 'Changed mind before pickup',
      status: 'approved',
      refundAmount: 243200,
    },
  ],
  brands: [
    { id: 'brand-1', name: 'ERIM Basics', partner: 'Platform', status: 'active', requests: 0 },
    {
      id: 'brand-2',
      name: 'Kitenge Studio',
      partner: 'Kitenge Studio',
      status: 'review',
      requests: 3,
    },
  ],
  coupons: [
    { id: 'coupon-1', code: 'WELCOME10', description: 'New customer discount', usage: 76, status: 'active' },
    { id: 'coupon-2', code: 'FASHION20', description: 'Fashion promo', usage: 28, status: 'active' },
    { id: 'coupon-3', code: 'SHIPFREE', description: 'Delivery support', usage: 12, status: 'review' },
  ],
  banners: [
    { id: 'banner-1', title: 'Homepage Hero', placement: 'Home Page', priority: 1, status: 'active' },
    { id: 'banner-2', title: 'Category Page', placement: 'Category Page', priority: 2, status: 'active' },
    { id: 'banner-3', title: 'Mobile App', placement: 'App promotion', priority: 4, status: 'inactive' },
  ],
  ads: [
    { id: 'ad-1', title: 'Featured Stores', owner: 'Aurora Home', budget: 250000, status: 'active' },
    { id: 'ad-2', title: 'Sponsored Products', owner: 'TechLane Market', budget: 120000, status: 'review' },
  ],
  campaigns: [
    { id: 'camp-1', title: 'June Flash Sale', audience: 'All customers', budget: 850000, status: 'active' },
    { id: 'camp-2', title: 'Holiday Promotions', audience: 'Retail merchants', budget: 450000, status: 'draft' },
  ],
  subscriptionPlans: [
    {
      id: 'plan-monthly',
      name: 'Monthly',
      price: 10000,
      validityDays: 30,
      trialDays: 30,
      billingStarts: 'second_month',
      status: 'active',
    },
    {
      id: 'plan-half-year',
      name: 'Half Year',
      price: 55000,
      validityDays: 180,
      trialDays: 30,
      billingStarts: 'second_month',
      status: 'active',
    },
    {
      id: 'plan-annual',
      name: 'Annual',
      price: 100000,
      validityDays: 365,
      trialDays: 30,
      billingStarts: 'second_month',
      status: 'active',
    },
  ],
  subscriptions: [
    { id: 'sub-aurora', shopId: 'shop-aurora', plan: 'Annual', amount: 100000, daysRemaining: 284, status: 'active' },
    { id: 'sub-kitenge', shopId: 'shop-kitenge', plan: 'Monthly', amount: 10000, daysRemaining: 12, status: 'active' },
    { id: 'sub-techlane', shopId: 'shop-techlane', plan: 'Half Year', amount: 55000, daysRemaining: 0, status: 'expired' },
  ],
  payments: [
    { id: 'txn-10044', merchant: 'TechLane Market', method: 'MTN Mobile Money', amount: 235000, status: 'completed' },
    { id: 'txn-10045', merchant: 'Urban Style', method: 'Visa Card', amount: 145000, status: 'completed' },
    { id: 'txn-10046', merchant: 'Fashion Hub', method: 'Airtel Money', amount: 371000, status: 'pending' },
    { id: 'txn-10047', merchant: 'Home & Living', method: 'Bank Transfer', amount: 812000, status: 'completed' },
  ],
  payouts: [
    { id: 'pay-1', merchant: 'Aurora Home', amount: 1840000, method: 'MTN Mobile Money', status: 'pending' },
    { id: 'pay-2', merchant: 'Kitenge Studio', amount: 960000, method: 'Bank Transfer', status: 'approved' },
  ],
  taxes: [
    { id: 'tax-vat', name: 'VAT', rate: 18, region: 'Uganda', status: 'active' },
    { id: 'tax-service', name: 'Digital service levy', rate: 5, region: 'Platform', status: 'review' },
  ],
  pages: [
    { id: 'page-home', title: 'Homepage', owner: 'Content Manager', version: 4, status: 'published' },
    { id: 'page-sell', title: 'Start Selling', owner: 'Marketing Manager', version: 2, status: 'draft' },
  ],
  blog: [
    { id: 'blog-1', title: 'How to Sell Better on ERIM', author: 'Admin User', category: 'Merchant Education', status: 'published' },
    { id: 'blog-2', title: 'Safe Shopping Guide', author: 'Content Manager', category: 'Customer Trust', status: 'draft' },
  ],
  faqs: [
    { id: 'faq-1', question: 'How do I contact a merchant?', category: 'Shopping', status: 'published' },
    { id: 'faq-2', question: 'How are subscriptions paid?', category: 'Merchants', status: 'published' },
  ],
  announcements: [
    { id: 'ann-1', title: 'Platform maintenance', audience: 'All Users', status: 'sent' },
    { id: 'ann-2', title: 'New commission rates', audience: 'Merchants', status: 'scheduled' },
  ],
  shipping: [
    { id: 'ship-1', partner: 'ERIM Delivery', zones: 'Kampala, Wakiso, Mukono', baseRate: 5000, status: 'active' },
    { id: 'ship-2', partner: 'Regional Courier', zones: 'Nationwide', baseRate: 15000, status: 'review' },
  ],
  security: [
    { id: 'sec-2fa', name: 'Admin two-factor authentication', risk: 'low', status: 'enforced' },
    { id: 'sec-fraud', name: 'Fraud detection rules', risk: 'medium', status: 'monitoring' },
    { id: 'sec-ip', name: 'IP block list', risk: 'low', status: 'active' },
  ],
  roles: [
    { id: 'role-super-admin', name: 'Super Admin', description: 'Full access to all system features', users: 1, status: 'active' },
    { id: 'role-admin', name: 'Admin', description: 'Manage platform operations', users: 5, status: 'active' },
    { id: 'role-ops', name: 'Operations Manager', description: 'Orders, logistics, disputes', users: 2, status: 'active' },
    { id: 'role-finance', name: 'Finance Officer', description: 'Payments, payouts, tax', users: 2, status: 'active' },
    { id: 'role-care-manager', name: 'Customer Care Manager', description: 'Tickets and agent oversight', users: 1, status: 'active' },
    { id: 'role-support', name: 'Support Agent', description: 'Handle customer tickets and chat', users: 8, status: 'active' },
    { id: 'role-marketing', name: 'Marketing Manager', description: 'Coupons, banners, ads, campaigns', users: 3, status: 'active' },
    { id: 'role-content', name: 'Content Manager', description: 'Pages, blogs, FAQs', users: 3, status: 'active' },
  ],
  settings: [
    { id: 'set-currency', name: 'Base currency', value: 'UGX', status: 'active' },
    { id: 'set-mtn', name: 'MTN Mobile Money gateway', value: 'Enabled', status: 'active' },
    { id: 'set-airtel', name: 'Airtel Money gateway', value: 'Enabled', status: 'active' },
    { id: 'set-email', name: 'Email service', value: 'Enabled', status: 'active' },
    { id: 'set-whatsapp', name: 'WhatsApp service', value: 'Enabled', status: 'active' },
  ],
  aiAutomation: [
    { id: 'ai-review', name: 'Fake review detection', coverage: 'Reviews', status: 'monitoring' },
    { id: 'ai-fraud', name: 'Fraud transaction detection', coverage: 'Payments', status: 'active' },
    { id: 'auto-renewal', name: 'Subscription renewal alerts', coverage: 'Merchants', status: 'active' },
    { id: 'auto-tax', name: 'Auto tax calculations', coverage: 'Finance', status: 'active' },
    { id: 'auto-payout', name: 'Auto payout scheduling', coverage: 'Payouts', status: 'review' },
  ],
  backups: [
    { id: 'backup-1', name: 'Daily database backup', target: 'Primary storage', status: 'completed' },
    { id: 'backup-2', name: 'Disaster recovery restore point', target: 'Secondary storage', status: 'ready' },
  ],
};

const auditLogs = [
  {
    id: 'audit-1',
    actor: 'Admin User',
    action: 'Login Successful',
    target: 'Admin Console',
    ip: '192.168.1.1',
    createdAt: '2026-06-13T08:30:00.000Z',
  },
  {
    id: 'audit-2',
    actor: 'System',
    action: 'Backup completed',
    target: 'Daily database backup',
    ip: '192.168.1.1',
    createdAt: '2026-06-13T02:00:00.000Z',
  },
];

module.exports = {
  categories,
  users,
  kycSubmissions,
  shops,
  products,
  orders,
  tickets,
  merchantChats,
  adminResources,
  auditLogs,
};
