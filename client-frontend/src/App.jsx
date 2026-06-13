import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const currencies = [
  { code: 'UGX', label: 'Ugx', rate: 1, locale: 'en-UG' },
  { code: 'USD', label: 'USD', rate: 1 / 3800, locale: 'en-US' },
  { code: 'KES', label: 'Kshs', rate: 130 / 3800, locale: 'en-KE' },
  { code: 'TZS', label: 'Tshs', rate: 2600 / 3800, locale: 'en-TZ' },
  { code: 'EUR', label: 'Euro', rate: 0.92 / 3800, locale: 'de-DE' },
  { code: 'FRw', label: 'FRw', rate: 1300 / 3800, locale: 'rw-RW' },
  { code: 'CDF', label: 'DRC Francs', rate: 2850 / 3800, locale: 'fr-CD' },
  { code: 'SSP', label: 'South Sudan Pounds', rate: 1100 / 3800, locale: 'en-SS' }
];

const currency = (value, selectedCurrency) => {
  const converted = value * selectedCurrency.rate;

  if (selectedCurrency.code === 'UGX') {
    return `Ugx ${Math.round(converted).toLocaleString('en-UG')}`;
  }

  return new Intl.NumberFormat(selectedCurrency.locale, {
    style: 'currency',
    currency: selectedCurrency.code,
    maximumFractionDigits: selectedCurrency.code === 'EUR' || selectedCurrency.code === 'USD' ? 2 : 0
  }).format(converted);
};

const getCategoryProducts = (products, category, categoryTree = []) => {
  if (category === 'All') return products;
  const group = categoryTree.find((item) => item.name === category);
  const acceptedCategories = group ? [group.name, ...group.subcategories] : [category];
  return products.filter((product) => acceptedCategories.includes(product.category));
};

const roleDestinations = {
  customer: { label: 'Customer storefront', href: '#top' },
  seller: { label: 'Seller dashboard', href: 'http://localhost:3001' },
  admin: { label: 'Admin panel', href: 'http://localhost:3002' },
  care: { label: 'Care console', href: 'http://localhost:3003' }
};

function App() {
  const [catalog, setCatalog] = useState({ shops: [], products: [], categories: [], categoryTree: [] });
  const [view, setView] = useState('storefront');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: 'customer@erim.test', password: 'pass123', role: 'customer' });
  const [kycForm, setKycForm] = useState({
    accountType: 'customer',
    legalName: '',
    country: 'Uganda',
    documentType: 'National ID',
    documentNumber: '',
    businessName: '',
    taxId: '',
    documentFrontName: '',
    documentBackName: '',
    consent: false
  });
  const [kycStatus, setKycStatus] = useState({ status: 'not_started', submission: null });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('erimUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [currencyCode, setCurrencyCode] = useState('UGX');
  const [cart, setCart] = useState([]);
  const [notice, setNotice] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [pendingAuthUser, setPendingAuthUser] = useState(null);
  const [passwordChange, setPasswordChange] = useState({ user: null, currentPassword: '', newPassword: '', personalEmail: '' });
  const [kycNotice, setKycNotice] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [arrangementMode, setArrangementMode] = useState('Delivery');
  const [arrangementContact, setArrangementContact] = useState('+256 700 123 456');
  const [merchantMessage, setMerchantMessage] = useState('Hi, I would like to arrange delivery details and agree on payment terms before fulfillment.');
  const [lastOrder, setLastOrder] = useState(null);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [showMerchantMessenger, setShowMerchantMessenger] = useState(false);
  const [showCareMessenger, setShowCareMessenger] = useState(false);
  const [merchantChats, setMerchantChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState('');
  const [merchantChatDraft, setMerchantChatDraft] = useState('');
  const [careTicketId, setCareTicketId] = useState('');
  const [careChatDraft, setCareChatDraft] = useState('');
  const [careMessages, setCareMessages] = useState([
    { id: 'care-welcome', sender: 'ERIM Care', text: 'Hi, welcome to ERIM support. How can we help today?' }
  ]);

  const selectedCurrency = useMemo(() => {
    return currencies.find((item) => item.code === currencyCode) || currencies[0];
  }, [currencyCode]);

  useEffect(() => {
    fetch(`${API_URL}/catalog`)
      .then((response) => response.json())
      .then(setCatalog)
      .catch(() => setNotice('Backend is offline. Start it with npm run dev:backend.'));
  }, []);

  useEffect(() => {
    if (!user) {
      setKycStatus({ status: 'not_started', submission: null });
      return;
    }

    const token = localStorage.getItem('erimToken');

    fetch(`${API_URL}/kyc/status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then(setKycStatus)
      .catch(() => setKycStatus({ status: 'not_started', submission: null }));
  }, [user]);

  const searchedProducts = useMemo(() => {
    return catalog.products
      .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
  }, [catalog.products, query]);

  const categorySummaries = useMemo(() => {
    const summaries = catalog.categories.map((item) => {
      const categoryProducts = getCategoryProducts(catalog.products, item, catalog.categoryTree);
      const fromPrice = categoryProducts.length
        ? Math.min(...categoryProducts.map((product) => product.price))
        : 0;

      return {
        name: item,
        count: categoryProducts.length,
        fromPrice,
        image: categoryProducts[0]?.image
      };
    });

    return [
      {
        name: 'All',
        count: catalog.products.length,
        fromPrice: catalog.products.length ? Math.min(...catalog.products.map((product) => product.price)) : 0,
        image: catalog.products[0]?.image
      },
      ...summaries
    ];
  }, [catalog.categories, catalog.products, catalog.categoryTree]);

  const displayedProducts = useMemo(() => {
    return getCategoryProducts(searchedProducts, category, catalog.categoryTree);
  }, [searchedProducts, category, catalog.categoryTree]);

  const groupedProducts = useMemo(() => {
    const activeCategories = category === 'All' ? catalog.categories : [category];

    return activeCategories
      .map((item) => ({
        name: item,
        products: getCategoryProducts(searchedProducts, item, catalog.categoryTree)
      }))
      .filter((group) => group.products.length);
  }, [catalog.categories, catalog.categoryTree, searchedProducts, category]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryOptions = [
    { id: 'standard', label: 'Standard Delivery', eta: '3 - 4 working days', fee: 5000 },
    { id: 'express', label: 'Express Delivery', eta: '1 - 2 working days', fee: 15000 },
    { id: 'pickup', label: 'Pick Up Station', eta: 'Nearest ERIM pick up station', fee: 0 }
  ];
  const selectedDelivery = deliveryOptions.find((item) => item.id === deliveryMethod) || deliveryOptions[0];
  const cartTotal = cartSubtotal + selectedDelivery.fee;
  const selectedChatShopId = cart[0]?.product.shopId || catalog.shops[0]?.id || 'shop-aurora';
  const selectedChatShop = catalog.shops.find((shop) => shop.id === selectedChatShopId) || catalog.shops[0];
  const activeMerchantChat = merchantChats.find((chat) => chat.id === activeChatId) || merchantChats[0];

  const loadMerchantChats = (shopId = selectedChatShopId) => {
    fetch(`${API_URL}/merchant/chats?shopId=${shopId}`)
      .then((response) => response.json())
      .then((chats) => {
        setMerchantChats(chats);
        if (!activeChatId && chats[0]) {
          setActiveChatId(chats[0].id);
        }
      })
      .catch(() => setNotice('Merchant chat is temporarily unavailable.'));
  };

  useEffect(() => {
    if (!showMerchantMessenger) return undefined;

    loadMerchantChats(selectedChatShopId);
    const timer = window.setInterval(() => loadMerchantChats(selectedChatShopId), 3000);

    return () => window.clearInterval(timer);
  }, [showMerchantMessenger, selectedChatShopId]);

  const loadCareTicket = (ticketId = careTicketId) => {
    if (!ticketId) return;

    fetch(`${API_URL}/customer-care/overview`)
      .then((response) => response.json())
      .then((data) => {
        const ticket = data.tickets?.find((item) => item.id === ticketId);
        if (!ticket) return;

        setCareMessages([
          { id: `${ticket.id}-issue`, sender: ticket.customer, text: ticket.issue },
          ...(ticket.replies || []).map((reply) => ({
            id: reply.id,
            sender: reply.agent,
            text: reply.message
          }))
        ]);
      })
      .catch(() => setNotice('Customer-care chat is temporarily unavailable.'));
  };

  useEffect(() => {
    if (!showCareMessenger || !careTicketId) return undefined;

    loadCareTicket(careTicketId);
    const timer = window.setInterval(() => loadCareTicket(careTicketId), 3000);

    return () => window.clearInterval(timer);
  }, [showCareMessenger, careTicketId]);

  const addToCart = (product) => {
    if (!user) {
      setAuthMode('login');
      setAuthNotice('Please sign in or create an account before adding items to your cart.');
      setNotice('Sign in or create an Erim account to add products to cart.');
      setView('auth');
      return;
    }

    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
      }
      return [...items, { product, quantity: 1 }];
    });
    setNotice(`${product.name} added to cart.`);
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart((items) => items
      .map((item) => item.product.id === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) } : item)
      .filter((item) => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart((items) => items.filter((item) => item.product.id !== productId));
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthNotice('');
    setView('auth');
  };

  const openKyc = () => {
    const nextForm = {
      ...kycForm,
      accountType: user?.role === 'seller' ? 'seller' : 'customer',
      legalName: kycForm.legalName || user?.name || '',
      businessName: kycForm.businessName || kycStatus.submission?.businessName || ''
    };

    setKycForm(nextForm);
    setKycNotice('');
    setView('kyc');
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    const endpoint = authMode === 'login' ? 'login' : 'register';
    const payload = authMode === 'login'
      ? { email: authForm.email, password: authForm.password }
      : authForm;

    const response = await fetch(`${API_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) {
      setAuthNotice(result.message || 'Authentication failed.');
      return;
    }

    if (result.requiresPasswordChange) {
      setPasswordChange({ user: result.user, currentPassword: authForm.password, newPassword: '', personalEmail: result.user.personalEmail || result.user.email || '' });
      setAuthMode('change-password');
      setAuthNotice('Temporary password accepted. Create a permanent password and register your personal email.');
      return;
    }

    if (result.otpRequired) {
      setPendingAuthUser(result.user);
      setAuthMode('verify-otp');
      setAuthNotice(`OTP sent by ${result.delivery?.channel || 'email'} to ${result.delivery?.destination || result.user.email}.`);
      return;
    }

    localStorage.setItem('erimToken', result.token);
    localStorage.setItem('erimUser', JSON.stringify(result.user));
    setUser(result.user);
    setAuthNotice('');
    setNotice(`Welcome to Erim, ${result.user.name}.`);

    if (authMode === 'register' && result.user.role === 'seller') {
      setKycForm((current) => ({
        ...current,
        accountType: 'seller',
        legalName: result.user.name
      }));
      setKycNotice('Complete KYC to prepare your seller account for payouts and approval.');
      setView('kyc');
      return;
    }

    setView('storefront');
  };

  const verifyAuthOtp = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: pendingAuthUser?.id, email: pendingAuthUser?.email || authForm.email, otp: authOtp })
    });
    const result = await response.json();

    if (!response.ok) {
      setAuthNotice(result.message || 'OTP verification failed.');
      return;
    }

    localStorage.setItem('erimToken', `demo-token-${result.user.id}`);
    localStorage.setItem('erimUser', JSON.stringify(result.user));
    setUser(result.user);
    setAuthOtp('');
    setPendingAuthUser(null);
    setAuthNotice('');
    setNotice('Account verified. Welcome to Erim.');
    setView('storefront');
  };

  const completeAuthPasswordChange = async (event) => {
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
      setAuthNotice(result.message || 'Password change failed.');
      return;
    }

    localStorage.setItem('erimToken', result.token);
    localStorage.setItem('erimUser', JSON.stringify(result.user));
    setUser(result.user);
    setPasswordChange({ user: null, currentPassword: '', newPassword: '', personalEmail: '' });
    setAuthNotice('');
    setNotice('Password changed. Welcome to Erim.');
    setView('storefront');
  };

  const submitKyc = async (event) => {
    event.preventDefault();

    if (!kycForm.consent) {
      setKycNotice('Please confirm that the KYC information is accurate before submitting.');
      return;
    }

    const token = localStorage.getItem('erimToken');
    const response = await fetch(`${API_URL}/kyc/submit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(kycForm)
    });
    const result = await response.json();

    if (!response.ok) {
      setKycNotice(result.message || 'KYC submission failed.');
      return;
    }

    setKycStatus(result);
    setKycNotice('KYC submitted. Erim compliance will review it shortly.');
  };

  const logout = () => {
    localStorage.removeItem('erimToken');
    localStorage.removeItem('erimUser');
    setUser(null);
    setCart([]);
    setKycStatus({ status: 'not_started', submission: null });
    setNotice('Signed out of Erim.');
  };

  const checkout = () => {
    if (!user) {
      setAuthMode('login');
      setAuthNotice('Please sign in or create an account before checking out.');
      setNotice('Sign in or create an Erim account to use the cart.');
      setView('auth');
      return;
    }

    if (!cart.length) return;
    setView('checkout');
  };

  const placeOrder = async () => {
    if (!cart.length) return;

    const order = {
      customer: user?.name || 'Guest customer',
      shopId: cart[0].product.shopId,
      total: cartTotal,
      deliveryFee: selectedDelivery.fee,
      delivery: {
        method: selectedDelivery.label,
        address: 'Kampala, Central Division, Nakasero Plot 45'
      },
      status: 'awaiting_arrangement',
      arrangement: {
        method: arrangementMode,
        contact: arrangementContact,
        details: merchantMessage
      },
      message: merchantMessage,
      lineItems: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }))
    };

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const created = await response.json();
    if (!response.ok) {
      setNotice(created.message || 'Checkout failed. Please try again.');
      return;
    }
    setCart([]);
    setLastOrder(created);
    setNotice(`Order ${created.id} sent to merchant. Chat with the merchant to arrange pickup, delivery, and payment terms.`);
    setView('order-success');
  };

  const sendMerchantChatMessage = async (event) => {
    event.preventDefault();
    const text = merchantChatDraft.trim();

    if (!text) return;

    const customer = user?.name || 'Guest Customer';
    const response = await fetch(`${API_URL}/merchant/chats/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: activeMerchantChat?.id,
        shopId: selectedChatShopId,
        customer,
        sender: customer,
        text
      })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || 'Message could not be sent.');
      return;
    }

    setMerchantChatDraft('');
    setActiveChatId(result.chat.id);
    loadMerchantChats(selectedChatShopId);
  };

  const sendCareChatMessage = async (event) => {
    event.preventDefault();
    const text = careChatDraft.trim();

    if (!text) return;

    const customer = user?.name || 'Guest Customer';

    if (!careTicketId) {
      const response = await fetch(`${API_URL}/customer-care/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          email: user?.email || '',
          phone: arrangementContact,
          subject: 'Customer chat from storefront',
          issue: text,
          priority: 'medium',
          category: 'Storefront Chat',
          channel: 'chat',
          orderId: lastOrder?.id || ''
        })
      });
      const ticket = await response.json();

      if (!response.ok) {
        setNotice(ticket.message || 'Customer-care message could not be sent.');
        return;
      }

      setCareTicketId(ticket.id);
      setCareMessages([{ id: `${ticket.id}-issue`, sender: customer, text }]);
      setCareChatDraft('');
      setNotice(`Customer-care ticket ${ticket.id} opened.`);
      return;
    }

    const response = await fetch(`${API_URL}/customer-care/tickets/${careTicketId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: customer, message: text, status: 'in_progress' })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || 'Customer-care message could not be sent.');
      return;
    }

    setCareChatDraft('');
    loadCareTicket(careTicketId);
  };

  if (view === 'auth') {
    const isLogin = authMode === 'login';
    const isOtp = authMode === 'verify-otp';
    const isPasswordChange = authMode === 'change-password';

    return (
      <div className="app-shell auth-shell">
        <section className="auth-visual">
          <a className="brand-mark auth-brand" href="#top" onClick={() => setView('storefront')} aria-label="Erim home">
            <img src="/erim-logo.png" alt="Erim" />
          </a>
          <div>
            <p className="eyebrow">Erim accounts</p>
            <h1>{isLogin ? 'Sign in to continue shopping and managing commerce.' : 'Create an Erim account for customers, sellers, and teams.'}</h1>
            <p>Use one account experience across the storefront, merchant workspace, admin operations, and customer care.</p>
          </div>
          <div className="auth-demo-list">
            <span>Demo logins</span>
            <strong>customer@erim.test</strong>
            <strong>seller@erim.test</strong>
            <small>Password for demos: pass123</small>
          </div>
        </section>

        <main className="auth-panel">
          <div className="auth-tabs">
            <button className={isLogin ? 'active' : ''} type="button" onClick={() => setAuthMode('login')}>Sign in</button>
            <button className={!isLogin ? 'active' : ''} type="button" onClick={() => setAuthMode('register')}>Create account</button>
          </div>

          {isOtp ? (
            <form className="auth-form" onSubmit={verifyAuthOtp}>
              <div><p className="eyebrow">Account verification</p><h2>Enter OTP</h2></div>
              <label>One-time password<input value={authOtp} onChange={(event) => setAuthOtp(event.target.value)} placeholder="6-digit code" required /></label>
              {authNotice && <p className="notice">{authNotice}</p>}
              <button type="submit">Verify Account</button>
            </form>
          ) : isPasswordChange ? (
            <form className="auth-form" onSubmit={completeAuthPasswordChange}>
              <div><p className="eyebrow">First login</p><h2>Create permanent password</h2></div>
              <label>Personal email<input type="email" value={passwordChange.personalEmail} onChange={(event) => setPasswordChange({ ...passwordChange, personalEmail: event.target.value })} required /></label>
              <label>New password<input type="password" value={passwordChange.newPassword} onChange={(event) => setPasswordChange({ ...passwordChange, newPassword: event.target.value })} required /></label>
              {authNotice && <p className="notice">{authNotice}</p>}
              <button type="submit">Save Password</button>
            </form>
          ) : (
          <form className="auth-form" onSubmit={submitAuth}>
            <div>
              <p className="eyebrow">{isLogin ? 'Welcome back' : 'New account'}</p>
              <h2>{isLogin ? 'Sign in to Erim' : 'Join Erim'}</h2>
            </div>

            {!isLogin && (
              <label>
                Full name
                <input
                  value={authForm.name}
                  onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                  placeholder="Your name"
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                placeholder="Enter password"
                required
              />
            </label>

            {!isLogin && (
              <label>
                Account type
                <select value={authForm.role} onChange={(event) => setAuthForm({ ...authForm, role: event.target.value })}>
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                  <option value="care">Customer care</option>
                </select>
              </label>
            )}

            {!isLogin && (
              <>
                <label>Phone for SMS<input value={authForm.phone || ''} onChange={(event) => setAuthForm({ ...authForm, phone: event.target.value })} placeholder="+256..." /></label>
                <label>WhatsApp<input value={authForm.whatsapp || ''} onChange={(event) => setAuthForm({ ...authForm, whatsapp: event.target.value })} placeholder="+256..." /></label>
                <label>Send OTP via<select value={authForm.deliveryChannel || 'email'} onChange={(event) => setAuthForm({ ...authForm, deliveryChannel: event.target.value })}><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></select></label>
              </>
            )}

            {authNotice && <p className="notice">{authNotice}</p>}

            <button type="submit">{isLogin ? 'Sign in' : 'Create account'}</button>
            <button className="ghost-button" type="button" onClick={() => setView('storefront')}>Back to storefront</button>
          </form>
          )}
        </main>
      </div>
    );
  }

  if (view === 'kyc') {
    if (!user) {
      return (
        <div className="app-shell auth-shell">
          <section className="auth-visual">
            <a className="brand-mark auth-brand" href="#top" onClick={() => setView('storefront')} aria-label="Erim home">
              <img src="/erim-logo.png" alt="Erim" />
            </a>
            <div>
              <p className="eyebrow">KYC required</p>
              <h1>Sign in before completing verification.</h1>
              <p>KYC is connected to your Erim account so compliance, payouts, and marketplace access stay traceable.</p>
            </div>
          </section>
          <main className="auth-panel">
            <button onClick={() => openAuth('login')}>Sign in</button>
            <button className="ghost-button" onClick={() => setView('storefront')}>Back to storefront</button>
          </main>
        </div>
      );
    }

    return (
      <div className="app-shell kyc-shell">
        <aside className="kyc-side">
          <a className="brand-mark auth-brand" href="#top" onClick={() => setView('storefront')} aria-label="Erim home">
            <img src="/erim-logo.png" alt="Erim" />
          </a>
          <div>
            <p className="eyebrow">Know your customer</p>
            <h1>Verify your identity for safer commerce on Erim.</h1>
            <p>Submit identity and business details once. Erim uses KYC to protect buyers, sellers, payouts, and marketplace operations.</p>
          </div>
          <div className="kyc-status-card">
            <span>Status</span>
            <strong>{kycStatus.status.replace('_', ' ')}</strong>
            {kycStatus.submission && <small>Submitted {new Date(kycStatus.submission.submittedAt).toLocaleString()}</small>}
          </div>
        </aside>

        <main className="kyc-workspace">
          <section className="kyc-progress" aria-label="KYC steps">
            <span className="active">Identity</span>
            <span>Documents</span>
            <span>Review</span>
          </section>

          <form className="kyc-form" onSubmit={submitKyc}>
            <div className="kyc-heading">
              <div>
                <p className="eyebrow">Verification form</p>
                <h2>Account KYC</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => setView('storefront')}>Back to storefront</button>
            </div>

            <section className="kyc-grid">
              <label>
                Account type
                <select value={kycForm.accountType} onChange={(event) => setKycForm({ ...kycForm, accountType: event.target.value })}>
                  <option value="customer">Customer</option>
                  <option value="seller">Seller / merchant</option>
                  <option value="care">Customer care</option>
                </select>
              </label>

              <label>
                Legal name
                <input value={kycForm.legalName} onChange={(event) => setKycForm({ ...kycForm, legalName: event.target.value })} placeholder="Name as shown on ID" required />
              </label>

              <label>
                Country
                <select value={kycForm.country} onChange={(event) => setKycForm({ ...kycForm, country: event.target.value })}>
                  <option>Uganda</option>
                  <option>Kenya</option>
                  <option>Tanzania</option>
                  <option>Rwanda</option>
                  <option>DR Congo</option>
                  <option>South Sudan</option>
                  <option>European Union</option>
                </select>
              </label>

              <label>
                Document type
                <select value={kycForm.documentType} onChange={(event) => setKycForm({ ...kycForm, documentType: event.target.value })}>
                  <option>National ID</option>
                  <option>Passport</option>
                  <option>Driver license</option>
                  <option>Business registration</option>
                </select>
              </label>

              <label>
                Document number
                <input value={kycForm.documentNumber} onChange={(event) => setKycForm({ ...kycForm, documentNumber: event.target.value })} placeholder="ID or registration number" required />
              </label>

              <label>
                Business name
                <input value={kycForm.businessName} onChange={(event) => setKycForm({ ...kycForm, businessName: event.target.value })} placeholder="Required for merchants" />
              </label>

              <label>
                Tax ID / TIN
                <input value={kycForm.taxId} onChange={(event) => setKycForm({ ...kycForm, taxId: event.target.value })} placeholder="Optional tax identifier" />
              </label>
            </section>

            <section className="document-grid">
              <label className="upload-tile">
                <span>ID front</span>
                <input type="file" accept="image/*,.pdf" onChange={(event) => setKycForm({ ...kycForm, documentFrontName: event.target.files?.[0]?.name || '' })} />
                <strong>{kycForm.documentFrontName || 'Choose file'}</strong>
              </label>
              <label className="upload-tile">
                <span>ID back or proof</span>
                <input type="file" accept="image/*,.pdf" onChange={(event) => setKycForm({ ...kycForm, documentBackName: event.target.files?.[0]?.name || '' })} />
                <strong>{kycForm.documentBackName || 'Choose file'}</strong>
              </label>
            </section>

            <label className="consent-row">
              <input type="checkbox" checked={kycForm.consent} onChange={(event) => setKycForm({ ...kycForm, consent: event.target.checked })} />
              I confirm the information provided is accurate and may be reviewed by Erim compliance.
            </label>

            {kycNotice && <p className="notice">{kycNotice}</p>}

            <div className="kyc-actions">
              <button type="submit">Submit KYC</button>
              <button className="ghost-button" type="button" onClick={() => setView('storefront')}>Skip for now</button>
            </div>
          </form>
        </main>
      </div>
    );
  }

  if (view === 'checkout' || view === 'order-success') {
    if (view === 'order-success') {
      return (
        <div className="shop-shell">
          <header className="shop-header">
            <a className="shop-logo" href="#top" onClick={() => setView('storefront')} aria-label="Erim home">
              <img src="/erim-logo.png" alt="Erim" />
            </a>
            <button className="ghost-button" onClick={() => setView('storefront')}>Continue Shopping</button>
          </header>
          <main className="success-checkout">
            <span className="success-badge">Paid</span>
            <h1>Order placed successfully</h1>
            <p>Order {lastOrder?.id} has been sent to the merchant. Chat with the merchant to arrange pickup or delivery details and agree on payment terms. Product stock will reduce only after merchant confirmation.</p>
            <div className="success-grid">
              <span>Total<strong>{currency(lastOrder?.total || 0, selectedCurrency)}</strong></span>
              <span>Status<strong>{lastOrder?.status || 'awaiting arrangement'}</strong></span>
              <span>Next step<strong>Merchant chat and agreement</strong></span>
            </div>
            <button onClick={() => setView('storefront')}>Back to Storefront</button>
          </main>
        </div>
      );
    }

    return (
      <div className="shop-shell checkout-shell">
        <header className="shop-header checkout-header">
          <a className="shop-logo" href="#top" onClick={() => setView('storefront')} aria-label="Erim home">
            <img src="/erim-logo.png" alt="Erim" />
          </a>
          <label className="mega-search">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for products, brands and more..." />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="All">All Categories</option>
              {catalog.categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button type="button" onClick={() => setView('storefront')}>Search</button>
          </label>
          <button className="cart-link" onClick={() => setView('storefront')}>Cart {cartCount}</button>
        </header>

        <main className="checkout-layout">
          <section className="checkout-workspace">
            <div className="secure-row"><span>Shield</span><strong>Secure Checkout</strong><small>Your information is 100% safe and secure</small></div>
            <div className="checkout-steps">
              {['Cart', 'Delivery', 'Chat Terms', 'Send Order'].map((step, index) => (
                <span className={index < 3 ? 'active' : ''} key={step}>{index + 1} {step}</span>
              ))}
            </div>

            <article className="checkout-card">
              <h2>Delivery Information</h2>
              <p>Choose where and how you want your order delivered</p>
              <div className="delivery-grid">
                <div>
                  <h3>Delivery Address</h3>
                  <div className="address-card">
                    <strong>{user?.name || 'John Doe'} <mark>Default</mark></strong>
                    <span>+256 700 123 456</span>
                    <span>Kampala, Central Division</span>
                    <span>Nakasero, Plot 45</span>
                    <button className="linkish" type="button">Edit</button>
                  </div>
                  <button className="add-address" type="button">+ Add New Address</button>
                </div>
                <div>
                  <h3>Delivery Methods</h3>
                  <div className="delivery-options">
                    {deliveryOptions.map((option) => (
                      <button
                        className={deliveryMethod === option.id ? 'selected' : ''}
                        key={option.id}
                        onClick={() => setDeliveryMethod(option.id)}
                        type="button"
                      >
                        <span><strong>{option.label}</strong><small>{option.eta}</small></span>
                        <strong>{currency(option.fee, selectedCurrency)}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <article className="checkout-card">
              <h2>Chat with Merchant</h2>
              <p>No payment method is collected at checkout. Send the merchant your pickup or delivery request and discuss payment terms directly before fulfillment.</p>
              <div className="payment-grid">
                <div className="payment-options">
                  {['Delivery', 'Pickup', 'Merchant Advice'].map((method) => (
                    <button className={arrangementMode === method ? 'selected' : ''} key={method} onClick={() => setArrangementMode(method)} type="button">
                      <strong>{method}</strong><small>{method === 'Delivery' ? 'Ask the merchant to deliver' : method === 'Pickup' ? 'Arrange pickup location and time' : 'Let merchant suggest the best option'}</small>
                    </button>
                  ))}
                </div>
                <div className="payment-details">
                  <h3>Message to Merchant</h3>
                  <label>Contact phone<input value={arrangementContact} onChange={(event) => setArrangementContact(event.target.value)} /></label>
                  <label>Pickup, delivery, and payment terms<textarea value={merchantMessage} onChange={(event) => setMerchantMessage(event.target.value)} /></label>
                  <div className="security-note">The merchant will receive this order notification and reply from the merchant dashboard chat.</div>
                </div>
              </div>
            </article>

            <div className="checkout-actions">
              <button className="ghost-button" onClick={() => setView('storefront')}>Back to Cart</button>
              <button onClick={placeOrder}>Send Order to Merchant</button>
            </div>
          </section>

          <aside className="order-summary">
            <div className="summary-card">
              <div className="summary-head"><h2>Order Summary</h2><button className="linkish" onClick={() => setView('storefront')}>Edit Cart</button></div>
              <div className="summary-items">
                {cart.map((item) => (
                  <div className="summary-item" key={item.product.id}>
                    <img src={item.product.image} alt={item.product.name} />
                    <span><strong>{item.product.name}</strong><small>Qty: {item.quantity}</small></span>
                    <strong>{currency(item.product.price * item.quantity, selectedCurrency)}</strong>
                  </div>
                ))}
              </div>
              <div className="summary-lines">
                <span>Subtotal<strong>{currency(cartSubtotal, selectedCurrency)}</strong></span>
                <span>Estimated Delivery<strong>{currency(selectedDelivery.fee, selectedCurrency)}</strong></span>
                <span className="total">Estimated Total<strong>{currency(cartTotal, selectedCurrency)}</strong></span>
              </div>
              <div className="points-card">No online payment is collected here. Final delivery or pickup cost and payment terms are agreed with the merchant.</div>
            </div>
            {['Merchant Chat', 'Flexible Pickup or Delivery', 'Customer Support'].map((item) => <div className="checkout-benefit" key={item}><strong>{item}</strong><span>Discuss details before the merchant confirms fulfillment</span></div>)}
          </aside>
        </main>
      </div>
    );
  }

  return (
    <div className="shop-shell storefront" id="top">
      <header className="shop-header">
        <a className="shop-logo" href="#top" aria-label="Erim home">
          <img src="/erim-logo.png" alt="Erim" />
        </a>
        <label className="mega-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for products, brands and more..." />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="All">All Categories</option>
            {catalog.categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button type="button">Search</button>
        </label>
        <div className="shop-actions">
          <button className="plain-action" type="button">Wishlist</button>
          <button className="plain-action cart-action" type="button" onClick={checkout}>Cart <span>{cartCount}</span></button>
          {user ? (
            <div className="account-menu">
              <strong>Hi, {user.name.split(' ')[0]}</strong>
              <a href={roleDestinations[user.role]?.href || '#top'}>{roleDestinations[user.role]?.label || 'My Account'}</a>
              <button className="linkish" onClick={openKyc}>KYC</button>
              <button className="linkish" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <div className="account-menu">
              <button className="linkish" onClick={() => openAuth('login')}>Sign in</button>
              <button className="linkish" onClick={() => openAuth('register')}>Create account</button>
            </div>
          )}
        </div>
      </header>

      <nav className="shop-nav">
        {['Home', 'Categories', 'Deals', 'New Arrivals', 'Best Sellers', 'Brands'].map((item) => <button className={item === 'Home' ? 'active' : ''} type="button" key={item}>{item}</button>)}
        <select value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value)}>
          {currencies.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
        </select>
      </nav>

      <main className="shop-layout">
        <aside className="category-rail">
          <h2>Shop by Category</h2>
          {categorySummaries.map((item) => (
            <button className={category === item.name ? 'active' : ''} key={item.name} onClick={() => setCategory(item.name)} type="button">
              <span>{item.name}</span><strong>{item.count}</strong>
            </button>
          ))}
        </aside>

        <section className="shop-content">
          <section className="store-hero">
            <button className="hero-arrow" type="button">‹</button>
            <div className="hero-copy">
              <span>Summer Sale</span>
              <h1>Big Deals. Bigger <strong>Savings.</strong></h1>
              <p>Up to 60% off on electronics, fashion, home goods and more.</p>
              <button type="button" onClick={() => setCategory('All')}>Shop Now</button>
            </div>
            <div className="hero-products">
              {catalog.products.slice(0, 4).map((product) => <img src={product.image} alt="" key={product.id} />)}
            </div>
            <div className="hero-benefits">
              {['100% Original', 'Easy Returns', 'Secure Payments', 'Fast Delivery'].map((item) => <span key={item}><strong>{item}</strong><small>Trusted ERIM shopping</small></span>)}
            </div>
            <button className="hero-arrow right" type="button">›</button>
          </section>

          <section className="service-strip">
            {['Free Delivery', 'Easy Returns', 'Secure Payments', 'Earn Rewards', '24/7 Support'].map((item) => <span key={item}><strong>{item}</strong><small>On every purchase</small></span>)}
          </section>

          {notice && <p className="notice">{notice}</p>}

          <section className="featured-row">
            <article className="deal-card">
              <div><h2>Deal of the Day</h2><span>Ends in 08 : 45 : 32</span></div>
              {catalog.products[0] && (
                <div className="deal-product">
                  <img src={catalog.products[0].image} alt={catalog.products[0].name} />
                  <div>
                    <h3>{catalog.products[0].name}</h3>
                    <small>4.6 rating</small>
                    <strong>{currency(catalog.products[0].price, selectedCurrency)}</strong>
                    <button onClick={() => addToCart(catalog.products[0])}>Add to Cart</button>
                  </div>
                </div>
              )}
            </article>

            <section className="top-categories">
              <div className="section-title"><h2>Top Categories</h2><button className="linkish" type="button">View All Categories</button></div>
              <div className="category-cards">
                {categorySummaries.slice(1, 7).map((item) => (
                  <button className="visual-category" key={item.name} onClick={() => setCategory(item.name)} type="button">
                    <span style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }} />
                    <strong>{item.name}</strong>
                    <small>Up to 50% off</small>
                  </button>
                ))}
              </div>
            </section>
          </section>

          <section className="best-sellers">
            <div className="section-title">
              <h2>Best Sellers</h2>
              <button className="linkish" type="button">View All</button>
            </div>
            <div className="best-grid">
              {displayedProducts.map((product) => (
                <article key={product.id} className="seller-card">
                  <button className="wish-button" type="button">♡</button>
                  <img src={product.image} alt={product.name} />
                  <span>{product.shop?.name}</span>
                  <h3>{product.name}</h3>
                  <small>★ 4.{Math.max(1, product.stock % 9)} ({product.stock * 27})</small>
                  <div className="seller-price">
                    <strong>{currency(product.price, selectedCurrency)}</strong>
                    <mark>{product.stock} left</mark>
                  </div>
                  <button onClick={() => addToCart(product)}>Add to Cart</button>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="cart-drawer">
          <div className="summary-head"><h2>Cart</h2><button className="linkish" onClick={() => setCart([])} disabled={!cart.length}>Clear</button></div>
          {cart.length ? cart.map((item) => (
            <div className="cart-line" key={item.product.id}>
              <img src={item.product.image} alt={item.product.name} />
              <div><strong>{item.product.name}</strong><small>{currency(item.product.price, selectedCurrency)}</small></div>
              <div className="qty-controls">
                <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}>+</button>
              </div>
              <button className="linkish" onClick={() => removeFromCart(item.product.id)}>Remove</button>
            </div>
          )) : <p>Your cart is empty.</p>}
          <div className="cart-total"><span>Total</span><strong>{currency(cartSubtotal, selectedCurrency)}</strong></div>
          <button onClick={checkout} disabled={!cart.length}>Checkout</button>
        </aside>
      </main>

      <div className="floating-commerce-menu">
        {showFloatingMenu && (
          <section className="floating-menu-card" aria-label="Quick actions">
            <button
              type="button"
              onClick={() => {
                setShowMerchantMessenger(true);
                setShowCareMessenger(false);
                setShowFloatingMenu(false);
              }}
            >
              <span className="floating-icon">Msg</span>
              <strong>Merchant Chat</strong>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCareMessenger(true);
                setShowMerchantMessenger(false);
                setShowFloatingMenu(false);
              }}
            >
              <span className="floating-icon care">Care</span>
              <strong>Customer Care</strong>
            </button>
            <button type="button" onClick={() => setNotice('Accio Work tools are coming soon for ERIM partners.')}>
              <span className="floating-icon accent">A</span>
              <strong>Accio Work</strong>
            </button>
            <button type="button" onClick={() => setNotice('Visual product search will be added in a later ERIM release.')}>
              <span className="floating-icon lens">Lens</span>
              <strong>Alibaba Lens</strong>
            </button>
            <button type="button" onClick={() => setNotice('Thanks for helping improve ERIM. Survey tools are being prepared.')}>
              <span className="floating-icon survey">?</span>
              <strong>Survey</strong>
            </button>
          </section>
        )}

        {showMerchantMessenger && (
          <section className="merchant-messenger-bubble" aria-label="Chat with merchant">
            <div className="messenger-head">
              <div>
                <strong>{selectedChatShop?.name || 'ERIM Merchant'}</strong>
                <span>Live merchant chat</span>
              </div>
              <button type="button" className="linkish" onClick={() => setShowMerchantMessenger(false)}>Close</button>
            </div>
            <div className="messenger-thread">
              {activeMerchantChat?.messages?.length ? activeMerchantChat.messages.map((message) => (
                <article className={`messenger-message ${message.sender === (user?.name || 'Guest Customer') ? 'mine' : ''}`} key={message.id}>
                  <strong>{message.sender}</strong>
                  <span>{message.text}</span>
                </article>
              )) : (
                <div className="messenger-empty">
                  <strong>Start a conversation</strong>
                  <span>Ask the merchant about pickup, delivery, availability, or payment terms.</span>
                </div>
              )}
            </div>
            <form className="messenger-compose" onSubmit={sendMerchantChatMessage}>
              <input
                value={merchantChatDraft}
                onChange={(event) => setMerchantChatDraft(event.target.value)}
                placeholder="Message the merchant..."
              />
              <button type="submit">Send</button>
            </form>
          </section>
        )}

        {showCareMessenger && (
          <section className="merchant-messenger-bubble care-messenger-bubble" aria-label="Chat with customer care">
            <div className="messenger-head care-head">
              <div>
                <strong>ERIM Customer Care</strong>
                <span>{careTicketId ? `Ticket ${careTicketId}` : 'Live support chat'}</span>
              </div>
              <button type="button" className="linkish" onClick={() => setShowCareMessenger(false)}>Close</button>
            </div>
            <div className="messenger-thread">
              {careMessages.map((message) => (
                <article className={`messenger-message ${message.sender === (user?.name || 'Guest Customer') ? 'mine' : ''}`} key={message.id}>
                  <strong>{message.sender}</strong>
                  <span>{message.text}</span>
                </article>
              ))}
            </div>
            <form className="messenger-compose" onSubmit={sendCareChatMessage}>
              <input
                value={careChatDraft}
                onChange={(event) => setCareChatDraft(event.target.value)}
                placeholder="Message ERIM customer care..."
              />
              <button type="submit">Send</button>
            </form>
          </section>
        )}

        <button
          className="floating-menu-trigger"
          type="button"
          onClick={() => {
            setShowFloatingMenu((current) => !current);
            if (!showFloatingMenu) {
              setShowMerchantMessenger(false);
              setShowCareMessenger(false);
            }
          }}
          aria-label="Open quick menu"
        >
          {showFloatingMenu ? 'Close' : 'Chat'}
        </button>
      </div>
    </div>
  );
}

export default App;
