import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
const money = (value) => `Ugx ${Math.round(Number(value || 0)).toLocaleString('en-UG')}`;
const ugx = money;
const FREE_TRIAL_DAYS = 30;
const addDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const formatUgDate = (date) => new Intl.DateTimeFormat('en-UG', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
}).format(date);

const navGroups = [
  {
    label: 'Store',
    items: [
      ['dashboard', 'Dashboard'],
      ['products', 'Products'],
      ['pos', 'Point of Sale'],
      ['orders', 'Orders'],
      ['returns', 'Returns'],
      ['customers', 'Customers'],
      ['reviews', 'Reviews']
    ]
  },
  {
    label: 'Marketing',
    items: [
      ['discounts', 'Discounts'],
      ['coupons', 'Coupons'],
      ['campaigns', 'Campaigns'],
      ['banners', 'Banner Management']
    ]
  },
  {
    label: 'Analytics',
    items: [
      ['analytics', 'Sales Analytics'],
      ['traffic', 'Traffic & Visitors'],
      ['reports', 'Reports']
    ]
  },
  {
    label: 'Store settings',
    items: [
      ['profile', 'Store Profile'],
      ['shipping', 'Shipping'],
      ['payments', 'Payments'],
      ['rent', 'Rent & Setup'],
      ['staff', 'Staff Management'],
      ['settings', 'Settings']
    ]
  }
];

const miniPages = {
  returns: { title: 'Returns', action: 'Create return policy', rows: ['Return window: 7 days', 'Open returns: 5', 'Refund method: Mobile money or store credit'] },
  customers: { title: 'Customers', action: 'Export customers', rows: ['John Doe - 8 orders', 'Jane Smith - 5 orders', 'Robert Brown - 3 orders'] },
  reviews: { title: 'Reviews', action: 'Reply to reviews', rows: ['4.7 / 5 customer satisfaction', '12 reviews pending reply', 'Top feedback: delivery speed'] },
  discounts: { title: 'Discounts', action: 'Create discount', rows: ['Weekend Deal - 12% off', 'New Buyer - UGX 10,000 off', 'Clearance - 20% off'] },
  coupons: { title: 'Coupons', action: 'Generate coupons', rows: ['ERIMWELCOME', 'FASHION10', 'FREESHIPUG'] },
  campaigns: { title: 'Campaigns', action: 'Launch campaign', rows: ['Back to School Promo', 'Payday Fashion Push', 'Returning Customer WhatsApp'] },
  banners: { title: 'Banner Management', action: 'Upload banner', rows: ['Homepage hero active', 'Mobile app banner scheduled', 'Marketplace strip draft'] },
  analytics: { title: 'Sales Analytics', action: 'Download CSV', rows: ['Website: 60%', 'Mobile app: 25%', 'Marketplace: 10%', 'Others: 5%'] },
  traffic: { title: 'Traffic & Visitors', action: 'Download CSV', rows: ['12,842 visitors', 'Organic search: 38%', 'Social: 24%', 'Direct: 21%'] },
  reports: { title: 'Reports', action: 'Generate weekly reports', rows: ['Weekly sales report', 'Inventory valuation', 'Rent and payout statement', 'Subscription value report'] },
  profile: { title: 'Store Profile', action: 'Save profile', rows: ['Erim Fashion Store', 'Verified Merchant', 'Kampala, Uganda'] },
  shipping: { title: 'Shipping', action: 'Add zone', rows: ['Kampala same-day', 'Upcountry courier', 'Pickup enabled'] },
  payments: { title: 'Payments', action: 'Add payment method', rows: ['Base currency: Ugandan shillings', 'MTN Mobile Money wallet active', 'Airtel Money wallet active', 'Bank account pending verification'] },
  staff: { title: 'Staff Management', action: 'Invite staff', rows: ['Maya Chen - Owner: full privileges', 'Amina Otieno - Inventory: products and stock', 'Care Agent - Support: orders, chats, and returns'] },
  settings: { title: 'Settings', action: 'Update settings', rows: ['Notifications on', 'Two-step approval on', 'Low stock threshold: 12'] }
};

const subscriptionPlans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    badge: 'Bronze',
    amount: 10000,
    validity: '30 Days',
    savings: '',
    benefits: ['Unlimited Product Listings', 'Basic Analytics', 'Customer Support']
  },
  {
    id: 'half-year',
    name: 'Half-Year Plan',
    badge: 'Silver',
    amount: 55000,
    validity: '6 Months',
    savings: 'Save Ugx 5,000',
    benefits: ['Unlimited Product Listings', 'Advanced Analytics', 'Priority Support']
  },
  {
    id: 'annual',
    name: 'Annual Plan',
    badge: 'Gold',
    amount: 100000,
    validity: '12 Months',
    savings: 'Save Ugx 20,000',
    recommended: true,
    benefits: ['Premium Analytics', 'Priority Merchant Badge', 'Featured Listings Eligibility']
  }
];

const subscriptionReceivers = {
  'MTN Mobile Money': 'ERIM Subscriptions MTN - +256 780 100 100',
  'Airtel Money': 'ERIM Subscriptions Airtel - +256 750 100 100',
  'Visa/MasterCard': 'ERIM Payments Merchant Account - settlement ID ERIM-UGX-SUBS',
  'Bank Transfer': 'ERIM Marketplace Ltd - Stanbic Bank Uganda - A/C 903000118822'
};

const merchantFaqs = [
  ['How do I activate my shop?', 'Choose a subscription plan to activate the free first month, then complete store setup and review. Payments in Ugx start in month two.'],
  ['When does stock reduce?', 'Online customer orders reduce product stock only after you confirm fulfillment. POS sales reduce stock immediately because they are merchant-confirmed at checkout.'],
  ['Where do I get support?', 'Use Merchant Chat for quick messages or open the Customer-care dashboard for ticket handling and FAQs.']
];

const onboardingSteps = ['Account', 'Verify', 'Business', 'Plan', 'Payment', 'Setup', 'Product', 'Review'];

const buildFeatureState = () => Object.fromEntries(
  Object.entries(miniPages).map(([key, page]) => [
    key,
    {
      draft: '',
      rows: page.rows.map((label, index) => ({
        id: `${key}-${index}`,
        label,
        status: key === 'returns' && label.toLowerCase().includes('open') ? 'review' : 'active'
      }))
    }
  ])
);

function App() {
  const [merchantStage, setMerchantStage] = useState('landing');
  const [merchant, setMerchant] = useState(null);
  const [merchantForm, setMerchantForm] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    password: ''
  });
  const [businessForm, setBusinessForm] = useState({
    shopName: '',
    category: 'Fashion',
    description: '',
    logoName: '',
    coverName: '',
    country: 'Uganda',
    district: '',
    city: '',
    address: '',
    tin: '',
    registrationNumber: ''
  });
  const [setupForm, setSetupForm] = useState({
    logoName: '',
    coverName: '',
    themeColor: '#0f62fe',
    phone: '',
    whatsapp: '',
    email: '',
    deliveryRegions: 'Kampala, Wakiso, Mukono',
    deliveryCharges: '5000',
    pickupAvailable: 'Yes',
    mobileMoney: '',
    bankAccount: ''
  });
  const [selectedPlan, setSelectedPlan] = useState(subscriptionPlans[2]);
  const [paymentForm, setPaymentForm] = useState({ method: 'MTN Mobile Money', phone: '+256 7' });
  const [verification, setVerification] = useState({ phoneOtp: '', emailOtp: '' });
  const [passwordChange, setPasswordChange] = useState({ user: null, currentPassword: '', newPassword: '', personalEmail: '' });
  const [reviewStatus, setReviewStatus] = useState('Pending Approval');
  const [overview, setOverview] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [notice, setNotice] = useState('');
  const [rentPaid, setRentPaid] = useState(false);
  const [freeTrialActive, setFreeTrialActive] = useState(false);
  const [product, setProduct] = useState({ name: '', category: '', price: '', stock: '', image: '' });
  const [posCart, setPosCart] = useState([]);
  const [saleCustomer, setSaleCustomer] = useState('Walk-in customer');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [merchantChatThreads, setMerchantChatThreads] = useState([]);
  const [activeMerchantChatId, setActiveMerchantChatId] = useState('');
  const [selectedOrderChatId, setSelectedOrderChatId] = useState('');
  const [orderChatDraft, setOrderChatDraft] = useState('');
  const [returnPolicy, setReturnPolicy] = useState({
    windowDays: 7,
    conditions: 'Items must be unused, in original packaging, and include the ERIM order reference.',
    refundMethod: 'Mobile money refund or store credit after merchant inspection.',
    returnShipping: 'Customer pays return delivery unless the item is wrong, damaged, or not as described.',
    exclusions: 'Opened personal-care items, perishable goods, custom-made products, and clearance items.'
  });
  const [merchantFeatureState, setMerchantFeatureState] = useState(buildFeatureState);

  const loadOverview = () => {
    fetch(`${API_URL}/merchant/overview?shopId=shop-aurora`)
      .then((response) => response.json())
      .then(setOverview)
      .catch(() => setNotice('Backend is offline. Start it with npm run dev:backend.'));
  };

  const loadMerchantChats = (shopId = overview?.shop?.id || 'shop-aurora') => {
    fetch(`${API_URL}/merchant/chats?shopId=${shopId}`)
      .then((response) => response.json())
      .then((threads) => {
        setMerchantChatThreads(threads);
        if (!activeMerchantChatId && threads[0]) {
          setActiveMerchantChatId(threads[0].id);
        }
      })
      .catch(() => setNotice('Merchant chat is temporarily unavailable.'));
  };

  useEffect(loadOverview, []);

  useEffect(() => {
    if (!overview?.shop) return;

    setSetupForm((current) => ({
      ...current,
      phone: current.phone || overview.shop.contactPhone || '',
      whatsapp: current.whatsapp || overview.shop.whatsapp || '',
      email: current.email || overview.shop.email || ''
    }));
    if (overview.shop.returnPolicy) {
      setReturnPolicy((current) => ({
        ...current,
        ...overview.shop.returnPolicy
      }));
    }
  }, [overview?.shop?.id]);

  useEffect(() => {
    loadMerchantChats();
  }, []);

  useEffect(() => {
    if (!showChat) return undefined;

    loadMerchantChats();
    const timer = window.setInterval(() => loadMerchantChats(), 3000);

    return () => window.clearInterval(timer);
  }, [showChat, overview?.shop?.id, activeMerchantChatId]);

  const products = overview?.products || [];
  const orders = overview?.orders || [];
  const metrics = overview?.metrics || {};
  const lowStockProducts = useMemo(() => products.filter((item) => item.stock < 12), [products]);
  const arrangementOrders = useMemo(() => orders.filter((order) => order.status === 'awaiting_arrangement'), [orders]);
  const activeMerchantChat = merchantChatThreads.find((thread) => thread.id === activeMerchantChatId) || merchantChatThreads[0];
  const posTotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const firstBillingDate = useMemo(() => addDays(FREE_TRIAL_DAYS), []);
  const firstBillingDateLabel = formatUgDate(firstBillingDate);
  const subscriptionStateText = freeTrialActive ? 'Free first month active' : rentPaid ? 'Subscription active' : 'Subscription pending';
  const notifications = [
    ...arrangementOrders.map((order) => ({
      id: `order-note-${order.id}`,
      title: 'New storefront order',
      body: `${order.customer} wants to arrange ${order.arrangement?.method || 'delivery/pickup'} and payment terms for ${order.id}.`
    })),
    ...merchantChatThreads.slice(0, 3).map((thread) => ({
      id: `chat-note-${thread.id}`,
      title: 'Customer message',
      body: `${thread.customer} sent ${thread.messages.length} message${thread.messages.length === 1 ? '' : 's'} about ${thread.shop?.name || 'your store'}.`
    })),
    { id: 'note-1', title: subscriptionStateText, body: freeTrialActive ? `${selectedPlan.name} selected. First payment of ${ugx(selectedPlan.amount)} is due on ${firstBillingDateLabel}.` : `${selectedPlan.name} is active. Renewal date: 12 March 2027.` },
    { id: 'note-2', title: 'Inventory healthy', body: `${lowStockProducts.length} low-stock products need attention.` },
    { id: 'note-3', title: 'Payout currency', body: 'All merchant balances are settled in Ugx.' }
  ];

  const createProduct = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, shopId: overview?.shop?.id || 'shop-aurora' })
    });

    const created = await response.json();
    setNotice(`${created.name} was added with ${created.stock} units and merchant image.`);
    setProduct({ name: '', category: '', price: '', stock: '', image: '' });
    loadOverview();
  };

  const createMerchantAccount = (event) => {
    event.preventDefault();
    setMerchant({
      name: merchantForm.fullName,
      businessName: merchantForm.businessName,
      email: merchantForm.email,
      phone: merchantForm.phone,
      status: 'New Merchant'
    });
    setBusinessForm((current) => ({
      ...current,
      shopName: current.shopName || merchantForm.businessName,
      address: current.address,
    }));
    setSetupForm((current) => ({
      ...current,
      phone: merchantForm.phone,
      whatsapp: merchantForm.phone,
      email: merchantForm.email
    }));
    setMerchantStage('verify');
  };

  const loginMerchant = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: merchantForm.email, password: merchantForm.password })
    });
    const result = await response.json();

    if (!response.ok || result.user.role !== 'seller') {
      setNotice(result.message || 'Use a merchant account to access the shop dashboard.');
      return;
    }

    if (result.requiresPasswordChange) {
      setPasswordChange({ user: result.user, currentPassword: merchantForm.password, newPassword: '', personalEmail: result.user.personalEmail || result.user.email || '' });
      setNotice('Temporary password accepted. Create a permanent password and register your personal email.');
      setMerchantStage('password-change');
      return;
    }

    setMerchant({
      name: result.user.name,
      businessName: overview?.shop?.name || 'Erim Fashion Store',
      email: result.user.email,
      phone: '+256 700 000 000',
      status: 'Premium Merchant'
    });
    setSelectedPlan(subscriptionPlans[2]);
    setRentPaid(true);
    setFreeTrialActive(false);
    setMerchantStage('dashboard');
    setNotice(`Welcome back, ${result.user.name}.`);
  };

  const completeMerchantPasswordChange = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: passwordChange.user?.id,
        currentPassword: passwordChange.currentPassword,
        newPassword: passwordChange.newPassword,
        personalEmail: passwordChange.personalEmail
      })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || 'Password change failed.');
      return;
    }

    setMerchant({
      name: result.user.name,
      businessName: overview?.shop?.name || 'Erim Fashion Store',
      email: result.user.email,
      phone: '+256 700 000 000',
      status: 'Premium Merchant'
    });
    setPasswordChange({ user: null, currentPassword: '', newPassword: '', personalEmail: '' });
    setSelectedPlan(subscriptionPlans[2]);
    setRentPaid(true);
    setFreeTrialActive(false);
    setMerchantStage('dashboard');
    setNotice(result.message);
  };

  const verifyMerchant = (event) => {
    event.preventDefault();
    if (verification.phoneOtp.length < 4 || verification.emailOtp.length < 4) {
      setNotice('Enter both phone and email OTP codes to verify the merchant account.');
      return;
    }

    setMerchant((current) => ({ ...current, status: 'Verified Merchant' }));
    setNotice('Phone and email verified. Merchant account is now verified.');
    setMerchantStage('business');
  };

  const saveBusinessInfo = (event) => {
    event.preventDefault();
    setMerchantStage('plans');
  };

  const paySubscription = (event) => {
    event.preventDefault();
    setRentPaid(true);
    setFreeTrialActive(true);
    setNotice(`Free first month activated. Your first ${selectedPlan.name} payment of ${ugx(selectedPlan.amount)} is due on ${firstBillingDateLabel}.`);
    setMerchantStage('success');
  };

  const saveMerchantContact = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/shops/${overview?.shop?.id || 'shop-aurora'}/contact`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactPhone: setupForm.phone,
        whatsapp: setupForm.whatsapp,
        email: setupForm.email,
        deliveryRegions: setupForm.deliveryRegions,
        deliveryCharges: setupForm.deliveryCharges,
        pickupAvailable: setupForm.pickupAvailable,
        actor: merchant?.name || overview?.shop?.owner || 'Merchant'
      })
    });
    const updated = await response.json();

    if (!response.ok) {
      setNotice(updated.message || 'Contact details could not be saved.');
      return null;
    }

    setNotice(`Customer checkout contact updated for ${updated.name}.`);
    loadOverview();
    return updated;
  };

  const saveReturnPolicy = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/shops/${overview?.shop?.id || 'shop-aurora'}/policies`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        returnPolicy,
        actor: merchant?.name || overview?.shop?.owner || 'Merchant'
      })
    });
    const updated = await response.json();

    if (!response.ok) {
      setNotice(updated.message || 'Return policy could not be saved.');
      return;
    }

    setReturnPolicy(updated.returnPolicy);
    setNotice('Return policy is active on the storefront checkout.');
    loadOverview();
  };

  const updateFeatureDraft = (key, value) => {
    setMerchantFeatureState((current) => ({
      ...current,
      [key]: {
        ...current[key],
        draft: value
      }
    }));
  };

  const addFeatureRow = (key) => {
    const page = miniPages[key];
    const draft = merchantFeatureState[key]?.draft?.trim();
    const label = draft || `${page.action} - ${new Date().toLocaleDateString('en-UG')}`;

    setMerchantFeatureState((current) => ({
      ...current,
      [key]: {
        draft: '',
        rows: [
          { id: `${key}-${Date.now()}`, label, status: 'active' },
          ...(current[key]?.rows || [])
        ]
      }
    }));
    setNotice(`${page.title} updated and active.`);
  };

  const setFeatureStatus = (key, rowId, status) => {
    setMerchantFeatureState((current) => ({
      ...current,
      [key]: {
        ...current[key],
        rows: current[key].rows.map((row) => (row.id === rowId ? { ...row, status } : row))
      }
    }));
  };

  const removeFeatureRow = (key, rowId) => {
    setMerchantFeatureState((current) => ({
      ...current,
      [key]: {
        ...current[key],
        rows: current[key].rows.filter((row) => row.id !== rowId)
      }
    }));
    setNotice(`${miniPages[key].title} item removed.`);
  };

  const downloadFeatureCsv = (key) => {
    const page = miniPages[key];
    const rows = merchantFeatureState[key]?.rows || [];
    const csv = [
      ['Section', 'Item', 'Status'],
      ...rows.map((row) => [page.title, row.label, row.status])
    ].map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `erim-${key}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`${page.title} CSV downloaded.`);
  };

  const handleFeatureAction = (key) => {
    if (['analytics', 'traffic'].includes(key)) {
      downloadFeatureCsv(key);
      return;
    }
    if (key === 'reports') {
      addFeatureRow(key);
      setNotice('Weekly sales, inventory, rent, payment, and subscription reports generated.');
      return;
    }
    addFeatureRow(key);
  };

  const saveSetupWizard = async (event) => {
    const updated = await saveMerchantContact(event);
    if (!updated) return;
    setMerchantStage('first-product');
  };

  const publishFirstProduct = async (event) => {
    await createProduct(event);
    setReviewStatus('Pending Approval');
    setMerchantStage('review');
  };

  const approveDemoStore = () => {
    setReviewStatus('Approved');
    setMerchant((current) => ({
      ...current,
      status: selectedPlan.id === 'annual' ? 'Premium Merchant' : 'Verified Merchant'
    }));
    setMerchantStage('live');
  };

  const sendChatMessage = async (event) => {
    event.preventDefault();
    const text = chatDraft.trim();

    if (!text || !activeMerchantChat) return;

    await fetch(`${API_URL}/merchant/chats/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: activeMerchantChat.id,
        shopId: activeMerchantChat.shopId || overview?.shop?.id || 'shop-aurora',
        customer: activeMerchantChat.customer,
        sender: overview?.shop?.name || merchant?.businessName || 'Merchant',
        text
      })
    });

    setChatDraft('');
    loadMerchantChats(activeMerchantChat.shopId);
  };

  const openOrderChat = (orderId) => {
    setSelectedOrderChatId(orderId);
    setActivePage('orders');
    setShowNotifications(false);
    setShowChat(false);
    setShowStoreMenu(false);
    setShowHelpCenter(false);
  };

  const sendOrderChatMessage = async (event) => {
    event.preventDefault();
    const text = orderChatDraft.trim();

    if (!selectedOrderChatId || !text) return;

    await fetch(`${API_URL}/orders/${selectedOrderChatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: overview?.shop?.name || 'Merchant', text, status: 'arranging_terms' })
    });

    setOrderChatDraft('');
    setNotice(`Reply sent for order ${selectedOrderChatId}.`);
    loadOverview();
  };

  const logoutMerchant = (message = '') => {
    const logoutMessage = typeof message === 'string' ? message : '';
    setMerchant(null);
    setRentPaid(false);
    setFreeTrialActive(false);
    setActivePage('dashboard');
    setShowNotifications(false);
    setShowChat(false);
    setShowStoreMenu(false);
    setShowHelpCenter(false);
    setNotice(logoutMessage);
    setMerchantStage('login');
  };

  useEffect(() => {
    if (!merchant) return undefined;

    let timerId;
    const resetTimer = () => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        logoutMerchant('You were logged out after 10 minutes of inactivity.');
      }, INACTIVITY_TIMEOUT_MS);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    resetTimer();
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));

    return () => {
      window.clearTimeout(timerId);
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [merchant]);

  const renderOnboardingShell = (children, asideTitle, asideText) => (
    <div className="merchant-onboarding">
      <aside className="onboarding-aside">
        <a className="brand-logo" href="#landing" onClick={() => setMerchantStage('landing')} aria-label="ERIM merchant home">
          <img src="/erim-logo.png" alt="Erim" />
        </a>
        <div>
          <p className="eyebrow">Merchant onboarding</p>
          <h1>{asideTitle}</h1>
          <p>{asideText}</p>
        </div>
        <div className="benefit-list">
          {['Reach thousands of customers', 'Easy product management', 'Secure payments', 'Nationwide delivery support', 'Analytics and sales reports'].map((benefit) => (
            <span key={benefit}>{benefit}</span>
          ))}
        </div>
      </aside>
      <main className="onboarding-main">
        {merchantStage !== 'landing' && merchantStage !== 'login' && (
          <div className="step-track">
            {onboardingSteps.map((step) => <span key={step}>{step}</span>)}
          </div>
        )}
        {notice && <p className="notice">{notice}</p>}
        {children}
      </main>
    </div>
  );

  const renderMerchantOnboarding = () => {
    if (merchantStage === 'landing') {
      return renderOnboardingShell(
        <section className="onboarding-card landing-card">
          <h2>Start selling on ERIM</h2>
          <p>Open your merchant account, choose a plan, use your first month free, and start paying in Ugandan shillings from the second month of operation.</p>
          <div className="landing-actions">
            <button onClick={() => setMerchantStage('account')}>Start Selling on ERIM</button>
            <button className="light-button" onClick={() => setMerchantStage('login')}>I already have an account</button>
          </div>
        </section>,
        'Sell online with ERIM.',
        'A fast onboarding flow for merchants who want product management, secure payments, delivery support, and sales analytics with the first month free.'
      );
    }

    if (merchantStage === 'login') {
      return renderOnboardingShell(
        <form className="onboarding-card auth-card" onSubmit={loginMerchant}>
          <div>
            <p className="eyebrow">Merchant login</p>
            <h2>Welcome back</h2>
          </div>
          <label>Email Address<input type="email" value={merchantForm.email} onChange={(event) => setMerchantForm({ ...merchantForm, email: event.target.value })} required /></label>
          <label>Password<input type="password" value={merchantForm.password} onChange={(event) => setMerchantForm({ ...merchantForm, password: event.target.value })} required /></label>
          <button type="submit">Login to Dashboard</button>
          <button type="button" className="light-button" onClick={() => setMerchantStage('account')}>Create Merchant Account</button>
        </form>,
        'Merchant access.',
        'Sign in if you already have an ERIM merchant account.'
      );
    }

    if (merchantStage === 'password-change') {
      return renderOnboardingShell(
        <form className="onboarding-card auth-card" onSubmit={completeMerchantPasswordChange}>
          <div>
            <p className="eyebrow">First login security</p>
            <h2>Create permanent password</h2>
          </div>
          <label>Personal Email<input type="email" value={passwordChange.personalEmail} onChange={(event) => setPasswordChange({ ...passwordChange, personalEmail: event.target.value })} required /></label>
          <label>New Password<input type="password" value={passwordChange.newPassword} onChange={(event) => setPasswordChange({ ...passwordChange, newPassword: event.target.value })} required /></label>
          <button type="submit">Save Password & Continue</button>
        </form>,
        'Secure your merchant account.',
        'Admin-created merchant accounts use a temporary password only once. Set your private password and register a personal email before dashboard access.'
      );
    }

    if (merchantStage === 'account') {
      return renderOnboardingShell(
        <form className="onboarding-card auth-card" onSubmit={createMerchantAccount}>
          <div>
            <p className="eyebrow">Step 1</p>
            <h2>Create Merchant Account</h2>
          </div>
          <label>Full Name<input value={merchantForm.fullName} onChange={(event) => setMerchantForm({ ...merchantForm, fullName: event.target.value })} required /></label>
          <label>Business Name<input value={merchantForm.businessName} onChange={(event) => setMerchantForm({ ...merchantForm, businessName: event.target.value })} required /></label>
          <label>Phone Number<input value={merchantForm.phone} onChange={(event) => setMerchantForm({ ...merchantForm, phone: event.target.value })} placeholder="+256 7XX XXX XXX" required /></label>
          <label>Email Address<input type="email" value={merchantForm.email} onChange={(event) => setMerchantForm({ ...merchantForm, email: event.target.value })} required /></label>
          <label>Password<input type="password" value={merchantForm.password} onChange={(event) => setMerchantForm({ ...merchantForm, password: event.target.value })} required /></label>
          <button type="submit">Continue</button>
        </form>,
        'Create your merchant account.',
        'Your account keeps shop ownership, subscriptions, payments, and verification linked in one place.'
      );
    }

    if (merchantStage === 'verify') {
      return renderOnboardingShell(
        <form className="onboarding-card auth-card" onSubmit={verifyMerchant}>
          <div>
            <p className="eyebrow">Step 2</p>
            <h2>Verify Account</h2>
          </div>
          <div className="verification-grid">
            <label>Phone / WhatsApp OTP<input value={verification.phoneOtp} onChange={(event) => setVerification({ ...verification, phoneOtp: event.target.value })} placeholder="OTP code" required /></label>
            <label>Email OTP<input value={verification.emailOtp} onChange={(event) => setVerification({ ...verification, emailOtp: event.target.value })} placeholder="Email code" required /></label>
          </div>
          <p className="subtle">OTP sent to {merchantForm.phone || 'your phone'} and {merchantForm.email || 'your email'}.</p>
          <button type="submit">Verify Merchant</button>
        </form>,
        'Verification builds buyer trust.',
        'Phone and email verification moves the account to Verified Merchant status.'
      );
    }

    if (merchantStage === 'business') {
      return renderOnboardingShell(
        <form className="onboarding-card wide-card" onSubmit={saveBusinessInfo}>
          <div>
            <p className="eyebrow">Step 3</p>
            <h2>Business Information</h2>
          </div>
          <section className="form-grid">
            <label>Shop Name<input value={businessForm.shopName} onChange={(event) => setBusinessForm({ ...businessForm, shopName: event.target.value })} required /></label>
            <label>Business Category<input value={businessForm.category} onChange={(event) => setBusinessForm({ ...businessForm, category: event.target.value })} required /></label>
            <label>Description<textarea value={businessForm.description} onChange={(event) => setBusinessForm({ ...businessForm, description: event.target.value })} required /></label>
            <label>Logo Upload<input type="file" accept="image/*" onChange={(event) => setBusinessForm({ ...businessForm, logoName: event.target.files?.[0]?.name || '' })} /></label>
            <label>Cover Image Upload<input type="file" accept="image/*" onChange={(event) => setBusinessForm({ ...businessForm, coverName: event.target.files?.[0]?.name || '' })} /></label>
            <label>Country<input value={businessForm.country} onChange={(event) => setBusinessForm({ ...businessForm, country: event.target.value })} required /></label>
            <label>District<input value={businessForm.district} onChange={(event) => setBusinessForm({ ...businessForm, district: event.target.value })} required /></label>
            <label>City/Town<input value={businessForm.city} onChange={(event) => setBusinessForm({ ...businessForm, city: event.target.value })} required /></label>
            <label>Physical Address<input value={businessForm.address} onChange={(event) => setBusinessForm({ ...businessForm, address: event.target.value })} required /></label>
            <label>TIN<input value={businessForm.tin} onChange={(event) => setBusinessForm({ ...businessForm, tin: event.target.value })} /></label>
            <label>Business Registration Number<input value={businessForm.registrationNumber} onChange={(event) => setBusinessForm({ ...businessForm, registrationNumber: event.target.value })} /></label>
          </section>
          <button type="submit">Continue to Plans</button>
        </form>,
        'Tell customers about your shop.',
        'Business details, address, branding, and optional registration info help ERIM review and approve your store.'
      );
    }

    if (merchantStage === 'plans') {
      return renderOnboardingShell(
        <section className="onboarding-card wide-card">
          <div>
            <p className="eyebrow">Step 4</p>
            <h2>Choose Subscription Plan</h2>
            <p className="subtle">Select the plan you want after the free first month. Amount due today is {ugx(0)}.</p>
          </div>
          <div className="plan-grid">
            {subscriptionPlans.map((plan) => (
              <article className={`plan-card ${selectedPlan.id === plan.id ? 'selected' : ''}`} key={plan.id}>
                {plan.recommended && <mark>Recommended</mark>}
                <span>{plan.badge}</span>
                <h3>{plan.name}</h3>
                <strong>{ugx(plan.amount)}</strong>
                <small>Valid for {plan.validity}</small>
                {plan.savings && <small>{plan.savings}</small>}
                {plan.benefits.map((benefit) => <p key={benefit}>{benefit}</p>)}
                <button type="button" onClick={() => setSelectedPlan(plan)}>Select Plan</button>
              </article>
            ))}
          </div>
          <button onClick={() => setMerchantStage('payment')}>Continue to Free Month Activation</button>
        </section>,
        'First month free.',
        'Merchants select a plan during setup, but billing starts in the second month of operation.'
      );
    }

    if (merchantStage === 'payment') {
      return renderOnboardingShell(
        <form className="onboarding-card auth-card" onSubmit={paySubscription}>
          <div>
            <p className="eyebrow">Step 5</p>
            <h2>Free Month Activation</h2>
          </div>
          <div className="payment-summary">
            <span>Selected Plan<strong>{selectedPlan.name}</strong></span>
            <span>Amount Due Today<strong>{ugx(0)}</strong></span>
            <span>First Payment<strong>{ugx(selectedPlan.amount)} on {firstBillingDateLabel}</strong></span>
            <span>Month Two Receiving Account<strong>{subscriptionReceivers[paymentForm.method]}</strong></span>
          </div>
          <label>Payment Method
            <select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}>
              <option>MTN Mobile Money</option>
              <option>Airtel Money</option>
              <option>Visa/MasterCard</option>
              <option>Bank Transfer</option>
            </select>
          </label>
          <label>Phone Number<input value={paymentForm.phone} onChange={(event) => setPaymentForm({ ...paymentForm, phone: event.target.value })} required /></label>
          <button type="submit">Activate Free First Month</button>
        </form>,
        'No payment due today.',
        'ERIM uses Ugandan shillings as the base currency. The selected receiving account is where month-two subscription payments will be sent.'
      );
    }

    if (merchantStage === 'success') {
      return renderOnboardingShell(
        <section className="onboarding-card success-card">
          <span className="success-icon">Done</span>
          <h2>Free First Month Activated</h2>
          <div className="payment-summary">
            <span>Merchant<strong>{businessForm.shopName || merchant?.businessName || 'Dove Fashion Store'}</strong></span>
            <span>Plan<strong>{selectedPlan.name}</strong></span>
            <span>Amount Paid Today<strong>{ugx(0)}</strong></span>
            <span>First Billing Date<strong>{firstBillingDateLabel}</strong></span>
            <span>Status<strong>Free Month Active</strong></span>
          </div>
          <button onClick={() => setMerchantStage('setup')}>Setup Shop</button>
        </section>,
        'Trial active.',
        'Your shop setup is unlocked for the free first month. Paid subscription begins in the second month.'
      );
    }

    if (merchantStage === 'setup') {
      return renderOnboardingShell(
        <form className="onboarding-card wide-card" onSubmit={saveSetupWizard}>
          <div>
            <p className="eyebrow">Step 6</p>
            <h2>Store Setup Wizard</h2>
          </div>
          <section className="form-grid">
            <label>Upload Logo<input type="file" accept="image/*" onChange={(event) => setSetupForm({ ...setupForm, logoName: event.target.files?.[0]?.name || '' })} /></label>
            <label>Upload Cover Banner<input type="file" accept="image/*" onChange={(event) => setSetupForm({ ...setupForm, coverName: event.target.files?.[0]?.name || '' })} /></label>
            <label>Store Theme Color<input type="color" value={setupForm.themeColor} onChange={(event) => setSetupForm({ ...setupForm, themeColor: event.target.value })} /></label>
            <label>Phone Number<input value={setupForm.phone} onChange={(event) => setSetupForm({ ...setupForm, phone: event.target.value })} required /></label>
            <label>WhatsApp Number<input value={setupForm.whatsapp} onChange={(event) => setSetupForm({ ...setupForm, whatsapp: event.target.value })} required /></label>
            <label>Email<input type="email" value={setupForm.email} onChange={(event) => setSetupForm({ ...setupForm, email: event.target.value })} required /></label>
            <label>Delivery Regions<input value={setupForm.deliveryRegions} onChange={(event) => setSetupForm({ ...setupForm, deliveryRegions: event.target.value })} required /></label>
            <label>Delivery Charges (UGX)<input type="number" value={setupForm.deliveryCharges} onChange={(event) => setSetupForm({ ...setupForm, deliveryCharges: event.target.value })} required /></label>
            <label>Pickup Available<select value={setupForm.pickupAvailable} onChange={(event) => setSetupForm({ ...setupForm, pickupAvailable: event.target.value })}><option>Yes</option><option>No</option></select></label>
            <label>Mobile Money Number<input value={setupForm.mobileMoney} onChange={(event) => setSetupForm({ ...setupForm, mobileMoney: event.target.value })} required /></label>
            <label>Bank Account<input value={setupForm.bankAccount} onChange={(event) => setSetupForm({ ...setupForm, bankAccount: event.target.value })} /></label>
          </section>
          <button type="submit">Continue to First Product</button>
        </form>,
        'Configure store operations.',
        'Branding, contact details, delivery settings, and payment preferences prepare the shop for launch.'
      );
    }

    if (merchantStage === 'first-product') {
      return renderOnboardingShell(
        <form className="onboarding-card auth-card" onSubmit={publishFirstProduct}>
          <div>
            <p className="eyebrow">Step 7</p>
            <h2>Add First Product</h2>
          </div>
          <label>Product Name<input value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} required /></label>
          <label>Category<input value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} required /></label>
          <label>Description<textarea value={product.description || ''} onChange={(event) => setProduct({ ...product, description: event.target.value })} required /></label>
          <label>Price<input type="number" min="0" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} required /></label>
          <label>Stock Quantity<input type="number" min="1" value={product.stock} onChange={(event) => setProduct({ ...product, stock: event.target.value })} required /></label>
          <label>Product Images<input type="url" value={product.image} onChange={(event) => setProduct({ ...product, image: event.target.value })} placeholder="https://example.com/product.jpg" required /></label>
          <label>Variants<input value={product.variants || ''} onChange={(event) => setProduct({ ...product, variants: event.target.value })} placeholder="Color / Size" /></label>
          <button type="submit">Publish Product</button>
        </form>,
        'Add your first product.',
        'ERIM needs at least one product to review store information, payment verification, and product compliance.'
      );
    }

    if (merchantStage === 'review') {
      return renderOnboardingShell(
        <section className="onboarding-card success-card">
          <h2>Shop Review</h2>
          <div className="review-list">
            {['Store Information', 'Free Month Activation', 'Product Compliance'].map((item) => <span key={item}>{item}<strong>Passed demo check</strong></span>)}
          </div>
          <div className="payment-summary"><span>Status<strong>{reviewStatus}</strong></span></div>
          <button onClick={approveDemoStore}>Approve Demo Store</button>
        </section>,
        'ERIM review.',
        'The platform checks store information, free month activation, and product compliance before going live.'
      );
    }

    if (merchantStage === 'live') {
      return renderOnboardingShell(
        <section className="onboarding-card success-card">
          <span className="success-icon">Live</span>
          <h2>Congratulations!</h2>
          <p>Your store is now live on ERIM.</p>
          <div className="dashboard-access">
            {['Orders', 'Products', 'Customers', 'Analytics', 'Promotions', 'Subscription Management'].map((item) => <span key={item}>{item}</span>)}
          </div>
          <button onClick={() => setMerchantStage('dashboard')}>Go to Dashboard</button>
        </section>,
        'Shop goes live.',
        'You now have dashboard access for orders, products, customers, analytics, promotions, and subscription management.'
      );
    }

    return null;
  };

  const updateOrder = async (orderId, status) => {
    await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setNotice(`Order ${orderId} moved to ${status}.`);
    loadOverview();
  };

  const payRent = () => {
    setRentPaid(true);
    setFreeTrialActive(false);
    setNotice(`Merchant subscription paid in Ugandan shillings. ${selectedPlan.name} is active.`);
    setActivePage('dashboard');
  };

  const activateFreeMonthFromRent = () => {
    setRentPaid(true);
    setFreeTrialActive(true);
    setNotice(`Free first month activated. Your first ${selectedPlan.name} payment of ${ugx(selectedPlan.amount)} is due on ${firstBillingDateLabel}.`);
    setActivePage('dashboard');
  };

  const addToPos = (item) => {
    setPosCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return current.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const completePosSale = async () => {
    if (!posCart.length) return;

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: saleCustomer || 'Walk-in customer',
        shopId: overview.shop.id,
        total: posTotal,
        status: 'fulfilled',
        lineItems: posCart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      })
    });
    const created = await response.json();
    setNotice(`POS sale ${created.id} completed for ${money(posTotal)}.`);
    setPosCart([]);
    setSaleCustomer('Walk-in customer');
    loadOverview();
  };

  const renderDashboard = () => (
    <>
      <section className="metric-grid">
        <article><span className="metric-icon blue">Bag</span><span>Total Sales</span><strong>{money(metrics.revenue || 0)}</strong><small>Up 18.6% vs last week</small></article>
        <article><span className="metric-icon green">Ord</span><span>Orders</span><strong>{metrics.orders || 0}</strong><small>Up 12.4% vs last week</small></article>
        <article><span className="metric-icon violet">Vis</span><span>Visitors</span><strong>12,842</strong><small>Up 8.7% vs last week</small></article>
        <article><span className="metric-icon orange">Cr</span><span>Conversion Rate</span><strong>3.34%</strong><small>Up 2.1% vs last week</small></article>
        <article><span className="metric-icon blue">AOV</span><span>Average Order Value</span><strong>{money(metrics.orders ? metrics.revenue / metrics.orders : 0)}</strong><small>Up 6.3% vs last week</small></article>
      </section>

      <section className="subscription-reminder">
        <div>
          <span>Current Plan: {rentPaid ? selectedPlan.name.replace('Plan', 'Merchant') : 'Not active'}</span>
          <strong>{freeTrialActive ? `${FREE_TRIAL_DAYS} free days remaining` : rentPaid ? 'Days Remaining: 284' : 'Choose a plan to unlock setup'}</strong>
          <small>{freeTrialActive ? `First billing date: ${firstBillingDateLabel}` : rentPaid ? 'Renewal Date: 12 March 2027' : 'First month is free. Payments start in month two.'}</small>
        </div>
        <button onClick={() => setActivePage('rent')}>{rentPaid ? 'Manage Subscription' : 'Activate Plan'}</button>
        <button className="light-button" onClick={() => setMerchantStage('plans')}>Upgrade Plan</button>
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-head"><h2>Sales Overview</h2><button className="light-button">Daily</button></div>
          <div className="line-chart">
            <svg viewBox="0 0 700 260" role="img" aria-label="Sales overview line chart">
              <line x1="40" y1="42" x2="675" y2="42" />
              <line x1="40" y1="100" x2="675" y2="100" />
              <line x1="40" y1="160" x2="675" y2="160" />
              <line x1="40" y1="220" x2="675" y2="220" />
              <polyline className="last-week" points="40,170 150,128 260,154 370,145 480,166 590,134 675,142" />
              <polyline className="this-week" points="40,112 150,86 260,104 370,78 480,118 590,96 675,54" />
              {['$6K', '$4K', '$2K', '$0'].map((label, index) => <text key={label} x="0" y={48 + index * 58}>{label}</text>)}
            </svg>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head"><h2>Recent Orders</h2><button className="link-button" onClick={() => setActivePage('orders')}>View all</button></div>
          <div className="order-list">
            {orders.slice(0, 5).map((order) => (
              <div className="order-card" key={order.id}>
                <span className="thumb">Img</span>
                <div><strong>{order.id}</strong><small>{new Date(order.createdAt).toLocaleDateString()}</small></div>
                <span>{order.customer}</span>
                <strong>{money(order.total)}</strong>
                <mark className={order.status}>{order.status}</mark>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel">
          <div className="panel-head"><h2>Top Selling Products</h2><button className="link-button" onClick={() => setActivePage('products')}>View all</button></div>
          <div className="product-list compact">
            {products.slice(0, 5).map((item, index) => (
              <div className="product-row" key={item.id}>
                <img src={item.image} alt={item.name} />
                <span>{item.name}</span>
                <strong>{324 - index * 42}</strong>
                <span>{money(item.price * (20 + index * 8))}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel channel-panel">
          <div className="panel-head"><h2>Sales by Channel</h2><button className="link-button">View report</button></div>
          <div className="donut"><span>{money(metrics.revenue || 0)}<small>Total Sales</small></span></div>
          <div className="channel-list">
            <span><i className="blue-dot" />Website <strong>60%</strong></span>
            <span><i className="orange-dot" />Mobile App <strong>25%</strong></span>
            <span><i className="green-dot" />Marketplace <strong>10%</strong></span>
            <span><i className="violet-dot" />Others <strong>5%</strong></span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head"><h2>Store Performance</h2><button className="link-button">View report</button></div>
          {[
            ['On-time Delivery', '96.4%', 'green'],
            ['Order Fulfillment Rate', '94.1%', 'green'],
            ['Return Rate', '2.35%', 'orange'],
            ['Customer Satisfaction', '4.7 / 5', 'blue']
          ].map(([label, value, tone]) => (
            <div className="progress-row" key={label}>
              <span>{label}<strong>{value}</strong></span>
              <i className={tone} />
            </div>
          ))}
        </article>
      </section>

      <section className="rent-alert">
        <span>{freeTrialActive ? `Free first month active on ${selectedPlan.name}. First payment of ${ugx(selectedPlan.amount)} is due on ${firstBillingDateLabel}.` : rentPaid ? `Current Plan: ${selectedPlan.name}. Subscription active for ${selectedPlan.validity}.` : 'No subscription payment is due today. Choose a plan to activate your free first month.'}</span>
        <button onClick={() => setActivePage('rent')}>{rentPaid ? 'Manage Subscription' : 'Activate Free Month'}</button>
      </section>
    </>
  );

  const renderProducts = () => (
    <section className="split-grid">
      <form className="panel product-form" onSubmit={createProduct}>
        <h2>Add product</h2>
        {!rentPaid && <p className="warning">Choose a merchant plan to activate the free first month before publishing products.</p>}
        <label>Name<input value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} required /></label>
        <label>Category<input value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} required /></label>
        <label>Price in UGX<input type="number" min="0" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} required /></label>
        <label>Quantity<input type="number" min="1" value={product.stock} onChange={(event) => setProduct({ ...product, stock: event.target.value })} required /></label>
        <label>Product image URL<input type="url" value={product.image} onChange={(event) => setProduct({ ...product, image: event.target.value })} placeholder="https://example.com/product.jpg" required /></label>
        {product.image && <div className="image-preview"><img src={product.image} alt="Product preview" /><span>Image preview</span></div>}
        <button type="submit" disabled={!rentPaid}>Publish product</button>
      </form>

      <section className="panel">
        <div className="panel-head"><h2>Inventory</h2><span>{products.length} products</span></div>
        <div className="product-list">
          {products.map((item) => (
            <div className="product-row" key={item.id}>
              <img src={item.image} alt={item.name} />
              <span>{item.name}<small>{item.category}</small></span>
              <strong>{item.stock} units</strong>
              <span>{money(item.price)}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );

  const renderOrders = () => (
    <section className="orders-workspace">
      <div className="panel">
        <div className="panel-head"><h2>Orders</h2><span>{orders.length} open records</span></div>
        <div className="table">
          <div className="table-head"><span>Order</span><span>Customer</span><span>Total</span><span>Status</span><span>Action</span></div>
          {orders.map((order) => (
            <div className="table-row" key={order.id}>
              <span>{order.id}<small>{order.lineItems?.map((line) => `${line.name} x ${line.quantity}`).join(', ') || `${order.items} item(s)`}</small></span>
              <span>{order.customer}<small>{order.arrangement?.method ? `${order.arrangement.method}: ${order.arrangement.contact}` : 'POS or legacy order'}</small></span>
              <span>{money(order.total)}</span>
              <mark className={order.status}>{order.status.replace('_', ' ')}</mark>
              <span className="order-actions">
                <button onClick={() => openOrderChat(order.id)}>Chat</button>
                <button onClick={() => updateOrder(order.id, 'fulfilled')} disabled={order.status === 'fulfilled'}>{order.status === 'fulfilled' ? 'Fulfilled' : 'Fulfill'}</button>
              </span>
            </div>
          ))}
        </div>
      </div>
      <aside className="panel order-chat-panel">
        <h2>Customer Order Chat</h2>
        {selectedOrderChatId ? (() => {
          const order = orders.find((item) => item.id === selectedOrderChatId);
          if (!order) return <p>Select an order to chat.</p>;
          return (
            <>
              <div className="arrangement-card">
                <strong>{order.customer}</strong>
                <span>{order.id} - {money(order.total)}</span>
                <p>{order.arrangement?.details || 'No arrangement note yet.'}</p>
                <small>{order.arrangement?.method || 'Arrange pickup/delivery'} - {order.arrangement?.contact || 'No contact provided'}</small>
              </div>
              <div className="order-chat-thread">
                {(order.messages || []).map((message) => (
                  <article className={message.sender === (overview?.shop?.name || 'Merchant') ? 'mine' : ''} key={message.id}>
                    <strong>{message.sender}</strong>
                    <span>{message.text}</span>
                  </article>
                ))}
              </div>
              <form className="chat-compose" onSubmit={sendOrderChatMessage}>
                <input value={orderChatDraft} onChange={(event) => setOrderChatDraft(event.target.value)} placeholder="Reply about pickup, delivery, or payment terms" />
                <button type="submit">Send</button>
              </form>
            </>
          );
        })() : <p>Select an order and open chat to discuss pickup, delivery, and payment terms.</p>}
      </aside>
    </section>
  );

  const renderPos = () => (
    <section className="pos-grid">
      <div className="panel">
        <div className="panel-head"><h2>Point of Sale</h2><span>Walk-in checkout</span></div>
        <label>Customer<input value={saleCustomer} onChange={(event) => setSaleCustomer(event.target.value)} /></label>
        <div className="pos-products">
          {products.map((item) => (
            <button className="pos-product" key={item.id} onClick={() => addToPos(item)}>
              <img src={item.image} alt={item.name} />
              <span>{item.name}</span>
              <strong>{money(item.price)}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="panel receipt">
        <h2>Receipt</h2>
        {posCart.length ? posCart.map((item) => (
          <div className="receipt-row" key={item.id}>
            <span>{item.name} x {item.quantity}</span>
            <strong>{money(item.price * item.quantity)}</strong>
          </div>
        )) : <p>No items added.</p>}
        <div className="receipt-total"><span>Total</span><strong>{money(posTotal)}</strong></div>
        <button onClick={completePosSale} disabled={!posCart.length}>Complete Sale</button>
        <button className="light-button" onClick={() => setPosCart([])}>Clear</button>
      </div>
    </section>
  );

  const renderRent = () => (
    <section className="rent-page">
      <article className="panel rent-card">
        <span className="metric-icon orange">Plan</span>
        <h2>Merchant subscription</h2>
        <p>Merchant accounts are free for the first month. Choose a plan now; payments in Ugandan shillings start from the second month of operation.</p>
        <div className="rent-plan-grid">
          {subscriptionPlans.map((plan) => (
            <button
              className={`rent-plan-option ${selectedPlan.id === plan.id ? 'selected' : ''}`}
              key={plan.id}
              onClick={() => {
                setSelectedPlan(plan);
                if (!freeTrialActive) setRentPaid(false);
              }}
              type="button"
            >
              <span>{plan.name}</span>
              <strong>{ugx(plan.amount)}</strong>
              <small>{plan.validity} after free month{plan.recommended ? ' - Recommended' : ''}</small>
            </button>
          ))}
        </div>
        <div className="rent-total">{freeTrialActive ? ugx(selectedPlan.amount) : ugx(0)}</div>
        <p className="subtle">{freeTrialActive ? `No payment due today. First billing: ${ugx(selectedPlan.amount)} on ${firstBillingDateLabel}.` : `Use Activate Free Month for new shops, or pay ${ugx(selectedPlan.amount)} when month two begins.`}</p>
        <button onClick={freeTrialActive ? payRent : activateFreeMonthFromRent} disabled={rentPaid && !freeTrialActive}>{freeTrialActive ? 'Pay Month Two Subscription' : rentPaid ? 'Subscription Active' : 'Activate Free First Month'}</button>
      </article>
      <article className="panel">
        <h2>ERIM receiving accounts</h2>
        <div className="settings-list">
          {Object.entries(subscriptionReceivers).map(([method, account]) => (
            <div className="settings-row" key={method}>
              <span><strong>{method}</strong><small>{account}</small></span>
              <button className="light-button" onClick={() => setPaymentForm({ ...paymentForm, method })}>Use</button>
            </div>
          ))}
        </div>
      </article>
      <article className="panel">
        <h2>Setup checklist</h2>
        {['Activate free first month', 'Complete KYC', 'Add products with quantity and image', 'Configure shipping', 'Connect payout wallet'].map((item, index) => (
          <div className="check-row" key={item}><span>{index === 0 && rentPaid ? 'Done' : 'Step'}</span>{item}</div>
        ))}
      </article>
    </section>
  );

  const renderStoreProfile = () => (
    <section className="split-grid">
      <form className="panel" onSubmit={saveMerchantContact}>
        <div className="panel-head"><h2>Store Contact Details</h2><button type="submit">Save contacts</button></div>
        <label>Customer Phone Number<input value={setupForm.phone} onChange={(event) => setSetupForm({ ...setupForm, phone: event.target.value })} placeholder="+256 7XX XXX XXX" required /></label>
        <label>WhatsApp Number<input value={setupForm.whatsapp} onChange={(event) => setSetupForm({ ...setupForm, whatsapp: event.target.value })} placeholder="+256 7XX XXX XXX" required /></label>
        <label>Email<input type="email" value={setupForm.email} onChange={(event) => setSetupForm({ ...setupForm, email: event.target.value })} required /></label>
        <label>Delivery Regions<input value={setupForm.deliveryRegions} onChange={(event) => setSetupForm({ ...setupForm, deliveryRegions: event.target.value })} /></label>
        <label>Delivery Charges (UGX)<input type="number" value={setupForm.deliveryCharges} onChange={(event) => setSetupForm({ ...setupForm, deliveryCharges: event.target.value })} /></label>
        <label>Pickup Available<select value={setupForm.pickupAvailable} onChange={(event) => setSetupForm({ ...setupForm, pickupAvailable: event.target.value })}><option>Yes</option><option>No</option></select></label>
      </form>
      <article className="panel">
        <h2>Checkout Preview</h2>
        <div className="settings-list">
          <div className="settings-row"><span><strong>Merchant phone</strong><small>{setupForm.phone || overview?.shop?.contactPhone || 'Not set'}</small></span></div>
          <div className="settings-row"><span><strong>WhatsApp</strong><small>{setupForm.whatsapp || overview?.shop?.whatsapp || 'Not set'}</small></span></div>
          <div className="settings-row"><span><strong>Customer email</strong><small>{setupForm.email || overview?.shop?.email || 'Not set'}</small></span></div>
          <div className="settings-row"><span><strong>Visible at checkout</strong><small>Customers can open ERIM chat or WhatsApp from the checkout zone.</small></span></div>
        </div>
      </article>
    </section>
  );

  const renderReturns = () => (
    <section className="split-grid">
      <form className="panel policy-form" onSubmit={saveReturnPolicy}>
        <div className="panel-head"><h2>Return Policy</h2><button type="submit">Publish policy</button></div>
        <label>Return Window (days)<input type="number" min="1" value={returnPolicy.windowDays} onChange={(event) => setReturnPolicy({ ...returnPolicy, windowDays: event.target.value })} required /></label>
        <label>Return Conditions<textarea value={returnPolicy.conditions} onChange={(event) => setReturnPolicy({ ...returnPolicy, conditions: event.target.value })} required /></label>
        <label>Refund Method<input value={returnPolicy.refundMethod} onChange={(event) => setReturnPolicy({ ...returnPolicy, refundMethod: event.target.value })} required /></label>
        <label>Return Delivery Responsibility<textarea value={returnPolicy.returnShipping} onChange={(event) => setReturnPolicy({ ...returnPolicy, returnShipping: event.target.value })} required /></label>
        <label>Excluded Items<textarea value={returnPolicy.exclusions} onChange={(event) => setReturnPolicy({ ...returnPolicy, exclusions: event.target.value })} /></label>
      </form>
      <article className="panel policy-preview">
        <div className="panel-head"><h2>Storefront Preview</h2><span>Visible at checkout</span></div>
        <div className="policy-card">
          <span>{returnPolicy.windowDays || 7}-day return window</span>
          <strong>{returnPolicy.conditions}</strong>
          <p>{returnPolicy.refundMethod}</p>
          <small>{returnPolicy.returnShipping}</small>
        </div>
        <div className="settings-list">
          {(merchantFeatureState.returns?.rows || []).map((row) => (
            <div className="settings-row feature-row" key={row.id}>
              <span><strong>{row.label}</strong><small>Status: {row.status}</small></span>
              <div className="feature-actions">
                <button className="light-button" type="button" onClick={() => setFeatureStatus('returns', row.id, 'approved')}>Approve</button>
                <button className="light-button" type="button" onClick={() => setFeatureStatus('returns', row.id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );

  const renderMiniPage = (key) => {
    const page = miniPages[key];
    const pageState = merchantFeatureState[key] || { rows: [], draft: '' };
    return (
      <section className="panel page-card">
        <div className="panel-head"><h2>{page.title}</h2><button type="button" onClick={() => handleFeatureAction(key)}>{page.action}</button></div>
        <div className="feature-form">
          <input value={pageState.draft} onChange={(event) => updateFeatureDraft(key, event.target.value)} placeholder={`Add ${page.title.toLowerCase()} item`} />
          <button type="button" onClick={() => addFeatureRow(key)}>Add</button>
        </div>
        <div className="settings-list">
          {pageState.rows.map((row) => (
            <div className="settings-row feature-row" key={row.id}>
              <span><strong>{row.label}</strong><small>Status: {row.status}</small></span>
              <div className="feature-actions">
                <button className="light-button" type="button" onClick={() => setFeatureStatus(key, row.id, row.status === 'active' ? 'paused' : 'active')}>{row.status === 'active' ? 'Pause' : 'Activate'}</button>
                <button className="light-button" type="button" onClick={() => setFeatureStatus(key, row.id, 'completed')}>Complete</button>
                <button className="light-button danger-light" type="button" onClick={() => removeFeatureRow(key, row.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const content = {
    dashboard: renderDashboard,
    products: renderProducts,
    orders: renderOrders,
    returns: renderReturns,
    pos: renderPos,
    rent: renderRent,
    profile: renderStoreProfile,
    settings: renderStoreProfile
  }[activePage] || (() => renderMiniPage(activePage));

  if (merchantStage !== 'dashboard') {
    return renderMerchantOnboarding();
  }

  return (
    <div className="merchant-shell">
      <aside className="merchant-sidebar">
        <a className="brand-logo" href="#dashboard" aria-label="Erim merchant dashboard" onClick={() => setActivePage('dashboard')}>
          <img src="/erim-logo.png" alt="Erim" />
        </a>
        <button className="store-switcher" onClick={() => setActivePage('profile')}>
          <span className="store-badge">Bag</span>
          <span><strong>{overview?.shop?.name || 'Erim Fashion Store'}</strong><small>{subscriptionStateText}</small></span>
        </button>
        <nav>
          {navGroups.map((group) => (
            <div key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([key, label]) => (
                <button key={key} className={activePage === key ? 'active' : ''} onClick={() => setActivePage(key)}>
                  <span>{label.slice(0, 2)}</span>{label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button
          className="help-card"
          onClick={() => {
            setShowHelpCenter((current) => !current);
            setShowNotifications(false);
            setShowChat(false);
            setShowStoreMenu(false);
          }}
          type="button"
        >
          <strong>Need Help?</strong><span>Visit Help Center</span>
        </button>
      </aside>

      <main className="merchant-main">
        <header className="merchant-topbar">
          <label className="search-field"><span>Search</span><input placeholder="Search anything..." /></label>
          <div className="topbar-actions">
            <button
              className={showNotifications ? 'active-tool' : ''}
              aria-label="Notifications"
              title="Notifications"
              onClick={() => {
                setShowNotifications((current) => !current);
                setShowChat(false);
                setShowStoreMenu(false);
                setShowHelpCenter(false);
              }}
            >
              <span aria-hidden="true">🔔</span><span className="badge-count">{notifications.length}</span>
            </button>
            <button
              className={showChat ? 'active-tool' : ''}
              onClick={() => {
                setShowChat((current) => !current);
                setShowNotifications(false);
                setShowStoreMenu(false);
                setShowHelpCenter(false);
              }}
            >
              Chat
            </button>
            <button
              className={`profile-button ${showStoreMenu ? 'active-tool' : ''}`}
              onClick={() => {
                setShowStoreMenu((current) => !current);
                setShowNotifications(false);
                setShowChat(false);
                setShowHelpCenter(false);
              }}
            >
              {overview?.shop?.name || merchant?.businessName || 'Erim Fashion Store'}
            </button>
            <button className="danger-button" onClick={logoutMerchant}>Logout</button>
          </div>
        </header>

        {showNotifications && (
          <section className="header-panel notifications-panel">
            <div className="panel-head">
              <h2>Notifications</h2>
              <button className="link-button" onClick={() => setShowNotifications(false)}>Close</button>
            </div>
            {notifications.map((item) => (
              <article className="notification-item" key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
                {item.id.startsWith('order-note-') && <button className="link-button" onClick={() => openOrderChat(item.id.replace('order-note-', ''))}>Open order chat</button>}
                {item.id.startsWith('chat-note-') && (
                  <button
                    className="link-button"
                    onClick={() => {
                      setActiveMerchantChatId(item.id.replace('chat-note-', ''));
                      setShowChat(true);
                      setShowNotifications(false);
                    }}
                  >
                    Open customer chat
                  </button>
                )}
              </article>
            ))}
          </section>
        )}

        {showChat && (
          <section className="header-panel chat-panel">
            <div className="panel-head">
              <h2>Merchant Chat</h2>
              <button className="link-button" onClick={() => setShowChat(false)}>Close</button>
            </div>
            <div className="merchant-chat-layout">
              <div className="chat-thread-list">
                {merchantChatThreads.length ? merchantChatThreads.map((thread) => (
                  <button
                    className={thread.id === activeMerchantChat?.id ? 'selected' : ''}
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveMerchantChatId(thread.id)}
                  >
                    <strong>{thread.customer}</strong>
                    <span>{thread.messages.at(-1)?.text || 'No messages yet'}</span>
                  </button>
                )) : (
                  <div className="chat-empty">
                    <strong>No customer chats yet</strong>
                    <span>Customer storefront messages will appear here in real time.</span>
                  </div>
                )}
              </div>
              <div className="chat-thread">
                {activeMerchantChat?.messages?.length ? activeMerchantChat.messages.map((message) => (
                  <article className={`chat-message ${message.sender === (overview?.shop?.name || merchant?.businessName || 'Merchant') ? 'mine' : ''}`} key={message.id}>
                    <strong>{message.sender}</strong>
                    <span>{message.text}</span>
                  </article>
                )) : (
                  <div className="chat-empty">
                    <strong>Select a customer</strong>
                    <span>Reply to questions about pickup, delivery, availability, and payment terms.</span>
                  </div>
                )}
              </div>
            </div>
            <form className="chat-compose" onSubmit={sendChatMessage}>
              <input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Reply to customer..." disabled={!activeMerchantChat} />
              <button type="submit" disabled={!activeMerchantChat}>Send</button>
            </form>
          </section>
        )}

        {showStoreMenu && (
          <section className="header-panel store-menu-panel">
            <div className="store-menu-head">
              <span className="store-badge">Bag</span>
              <div>
                <strong>{overview?.shop?.name || merchant?.businessName || 'Erim Fashion Store'}</strong>
                <small>{merchant?.status || subscriptionStateText}</small>
              </div>
            </div>
            <button onClick={() => { setActivePage('profile'); setShowStoreMenu(false); }}>Store Profile</button>
            <button onClick={() => { setActivePage('rent'); setShowStoreMenu(false); }}>Subscription Management</button>
            <button onClick={() => { setActivePage('settings'); setShowStoreMenu(false); }}>Settings</button>
            <button className="danger-button" onClick={logoutMerchant}>Logout</button>
          </section>
        )}

        {showHelpCenter && (
          <section className="header-panel help-panel">
            <div className="panel-head">
              <h2>Merchant Help Center</h2>
              <button className="link-button" onClick={() => setShowHelpCenter(false)}>Close</button>
            </div>
            <div className="faq-list">
              {merchantFaqs.map(([question, answer]) => (
                <article className="faq-item" key={question}>
                  <strong>{question}</strong>
                  <span>{answer}</span>
                </article>
              ))}
            </div>
            <div className="care-actions">
              <a href="http://localhost:3003" target="_blank" rel="noreferrer">Open Customer-care Dashboard</a>
              <button onClick={() => { setShowChat(true); setShowHelpCenter(false); }}>Chat with ERIM Care</button>
            </div>
          </section>
        )}

        <section className="welcome-row">
          <div>
            <h1>Welcome back, Erim!</h1>
            <p>Here's what's happening with your store today.</p>
          </div>
          <button className="date-button">May 12 - May 18, 2024</button>
        </section>

        {notice && <p className="notice">{notice}</p>}
        {content()}
      </main>

      <button className="floating-add" onClick={() => setActivePage('products')}>+</button>
    </div>
  );
}

export default App;
