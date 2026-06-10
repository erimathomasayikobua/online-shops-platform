import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const currencies = [
  { code: 'UGX', label: 'Ugx', rate: 1, locale: 'en-UG' },
  { code: 'USD', label: 'USD', rate: 1 / 3800, locale: 'en-US' },
  { code: 'KES', label: 'Kshs', rate: 130 / 3800, locale: 'en-KE' },
  { code: 'TZS', label: 'Tshs', rate: 2600 / 3800, locale: 'en-TZ' },
  { code: 'EUR', label: 'Euro', rate: 0.92 / 3800, locale: 'de-DE' },
  { code: 'RWF', label: 'Rwandan Francs', rate: 1300 / 3800, locale: 'rw-RW' },
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

const getCategoryProducts = (products, category) => {
  if (category === 'All') return products;
  return products.filter((product) => product.category === category);
};

const roleDestinations = {
  customer: { label: 'Customer storefront', href: '#top' },
  seller: { label: 'Seller dashboard', href: 'http://localhost:3001' },
  admin: { label: 'Admin panel', href: 'http://localhost:3002' },
  care: { label: 'Care console', href: 'http://localhost:3003' }
};

function App() {
  const [catalog, setCatalog] = useState({ shops: [], products: [], categories: [] });
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
  const [kycNotice, setKycNotice] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money');
  const [paymentNetwork, setPaymentNetwork] = useState('MTN Mobile Money');
  const [checkoutPhone, setCheckoutPhone] = useState('+256 700 123 456');
  const [lastOrder, setLastOrder] = useState(null);

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
      const categoryProducts = getCategoryProducts(catalog.products, item);
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
  }, [catalog.categories, catalog.products]);

  const displayedProducts = useMemo(() => {
    return getCategoryProducts(searchedProducts, category);
  }, [searchedProducts, category]);

  const groupedProducts = useMemo(() => {
    const activeCategories = category === 'All' ? catalog.categories : [category];

    return activeCategories
      .map((item) => ({
        name: item,
        products: getCategoryProducts(searchedProducts, item)
      }))
      .filter((group) => group.products.length);
  }, [catalog.categories, searchedProducts, category]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryOptions = [
    { id: 'standard', label: 'Standard Delivery', eta: '3 - 4 working days', fee: 5000 },
    { id: 'express', label: 'Express Delivery', eta: '1 - 2 working days', fee: 15000 },
    { id: 'pickup', label: 'Pick Up Station', eta: 'Nearest ERIM pick up station', fee: 0 }
  ];
  const selectedDelivery = deliveryOptions.find((item) => item.id === deliveryMethod) || deliveryOptions[0];
  const cartTotal = cartSubtotal + selectedDelivery.fee;

  const addToCart = (product) => {
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
    setKycStatus({ status: 'not_started', submission: null });
    setNotice('Signed out of Erim.');
  };

  const checkout = () => {
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
      payment: {
        method: paymentMethod,
        network: paymentMethod === 'Mobile Money' ? paymentNetwork : paymentMethod,
        phone: checkoutPhone
      },
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
    setNotice(`Order ${created.id} placed. Stock will update after merchant confirmation.`);
    setView('order-success');
  };

  if (view === 'auth') {
    const isLogin = authMode === 'login';

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

            {authNotice && <p className="notice">{authNotice}</p>}

            <button type="submit">{isLogin ? 'Sign in' : 'Create account'}</button>
            <button className="ghost-button" type="button" onClick={() => setView('storefront')}>Back to storefront</button>
          </form>
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
            <p>Order {lastOrder?.id} has been sent to the merchant. Product stock will reduce only after the merchant confirms fulfillment.</p>
            <div className="success-grid">
              <span>Total<strong>{currency(lastOrder?.total || 0, selectedCurrency)}</strong></span>
              <span>Status<strong>{lastOrder?.status || 'paid'}</strong></span>
              <span>Stock update<strong>Pending merchant confirmation</strong></span>
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
              {['Cart', 'Delivery', 'Payment', 'Review & Place Order'].map((step, index) => (
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
              <h2>Payment Method</h2>
              <p>All payments are secure and encrypted</p>
              <div className="payment-grid">
                <div className="payment-options">
                  {['Mobile Money', 'Visa / Mastercard', 'Bank Transfer', 'Pay on Delivery'].map((method) => (
                    <button className={paymentMethod === method ? 'selected' : ''} key={method} onClick={() => setPaymentMethod(method)} type="button">
                      <strong>{method}</strong><small>{method === 'Mobile Money' ? 'Pay with MTN or Airtel Money' : 'Secure customer payment'}</small>
                    </button>
                  ))}
                </div>
                <div className="payment-details">
                  <h3>{paymentMethod} Details</h3>
                  {paymentMethod === 'Mobile Money' && (
                    <>
                      <label>Select Network<select value={paymentNetwork} onChange={(event) => setPaymentNetwork(event.target.value)}><option>MTN Mobile Money</option><option>Airtel Money</option></select></label>
                      <label>Phone Number<input value={checkoutPhone} onChange={(event) => setCheckoutPhone(event.target.value)} /></label>
                    </>
                  )}
                  {paymentMethod !== 'Mobile Money' && <p className="payment-note">ERIM will show the secure {paymentMethod.toLowerCase()} instructions before final confirmation.</p>}
                  <div className="security-note">You will receive a secure confirmation prompt before the merchant receives this order.</div>
                </div>
              </div>
            </article>

            <div className="checkout-actions">
              <button className="ghost-button" onClick={() => setView('storefront')}>Back to Cart</button>
              <button onClick={placeOrder}>Continue to Review</button>
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
                <span>Delivery Fee<strong>{currency(selectedDelivery.fee, selectedCurrency)}</strong></span>
                <span className="total">Total<strong>{currency(cartTotal, selectedCurrency)}</strong></span>
              </div>
              <div className="points-card">You will earn {Math.round(cartTotal / 1000)} ERIM Points when you place this order.</div>
            </div>
            {['Safe & Secure Payments', 'Easy Returns', '24/7 Customer Support'].map((item) => <div className="checkout-benefit" key={item}><strong>{item}</strong><span>ERIM support is ready before and after purchase</span></div>)}
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
    </div>
  );
}

export default App;
