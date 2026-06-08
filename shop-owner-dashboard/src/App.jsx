import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const currency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

function App() {
  const [overview, setOverview] = useState(null);
  const [product, setProduct] = useState({ name: '', category: '', price: '', stock: '' });
  const [notice, setNotice] = useState('');

  const loadOverview = () => {
    fetch(`${API_URL}/merchant/overview?shopId=shop-aurora`)
      .then((response) => response.json())
      .then(setOverview)
      .catch(() => setNotice('Backend is offline. Start it with npm run dev:backend.'));
  };

  useEffect(loadOverview, []);

  const metrics = overview?.metrics || {};
  const lowStockProducts = useMemo(() => {
    return (overview?.products || []).filter((item) => item.stock < 12);
  }, [overview]);

  const createProduct = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, shopId: overview.shop.id })
    });

    const created = await response.json();
    setNotice(`${created.name} was added to your catalog.`);
    setProduct({ name: '', category: '', price: '', stock: '' });
    loadOverview();
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

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <strong>Seller OS</strong>
        <nav>
          <a href="#overview">Overview</a>
          <a href="#products">Products</a>
          <a href="#orders">Orders</a>
          <a href="#inventory">Inventory</a>
        </nav>
      </aside>

      <main className="workspace">
        <header className="page-header" id="overview">
          <div>
            <p className="eyebrow">Shop owner dashboard</p>
            <h1>{overview?.shop?.name || 'Merchant workspace'}</h1>
            <p>{overview?.shop?.description || 'Manage products, inventory, and orders from one place.'}</p>
          </div>
          <button onClick={loadOverview}>Refresh</button>
        </header>

        {notice && <p className="notice">{notice}</p>}

        <section className="metric-grid">
          <article><span className="icon">Rev</span><span>Revenue</span><strong>{currency(metrics.revenue || 0)}</strong></article>
          <article><span className="icon">Ord</span><span>Orders</span><strong>{metrics.orders || 0}</strong></article>
          <article><span className="icon">Sku</span><span>Products</span><strong>{metrics.products || 0}</strong></article>
          <article><span className="icon">Low</span><span>Low stock</span><strong>{metrics.lowStock || 0}</strong></article>
        </section>

        <section className="two-column">
          <form className="panel" onSubmit={createProduct} id="products">
            <h2>Add product</h2>
            <label>Name<input value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} required /></label>
            <label>Category<input value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} required /></label>
            <label>Price<input type="number" min="0" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} required /></label>
            <label>Stock<input type="number" min="0" value={product.stock} onChange={(event) => setProduct({ ...product, stock: event.target.value })} required /></label>
            <button type="submit">Publish product</button>
          </form>

          <section className="panel" id="inventory">
            <h2>Inventory alerts</h2>
            {lowStockProducts.length ? lowStockProducts.map((item) => (
              <div className="list-row" key={item.id}>
                <span>{item.name}</span>
                <strong>{item.stock} left</strong>
              </div>
            )) : <p>No low stock products right now.</p>}
          </section>
        </section>

        <section className="panel" id="orders">
          <h2>Orders</h2>
          <div className="table">
            <div className="table-head"><span>Order</span><span>Customer</span><span>Total</span><span>Status</span><span>Action</span></div>
            {(overview?.orders || []).map((order) => (
              <div className="table-row" key={order.id}>
                <span>{order.id}</span>
                <span>{order.customer}</span>
                <span>{currency(order.total)}</span>
                <span className="status">{order.status}</span>
                <button onClick={() => updateOrder(order.id, 'fulfilled')}>Fulfill</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
