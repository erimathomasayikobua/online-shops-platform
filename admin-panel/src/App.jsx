import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const currency = (value) => `Ugx ${Math.round(Number(value || 0)).toLocaleString('en-UG')}`;

function App() {
  const [overview, setOverview] = useState(null);
  const [notice, setNotice] = useState('');

  const loadOverview = () => {
    fetch(`${API_URL}/admin/overview`)
      .then((response) => response.json())
      .then(setOverview)
      .catch(() => setNotice('Backend is offline. Start it with npm run dev:backend.'));
  };

  useEffect(loadOverview, []);

  const updateShopStatus = async (shopId, status) => {
    await fetch(`${API_URL}/shops/${shopId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setNotice(`Shop moved to ${status}.`);
    loadOverview();
  };

  const metrics = overview?.metrics || {};

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <a className="brand-logo" href="#shops" aria-label="Erim admin">
          <img src="/erim-logo.png" alt="Erim" />
        </a>
        <a href="#shops">Shops</a>
        <a href="#orders">Orders</a>
        <a href="#risk">Risk</a>
      </aside>

      <main className="workspace">
        <header className="page-header">
          <div>
            <p className="eyebrow">Marketplace control plane</p>
            <h1>Operate tenants, policies, and marketplace health.</h1>
          </div>
          <button onClick={loadOverview}>Refresh data</button>
        </header>

        {notice && <p className="notice">{notice}</p>}

        <section className="metric-grid">
          <article><span className="icon">All</span><span>Total shops</span><strong>{metrics.shops || 0}</strong></article>
          <article><span className="icon">Ok</span><span>Active shops</span><strong>{metrics.activeShops || 0}</strong></article>
          <article><span className="icon">Rev</span><span>In review</span><strong>{metrics.reviewQueue || 0}</strong></article>
          <article><span className="icon">GMV</span><span>GMV</span><strong>{currency(metrics.grossMerchandiseValue || 0)}</strong></article>
        </section>

        <section className="panel" id="shops">
          <h2>Shop governance</h2>
          <div className="table">
            <div className="table-head"><span>Shop</span><span>Owner</span><span>Plan</span><span>Status</span><span>Orders</span><span>Action</span></div>
            {(overview?.shops || []).map((shop) => (
              <div className="table-row" key={shop.id}>
                <span><strong>{shop.name}</strong><small>{shop.category}</small></span>
                <span>{shop.owner}</span>
                <span>{shop.plan}</span>
                <span className={`status ${shop.status}`}>{shop.status}</span>
                <span>{shop.orders}</span>
                <div className="actions">
                  <button onClick={() => updateShopStatus(shop.id, 'active')}>Approve</button>
                  <button className="secondary" onClick={() => updateShopStatus(shop.id, 'suspended')}>Suspend</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" id="orders">
          <h2>Order oversight</h2>
          <div className="order-grid">
            {(overview?.orders || []).map((order) => (
              <article key={order.id}>
                <strong>{order.id}</strong>
                <span>{order.customer}</span>
                <span>{currency(order.total)} - {order.status}</span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
