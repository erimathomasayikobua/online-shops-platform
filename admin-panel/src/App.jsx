import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
const money = (value) => `UGX ${Math.round(Number(value || 0)).toLocaleString('en-UG')}`;

const navGroups = [
  { label: 'Management', items: [['dashboard', 'Dashboard'], ['users', 'Users'], ['care-staff', 'Care Staff'], ['merchants', 'Merchants'], ['kyc', 'KYC Verification'], ['products', 'Products'], ['orders', 'Orders'], ['returns', 'Returns'], ['categories', 'Categories'], ['brands', 'Brands']] },
  { label: 'Marketing', items: [['coupons', 'Coupons'], ['banners', 'Banners'], ['ads', 'Advertisements'], ['campaigns', 'Campaigns']] },
  { label: 'Subscriptions & Finance', items: [['subscriptions', 'Shop Subscriptions'], ['plans', 'Subscription Plans'], ['payments', 'Payments'], ['payouts', 'Payouts'], ['revenue', 'Revenue'], ['tax', 'Tax Management']] },
  { label: 'Support & Content', items: [['tickets', 'Tickets'], ['chat-monitoring', 'Chat Monitoring'], ['faqs', 'Knowledge Base / FAQs'], ['pages', 'Pages'], ['blog', 'Blog Posts'], ['announcements', 'Announcements']] },
  { label: 'Logistics & Security', items: [['shipping', 'Delivery Management'], ['security', 'Security'], ['roles', 'Roles & Permissions'], ['logs', 'Audit Logs']] },
  { label: 'System & AI', items: [['reports', 'Reports & Analytics'], ['settings', 'Settings'], ['integrations', 'Integrations'], ['backups', 'Backup & Recovery'], ['automation', 'AI & Automation']] }
];

const emptyForms = {
  user: { name: '', email: '', phone: '', whatsapp: '', role: 'customer', adminRole: '', status: 'active', deliveryChannel: 'email' },
  product: { name: '', category: 'Retail', price: '', stock: '', image: '' },
  generic: { name: '', description: '', amount: '', status: 'active' }
};

const resourceMap = {
  returns: { collection: 'returns', title: 'Returns', columns: ['customer', 'orderId', 'reason', 'refundAmount', 'status'], create: { customer: '', orderId: '', reason: '', refundAmount: '', status: 'pending' }, actions: [['Approve', { status: 'approved' }], ['Reject', { status: 'rejected' }]] },
  categories: { collection: 'categories', title: 'Categories', columns: ['name', 'subcategories', 'status'], create: { name: '', subcategories: '', status: 'active' }, actions: [['Activate', { status: 'active' }], ['Disable', { status: 'inactive' }]] },
  brands: { collection: 'brands', title: 'Brands', columns: ['name', 'partner', 'requests', 'status'], create: { name: '', partner: '', requests: 0, status: 'review' }, actions: [['Approve', { status: 'active' }], ['Disable', { status: 'inactive' }]] },
  coupons: { collection: 'coupons', title: 'Coupons', columns: ['code', 'description', 'usage', 'status'], create: { code: '', description: '', usage: 0, status: 'active' }, actions: [['Approve', { status: 'active' }], ['Disable', { status: 'inactive' }]] },
  banners: { collection: 'banners', title: 'Banners', columns: ['title', 'placement', 'priority', 'status'], create: { title: '', placement: 'Homepage', priority: 1, status: 'review' }, actions: [['Approve', { status: 'active' }], ['Disable', { status: 'inactive' }]] },
  ads: { collection: 'ads', title: 'Advertisements', columns: ['title', 'owner', 'budget', 'status'], create: { title: '', owner: '', budget: '', status: 'review' }, actions: [['Approve', { status: 'active' }], ['Pause', { status: 'paused' }]] },
  campaigns: { collection: 'campaigns', title: 'Campaigns', columns: ['title', 'audience', 'budget', 'status'], create: { title: '', audience: 'All users', budget: '', status: 'draft' }, actions: [['Launch', { status: 'active' }], ['Pause', { status: 'paused' }]] },
  subscriptions: { collection: 'subscriptions', title: 'Shop Subscriptions', columns: ['shopId', 'plan', 'amount', 'daysRemaining', 'status'], create: { shopId: 'shop-aurora', plan: 'Monthly', amount: 10000, daysRemaining: 30, status: 'active' }, actions: [['Renew', { status: 'active', daysRemaining: 30 }], ['Suspend', { status: 'suspended' }]] },
  plans: { collection: 'subscriptionPlans', title: 'Subscription Plans', columns: ['name', 'price', 'validityDays', 'trialDays', 'billingStarts', 'status'], create: { name: '', price: '', validityDays: 30, trialDays: 30, billingStarts: 'second_month', status: 'active' }, actions: [['Activate', { status: 'active' }], ['Disable', { status: 'inactive' }]] },
  payments: { collection: 'payments', title: 'Payments', columns: ['merchant', 'method', 'amount', 'status'], create: { merchant: '', method: 'MTN Mobile Money', amount: '', status: 'pending' }, actions: [['Verify', { status: 'completed' }], ['Flag', { status: 'flagged' }]] },
  payouts: { collection: 'payouts', title: 'Payouts', columns: ['merchant', 'amount', 'method', 'status'], create: { merchant: '', amount: '', method: 'MTN Mobile Money', status: 'pending' }, actions: [['Approve', { status: 'approved' }], ['Hold', { status: 'held' }]] },
  tax: { collection: 'taxes', title: 'Tax Management', columns: ['name', 'rate', 'region', 'status'], create: { name: '', rate: 18, region: 'Uganda', status: 'active' }, actions: [['Activate', { status: 'active' }], ['Review', { status: 'review' }]] },
  faqs: { collection: 'faqs', title: 'Knowledge Base / FAQs', columns: ['question', 'category', 'status'], create: { question: '', category: 'General', status: 'published' }, actions: [['Publish', { status: 'published' }], ['Draft', { status: 'draft' }]] },
  pages: { collection: 'pages', title: 'Pages', columns: ['title', 'owner', 'version', 'status'], create: { title: '', owner: 'Content Manager', version: 1, status: 'draft' }, actions: [['Publish', { status: 'published' }], ['Draft', { status: 'draft' }]] },
  blog: { collection: 'blog', title: 'Blog Posts', columns: ['title', 'author', 'category', 'status'], create: { title: '', author: 'Admin User', category: 'News', status: 'draft' }, actions: [['Publish', { status: 'published' }], ['Draft', { status: 'draft' }]] },
  announcements: { collection: 'announcements', title: 'Announcements', columns: ['title', 'audience', 'status'], create: { title: '', audience: 'All Users', status: 'scheduled' }, actions: [['Send', { status: 'sent' }], ['Cancel', { status: 'cancelled' }]] },
  shipping: { collection: 'shipping', title: 'Delivery Management', columns: ['partner', 'zones', 'baseRate', 'status'], create: { partner: '', zones: '', baseRate: 5000, status: 'review' }, actions: [['Approve', { status: 'active' }], ['Disable', { status: 'inactive' }]] },
  security: { collection: 'security', title: 'Security', columns: ['name', 'risk', 'status'], create: { name: '', risk: 'low', status: 'monitoring' }, actions: [['Enforce', { status: 'enforced' }], ['Monitor', { status: 'monitoring' }]] },
  roles: { collection: 'roles', title: 'Roles & Permissions', columns: ['name', 'description', 'users', 'status'], create: { name: '', description: '', users: 0, status: 'active' }, actions: [['Activate', { status: 'active' }], ['Disable', { status: 'inactive' }]] },
  settings: { collection: 'settings', title: 'Settings', columns: ['name', 'value', 'status'], create: { name: '', value: '', status: 'active' }, actions: [['Enable', { status: 'active' }], ['Disable', { status: 'inactive' }]] },
  integrations: { collection: 'settings', title: 'Integrations', columns: ['name', 'value', 'status'], create: { name: '', value: 'Enabled', status: 'active' }, actions: [['Enable', { status: 'active' }], ['Disable', { status: 'inactive' }]] },
  backups: { collection: 'backups', title: 'Backup & Recovery', columns: ['name', 'target', 'status'], create: { name: '', target: 'Primary storage', status: 'ready' }, actions: [['Run Backup', { status: 'completed' }], ['Mark Ready', { status: 'ready' }]] },
  automation: { collection: 'aiAutomation', title: 'AI & Automation', columns: ['name', 'coverage', 'status'], create: { name: '', coverage: '', status: 'monitoring' }, actions: [['Activate', { status: 'active' }], ['Review', { status: 'review' }]] }
};

function App() {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('erimAdminAuth');
    return saved ? JSON.parse(saved) : null;
  });
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [overview, setOverview] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [dateRange, setDateRange] = useState('This Month');
  const [userForm, setUserForm] = useState(emptyForms.user);
  const [productForm, setProductForm] = useState(emptyForms.product);
  const [genericForms, setGenericForms] = useState({});
  const [passwordChange, setPasswordChange] = useState({ session: null, currentPassword: '', newPassword: '', personalEmail: '' });

  const actor = adminUser?.user?.name || 'Admin User';
  const adminRole = adminUser?.user?.adminRole || 'Super Admin';

  const loadOverview = () => {
    if (!adminUser) return;
    fetch(`${API_URL}/admin/overview`)
      .then((response) => response.json())
      .then(setOverview)
      .catch(() => setNotice('Backend is offline. Start it with npm run dev:backend.'));
  };

  useEffect(loadOverview, [adminUser]);

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Admin action failed.');
    return result;
  };

  const loginAdmin = async (event) => {
    event.preventDefault();
    try {
      const result = await requestJson(`${API_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(authForm)
      });

      if (result.user.role !== 'admin') {
        setAuthNotice('Use an admin account to access ERIM Admin.');
        return;
      }

      const session = { user: result.user, token: result.token };
      if (result.requiresPasswordChange) {
        setPasswordChange({ session, currentPassword: authForm.password, newPassword: '', personalEmail: result.user.personalEmail || result.user.email || '' });
        setAuthNotice('Temporary password accepted. Create your permanent password and register your personal email.');
        return;
      }
      localStorage.setItem('erimAdminAuth', JSON.stringify(session));
      setAdminUser(session);
      setAuthNotice('');
      setNotice(`Welcome back, ${result.user.name}.`);
    } catch (error) {
      setAuthNotice(error.message);
    }
  };

  const completePasswordChange = async (event) => {
    event.preventDefault();
    try {
      const result = await requestJson(`${API_URL}/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify({
          userId: passwordChange.session.user.id,
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword,
          personalEmail: passwordChange.personalEmail
        })
      });
      const session = { user: result.user, token: result.token };
      localStorage.setItem('erimAdminAuth', JSON.stringify(session));
      setAdminUser(session);
      setPasswordChange({ session: null, currentPassword: '', newPassword: '', personalEmail: '' });
      setAuthNotice('');
      setNotice(result.message);
    } catch (error) {
      setAuthNotice(error.message);
    }
  };

  const logoutAdmin = (message = '') => {
    const logoutMessage = typeof message === 'string' ? message : '';
    localStorage.removeItem('erimAdminAuth');
    setAdminUser(null);
    setOverview(null);
    if (logoutMessage) setAuthNotice(logoutMessage);
  };

  useEffect(() => {
    if (!adminUser) return undefined;

    let timerId;
    const resetTimer = () => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        logoutAdmin('Session expired after 10 minutes of inactivity. Please sign in again.');
      }, INACTIVITY_TIMEOUT_MS);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    resetTimer();
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));

    return () => {
      window.clearTimeout(timerId);
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [adminUser]);

  const shops = overview?.shops || [];
  const orders = overview?.orders || [];
  const users = overview?.users || [];
  const products = overview?.products || [];
  const resources = overview?.resources || {};
  const tickets = overview?.tickets || [];
  const kycSubmissions = overview?.kycSubmissions || [];
  const merchantChats = overview?.merchantChats || [];
  const auditLogs = overview?.auditLogs || [];
  const metrics = overview?.metrics || {};
  const categories = overview?.categories || [];
  const searchText = query.trim().toLowerCase();

  const filterRows = (rows) => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(searchText));
  const filteredUsers = filterRows(users);
  const filteredShops = filterRows(shops);
  const filteredProducts = filterRows(products);
  const filteredOrders = filterRows(orders);

  const updateUser = async (userId, payload) => {
    try {
      const result = await requestJson(`${API_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...payload, actor })
      });
      setNotice(`${result.name} updated.`);
      loadOverview();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    try {
      const result = await requestJson(`${API_URL}/admin/users`, {
        method: 'POST',
        body: JSON.stringify({ ...userForm, actor })
      });
      setNotice(`${result.name} account created.`);
      if (result.delivery) {
        setNotice(`${result.name} account created. Temporary password sent by ${result.delivery.channel} to ${result.delivery.destination}.`);
      }
      setUserForm(emptyForms.user);
      loadOverview();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const result = await requestJson(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        body: JSON.stringify({ actor })
      });
      setNotice(`${result.name} deleted.`);
      loadOverview();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const updateShop = async (shopId, status) => {
    try {
      const result = await requestJson(`${API_URL}/shops/${shopId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, actor })
      });
      setNotice(`${result.name} moved to ${result.status}.`);
      loadOverview();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const updateOrder = async (orderId, status) => {
    try {
      const result = await requestJson(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, actor })
      });
      setNotice(`${result.id} moved to ${result.status}.`);
      loadOverview();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const updateProduct = async (productId, payload) => {
    try {
      const result = await requestJson(`${API_URL}/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...payload, actor })
      });
      setNotice(`${result.name} updated.`);
      loadOverview();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const addProduct = async (event) => {
    event.preventDefault();
    try {
      const result = await requestJson(`${API_URL}/products`, {
        method: 'POST',
        body: JSON.stringify({ ...productForm, shopId: shops[0]?.id, actor })
      });
      setNotice(`${result.name} added to catalog.`);
      setProductForm(emptyForms.product);
      loadOverview();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const updateResource = async (config, item, payload) => {
    try {
      const result = await requestJson(`${API_URL}/admin/resources/${config.collection}/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...payload, actor })
      });
      setNotice(`${result.name || result.title || result.code || result.id} updated.`);
      loadOverview();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const createResource = async (config, event) => {
    event.preventDefault();
    const form = genericForms[config.collection] || config.create || emptyForms.generic;
    const payload = { ...form };
    Object.keys(payload).forEach((key) => {
      if (key === 'subcategories' && typeof payload[key] === 'string') payload[key] = payload[key].split(',').map((item) => item.trim()).filter(Boolean);
      if (['amount', 'budget', 'price', 'rate', 'baseRate', 'refundAmount', 'priority', 'usage', 'users', 'version', 'validityDays', 'trialDays', 'daysRemaining'].includes(key) && payload[key] !== '') payload[key] = Number(payload[key]);
    });

    try {
      const result = await requestJson(`${API_URL}/admin/resources/${config.collection}`, {
        method: 'POST',
        body: JSON.stringify({ ...payload, actor })
      });
      setNotice(`${result.name || result.title || result.code || result.id} created.`);
      setGenericForms((current) => ({ ...current, [config.collection]: config.create || emptyForms.generic }));
      loadOverview();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const deleteResource = async (config, item) => {
    try {
      const result = await requestJson(`${API_URL}/admin/resources/${config.collection}/${item.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ actor })
      });
      setNotice(`${result.name || result.title || result.code || result.id} deleted.`);
      loadOverview();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const exportReport = () => {
    const csv = [
      'Section,Count,Value',
      `Users,${users.length},`,
      `Merchants,${shops.length},`,
      `Products,${products.length},`,
      `Orders,${orders.length},${money(metrics.grossMerchandiseValue)}`,
      `Subscriptions,${resources.subscriptions?.length || 0},${money(metrics.subscriptionRevenue)}`,
      `Open Tickets,${metrics.openTickets || 0},`
    ].join('\n');
    navigator.clipboard?.writeText(csv);
    setNotice('Admin report copied to clipboard.');
  };

  const statCards = [
    ['Total Sales', money(metrics.grossMerchandiseValue || 0), '18.6%', 'blue'],
    ['Total Orders', orders.length || 0, '12.5%', 'green'],
    ['Total Users', metrics.totalUsers || users.length || 0, '9.4%', 'violet'],
    ['Total Merchants', metrics.shops || shops.length || 0, '8.7%', 'orange'],
    ['Subscription Revenue', money(metrics.subscriptionRevenue || 0), '10.2%', 'green'],
    ['Open Tickets', metrics.openTickets || 0, '6.1%', 'orange']
  ];

  const renderSalesChart = () => (
    <svg className="admin-line-chart" viewBox="0 0 860 300" role="img" aria-label="Sales overview chart">
      {[42, 100, 158, 216, 274].map((y) => <line key={y} x1="50" x2="835" y1={y} y2={y} />)}
      <polyline className="sales" points="50,142 165,108 285,132 405,92 525,148 645,110 760,110 835,48" />
      <polyline className="orders" points="50,212 165,162 285,204 405,172 525,210 645,176 760,166 835,154" />
      <polyline className="visitors" points="50,248 165,224 285,240 405,224 525,242 645,216 760,220 835,210" />
      {['UGX 20M', 'UGX 15M', 'UGX 10M', 'UGX 5M', 'UGX 0'].map((label, index) => <text key={label} x="0" y={48 + index * 58}>{label}</text>)}
    </svg>
  );

  const renderDashboard = () => (
    <>
      <section className="admin-stats">
        {statCards.map(([label, value, change, tone]) => (
          <article key={label}>
            <span className={`stat-icon ${tone}`}>{label.slice(0, 2)}</span>
            <div><span>{label}</span><strong>{value}</strong><small>Up {change}</small></div>
          </article>
        ))}
      </section>

      <section className="admin-role-card">
        <article className="admin-panel">
          <div className="panel-head"><h2>ERIM Super Admin Role</h2><button onClick={() => setActivePage('roles')}>Manage RBAC</button></div>
          <div className="role-grid">
            {['Users & Accounts', 'Merchant Approval', 'Product Quality Control', 'Orders & Disputes', 'Marketing & Ads', 'Subscriptions', 'Payments & Payouts', 'Tax', 'Support Oversight', 'Security & Compliance', 'Content', 'Logistics', 'Reports', 'System Settings', 'AI & Automation'].map((item) => <span key={item}>{item}</span>)}
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="admin-panel chart-panel">
          <div className="panel-head"><h2>Sales Overview</h2><button>Daily</button></div>
          <div className="legend"><span className="blue-dot" />Sales <span className="pale-dot" />Orders <span className="dash-dot" />Visitors</div>
          {renderSalesChart()}
        </article>
        <article className="admin-panel channel-card">
          <div className="panel-head"><h2>Platform Control</h2><button className="link-button" onClick={() => setActivePage('reports')}>View report</button></div>
          <div className="platform-grid">
            {[
              ['Pending Orders', orders.filter((order) => ['paid', 'pending', 'awaiting_arrangement'].includes(order.status)).length],
              ['Pending Returns', resources.returns?.filter((item) => item.status === 'pending').length || 0],
              ['KYC Reviews', kycSubmissions.filter((item) => item.status === 'under_review').length],
              ['Low Stock Products', products.filter((product) => product.stock < 12).length],
              ['Pending Payouts', metrics.pendingPayouts || 0],
              ['Active Coupons', resources.coupons?.filter((item) => item.status === 'active').length || 0]
            ].map(([label, value]) => <span key={label}><i>{label.slice(0, 2)}</i>{label}<strong>{value}</strong></span>)}
          </div>
        </article>
      </section>

      <section className="three-grid">
        {renderOrdersTable(filteredOrders.slice(0, 5), 'Latest Orders')}
        {renderMerchantsTable(filteredShops.slice(0, 5), 'Top Merchants')}
        {renderUsersTable(filteredUsers.slice(0, 5), 'Recent Users')}
      </section>
    </>
  );

  const renderUsersTable = (rows, title = 'Users', roleFilter = null) => {
    const displayRows = roleFilter ? rows.filter((user) => roleFilter.includes(user.role)) : rows;
    return (
      <article className="admin-panel">
        <div className="panel-head"><h2>{title}</h2><button onClick={() => setActivePage('users')}>Manage users</button></div>
        <form className="inline-form" onSubmit={createUser}>
          <input placeholder="Full name" value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} required />
          <input placeholder="Email" type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required />
          <input placeholder="Contact phone" value={userForm.phone} onChange={(event) => setUserForm({ ...userForm, phone: event.target.value })} />
          <input placeholder="WhatsApp" value={userForm.whatsapp} onChange={(event) => setUserForm({ ...userForm, whatsapp: event.target.value })} />
          <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value, adminRole: event.target.value === 'care' ? 'Support Agent' : event.target.value === 'admin' ? 'Admin' : '' })}>
            <option value="customer">Customer</option><option value="care">Customer Care Staff</option><option value="seller">Merchant User</option><option value="admin">Admin</option>
          </select>
          <select value={userForm.deliveryChannel} onChange={(event) => setUserForm({ ...userForm, deliveryChannel: event.target.value })}>
            <option value="email">Email password</option><option value="whatsapp">WhatsApp password</option>
          </select>
          <button type="submit">Create Account</button>
        </form>
        <div className="admin-table users-table">
          <div className="table-head"><span>User</span><span>Email</span><span>Role</span><span>Status</span><span>Action</span></div>
          {displayRows.map((user) => (
            <div className="table-row" key={user.id}>
              <span><i>{user.name?.[0] || 'U'}</i>{user.name}<small>{user.adminRole || user.verificationStatus || 'Account'}</small></span>
              <span>{user.email}</span>
              <span>{user.role}</span>
              <mark className={user.status || 'active'}>{user.status || 'active'}</mark>
              <span className="row-actions">
                <button onClick={() => updateUser(user.id, { status: user.status === 'suspended' ? 'active' : 'suspended' })}>{user.status === 'suspended' ? 'Activate' : 'Suspend'}</button>
                <button onClick={() => updateUser(user.id, { verificationStatus: 'verified' })}>Verify</button>
                <button onClick={() => deleteUser(user.id)}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      </article>
    );
  };

  const renderMerchantsTable = (rows, title = 'Merchants') => (
    <article className="admin-panel">
      <div className="panel-head"><h2>{title}</h2><button onClick={() => setActivePage('kyc')}>Verify Documents</button></div>
      <div className="admin-table merchant-table">
        <div className="table-head"><span>Merchant</span><span>Orders</span><span>Sales</span><span>Status</span><span>Action</span></div>
        {rows.map((shop) => (
          <div className="table-row" key={shop.id}>
            <span><i>{shop.name.slice(0, 2)}</i>{shop.name}<small>{shop.owner} - Rating {shop.rating}</small></span>
            <span>{shop.orders}</span>
            <span>{money(shop.revenue)}</span>
            <mark className={shop.status}>{shop.status}</mark>
            <span className="row-actions">
              <button onClick={() => updateShop(shop.id, 'active')}>Approve</button>
              <button onClick={() => updateShop(shop.id, 'suspended')}>Suspend</button>
              <button onClick={() => updateShop(shop.id, 'blacklisted')}>Blacklist</button>
            </span>
          </div>
        ))}
      </div>
    </article>
  );

  const renderOrdersTable = (rows, title = 'Orders') => (
    <article className="admin-panel">
      <div className="panel-head"><h2>{title}</h2><button onClick={exportReport}>Export</button></div>
      <div className="admin-table order-table">
        <div className="table-head"><span>Order ID</span><span>Customer</span><span>Amount</span><span>Status</span><span>Date</span><span>Action</span></div>
        {rows.map((order) => (
          <div className="table-row" key={order.id}>
            <span>{order.id}<small>{order.shop?.name}</small></span>
            <span>{order.customer}</span>
            <span>{money(order.total)}</span>
            <mark className={order.status}>{String(order.status).replace('_', ' ')}</mark>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span className="row-actions">
              <button onClick={() => updateOrder(order.id, 'fulfilled')}>Resolve</button>
              <button onClick={() => updateOrder(order.id, 'cancelled')}>Cancel Fraud</button>
              <button onClick={() => updateOrder(order.id, 'refunded')}>Force Refund</button>
            </span>
          </div>
        ))}
      </div>
    </article>
  );

  const renderProductsPage = () => (
    <section className="split-page">
      <form className="admin-panel product-form" onSubmit={addProduct}>
        <h2>Add / Import Product</h2>
        <label>Name<input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required /></label>
        <label>Category<input value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} required /></label>
        <label>Price in UGX<input type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required /></label>
        <label>Stock<input type="number" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} required /></label>
        <label>Image URL<input value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} /></label>
        <button type="submit">Add Product</button>
        <button type="button" onClick={() => setNotice('Bulk import template validated. Add CSV upload storage before production.')}>Bulk Import</button>
      </form>
      <article className="admin-panel">
        <div className="panel-head"><h2>Product Oversight</h2><button onClick={exportReport}>Export</button></div>
        <div className="admin-table product-table">
          <div className="table-head"><span>Product</span><span>Category</span><span>Price</span><span>Status</span><span>Action</span></div>
          {filteredProducts.map((product) => (
            <div className="table-row" key={product.id}>
              <span><img src={product.image} alt="" />{product.name}<small>{product.stock} in stock</small></span>
              <span>{product.category}</span>
              <span>{money(product.price)}</span>
              <mark className={product.status}>{product.status}</mark>
              <span className="row-actions">
                <button onClick={() => updateProduct(product.id, { status: 'active' })}>Approve</button>
                <button onClick={() => updateProduct(product.id, { status: 'removed' })}>Remove</button>
                <button onClick={() => updateProduct(product.id, { qualityFlag: 'reviewed' })}>QC Pass</button>
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );

  const renderResourcePage = (key) => {
    const config = resourceMap[key];
    const rows = filterRows(config.collection === 'categories' ? categories : resources[config.collection] || []);
    const form = genericForms[config.collection] || config.create || emptyForms.generic;
    const formKeys = Object.keys(config.create || emptyForms.generic);

    return (
      <section className="resource-page">
        <form className="admin-panel inline-form resource-form" onSubmit={(event) => createResource(config, event)}>
          <h2>Create {config.title}</h2>
          {formKeys.map((field) => (
            <input
              key={field}
              placeholder={field}
              value={Array.isArray(form[field]) ? form[field].join(', ') : form[field]}
              onChange={(event) => setGenericForms((current) => ({ ...current, [config.collection]: { ...form, [field]: event.target.value } }))}
            />
          ))}
          <button type="submit">Create</button>
        </form>
        <article className="admin-panel">
          <div className="panel-head"><h2>{config.title}</h2><button onClick={exportReport}>Export</button></div>
          <div className="admin-table simple-table">
            <div className="table-head">{config.columns.map((column) => <span key={column}>{column}</span>)}<span>Action</span></div>
            {rows.map((item) => (
              <div className="table-row" key={item.id || item.name}>
                {config.columns.map((column) => <span key={column}>{Array.isArray(item[column]) ? item[column].join(', ') : column.toLowerCase().includes('amount') || column.toLowerCase().includes('price') || column.toLowerCase().includes('budget') || column.toLowerCase().includes('rate') || column.toLowerCase().includes('base') || column.toLowerCase().includes('refund') ? money(item[column]) : item[column]}</span>)}
                <span className="row-actions">
                  {(config.actions || [['Activate', { status: 'active' }]]).map(([label, payload]) => <button key={label} onClick={() => updateResource(config, item, payload)}>{label}</button>)}
                  <button onClick={() => deleteResource(config, item)}>Delete</button>
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    );
  };

  const renderKyc = () => renderResourceLike('KYC Verification', kycSubmissions, ['legalName', 'accountType', 'documentType', 'businessName', 'status'], [
    ['Approve', (item) => updateResource({ collection: 'kyc' }, item, { status: 'approved' })],
    ['Reject', (item) => updateResource({ collection: 'kyc' }, item, { status: 'rejected' })]
  ]);

  const renderResourceLike = (title, rows, columns, actions) => (
    <article className="admin-panel">
      <div className="panel-head"><h2>{title}</h2><button onClick={exportReport}>Export</button></div>
      <div className="admin-table simple-table">
        <div className="table-head">{columns.map((column) => <span key={column}>{column}</span>)}<span>Action</span></div>
        {filterRows(rows).map((item) => (
          <div className="table-row" key={item.id}>
            {columns.map((column) => <span key={column}>{Array.isArray(item[column]) ? item[column].join(', ') : item[column]}</span>)}
            <span className="row-actions">{actions.map(([label, handler]) => <button key={label} onClick={() => handler(item)}>{label}</button>)}</span>
          </div>
        ))}
      </div>
    </article>
  );

  const renderTickets = () => renderResourceLike('Support Tickets', tickets, ['customer', 'subject', 'priority', 'status', 'assignedTo'], [
    ['Escalate', (item) => updateResource({ collection: 'tickets' }, item, { priority: 'high', status: 'in_progress' })],
    ['Close', (item) => updateResource({ collection: 'tickets' }, item, { status: 'closed' })]
  ]);

  const renderChats = () => renderResourceLike('Chat Monitoring', merchantChats.map((chat) => ({ ...chat, lastMessage: chat.messages?.at(-1)?.text || '' })), ['customer', 'shopId', 'status', 'lastMessage'], [
    ['Audit', (item) => updateResource({ collection: 'merchantChats' }, item, { status: 'audited' })],
    ['Close', (item) => updateResource({ collection: 'merchantChats' }, item, { status: 'closed' })]
  ]);

  const renderRevenue = () => (
    <section className="report-page">
      <section className="admin-stats compact">
        <article><span className="stat-icon green">SR</span><div><span>Subscription Income</span><strong>{money(metrics.subscriptionRevenue)}</strong><small>Monthly, half-year, annual plans</small></div></article>
        <article><span className="stat-icon blue">GM</span><div><span>Platform GMV</span><strong>{money(metrics.grossMerchandiseValue)}</strong><small>All order value</small></div></article>
        <article><span className="stat-icon orange">CO</span><div><span>Commission Reports</span><strong>{money((metrics.grossMerchandiseValue || 0) * 0.08)}</strong><small>Demo 8% commission model</small></div></article>
        <article><span className="stat-icon violet">PO</span><div><span>Pending Payouts</span><strong>{metrics.pendingPayouts || 0}</strong><small>Needs finance approval</small></div></article>
      </section>
      {renderResourcePage('payments')}
    </section>
  );

  const renderReports = () => (
    <section className="report-page">
      <section className="admin-stats compact">
        {statCards.slice(0, 4).map(([label, value, change, tone]) => <article key={label}><span className={`stat-icon ${tone}`}>{label.slice(0, 2)}</span><div><span>{label}</span><strong>{value}</strong><small>Up {change}</small></div></article>)}
      </section>
      <article className="admin-panel chart-panel"><div className="panel-head"><h2>Reports & Analytics</h2><button onClick={exportReport}>Export</button></div>{renderSalesChart()}</article>
      {renderResourceLike('Report Center', [
        { id: 'rep-orders', name: 'Orders report', owner: 'Operations', status: 'ready' },
        { id: 'rep-merchants', name: 'Merchant report', owner: 'Operations', status: 'ready' },
        { id: 'rep-products', name: 'Product report', owner: 'Catalog', status: 'ready' },
        { id: 'rep-subscriptions', name: 'Subscription report', owner: 'Finance', status: 'ready' },
        { id: 'rep-tax', name: 'Tax report', owner: 'Finance', status: 'ready' },
        { id: 'rep-support', name: 'Customer support report', owner: 'Care', status: 'ready' }
      ], ['name', 'owner', 'status'], [['Export', () => exportReport()]])}
    </section>
  );

  const renderLogs = () => renderResourceLike('Audit Logs', auditLogs, ['actor', 'action', 'target', 'ip', 'createdAt'], [['Refresh', () => loadOverview()]]);

  const renderPage = () => {
    if (activePage === 'dashboard') return renderDashboard();
    if (activePage === 'users') return renderUsersTable(filteredUsers, 'User & Account Management', ['customer', 'seller', 'admin', 'care']);
    if (activePage === 'care-staff') return renderUsersTable(filteredUsers, 'Customer Care Staff', ['care']);
    if (activePage === 'merchants') return renderMerchantsTable(filteredShops, 'Merchant Management');
    if (activePage === 'kyc') return renderKyc();
    if (activePage === 'products') return renderProductsPage();
    if (activePage === 'orders') return renderOrdersTable(filteredOrders, 'Order Management');
    if (activePage === 'tickets') return renderTickets();
    if (activePage === 'chat-monitoring') return renderChats();
    if (activePage === 'revenue') return renderRevenue();
    if (activePage === 'reports') return renderReports();
    if (activePage === 'logs') return renderLogs();
    if (resourceMap[activePage]) return renderResourcePage(activePage);
    return renderDashboard();
  };

  if (!adminUser) {
    if (passwordChange.session) {
      return (
        <div className="admin-auth-shell">
          <section className="auth-brand-panel">
            <a className="brand-logo" href="#login" aria-label="ERIM admin login"><img src="/erim-logo.png" alt="ERIM" /></a>
            <div><p className="auth-eyebrow">First login security</p><h1>Create your permanent password.</h1><p>Admin-created accounts must replace the temporary password and register a personal email before dashboard access.</p></div>
          </section>
          <main className="auth-form-panel">
            <form className="auth-card" onSubmit={completePasswordChange}>
              <div><p className="auth-eyebrow">Required step</p><h2>Secure your account</h2></div>
              <label>Personal Email<input type="email" value={passwordChange.personalEmail} onChange={(event) => setPasswordChange({ ...passwordChange, personalEmail: event.target.value })} required /></label>
              <label>New Password<input type="password" value={passwordChange.newPassword} onChange={(event) => setPasswordChange({ ...passwordChange, newPassword: event.target.value })} required /></label>
              {authNotice && <p className="notice">{authNotice}</p>}
              <button type="submit">Save Permanent Password</button>
            </form>
          </main>
        </div>
      );
    }

    return (
      <div className="admin-auth-shell">
        <section className="auth-brand-panel">
          <a className="brand-logo" href="#login" aria-label="ERIM admin login"><img src="/erim-logo.png" alt="ERIM" /></a>
          <div>
            <p className="auth-eyebrow">ERIM Super Admin</p>
            <h1>Full platform control for ERIM operations.</h1>
            <p>Manage accounts, merchants, products, orders, subscriptions, finance, support, content, logistics, compliance, system settings, and automation.</p>
          </div>
        </section>
        <main className="auth-form-panel">
          <form className="auth-card" onSubmit={loginAdmin}>
            <div><p className="auth-eyebrow">Admin login</p><h2>Sign in to ERIM Admin</h2></div>
            <label>Email<input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required /></label>
            <label>Password<input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required /></label>
            {authNotice && <p className="notice">{authNotice}</p>}
            <button type="submit">Login to Super Admin Dashboard</button>
          </form>
        </main>
      </div>
    );
  }

  const pageTitle = navGroups.flatMap((group) => group.items).find(([key]) => key === activePage)?.[1] || 'Dashboard';

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="brand-logo" href="#dashboard" onClick={() => setActivePage('dashboard')} aria-label="ERIM admin"><img src="/erim-logo.png" alt="ERIM" /></a>
        <nav>
          {navGroups.map((group) => (
            <div key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([key, label]) => (
                <button className={activePage === key ? 'active' : ''} key={key} onClick={() => setActivePage(key)}>
                  <span>{label.slice(0, 2)}</span>{label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button className="admin-user" onClick={logoutAdmin}><span>{actor.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><strong>{actor}<small>{adminRole} - Logout</small></strong></button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div><h1>{pageTitle}</h1><p>{adminRole}: full access to ERIM platform controls</p></div>
          <label className="admin-search"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything..." /></label>
          <button className="icon-tool" onClick={() => setActivePage('tickets')} aria-label="Notifications" title="Notifications"><span aria-hidden="true">🔔</span><b>{metrics.openTickets || 0}</b></button>
          <button className="icon-tool" onClick={() => setActivePage('chat-monitoring')}>Chat</button>
          <button className="profile-tool" onClick={logoutAdmin}><span>{actor.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><strong>ERIM Admin<small>{adminRole}</small></strong></button>
        </header>

        <div className="admin-actions-row">
          <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}><option>Today</option><option>This Week</option><option>This Month</option><option>This Quarter</option></select>
          <button onClick={loadOverview}>Refresh</button>
          <button onClick={exportReport}>Export Report</button>
        </div>

        {notice && <p className="notice">{notice}</p>}
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
