import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const currency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

function App() {
  const [overview, setOverview] = useState(null);
  const [ticket, setTicket] = useState({ customer: '', subject: '', priority: 'medium', channel: 'chat' });
  const [notice, setNotice] = useState('');

  const loadOverview = () => {
    fetch(`${API_URL}/customer-care/overview`)
      .then((response) => response.json())
      .then(setOverview)
      .catch(() => setNotice('Backend is offline. Start it with npm run dev:backend.'));
  };

  useEffect(loadOverview, []);

  const createTicket = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/customer-care/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket)
    });
    const created = await response.json();
    setNotice(`${created.id} opened for ${created.customer}.`);
    setTicket({ customer: '', subject: '', priority: 'medium', channel: 'chat' });
    loadOverview();
  };

  const metrics = overview?.metrics || {};

  return (
    <div className="care-shell">
      <aside className="sidebar">
        <strong>Care Console</strong>
        <a href="#tickets">Tickets</a>
        <a href="#orders">Orders</a>
        <a href="#new">New ticket</a>
      </aside>

      <main className="workspace">
        <header className="page-header">
          <div>
            <p className="eyebrow">Customer operations</p>
            <h1>Resolve buyer questions with order and shop context in view.</h1>
          </div>
          <button onClick={loadOverview}>Refresh</button>
        </header>

        {notice && <p className="notice">{notice}</p>}

        <section className="metric-grid">
          <article><span className="icon">Open</span><span>Open tickets</span><strong>{metrics.openTickets || 0}</strong></article>
          <article><span className="icon">Wait</span><span>Waiting</span><strong>{metrics.waitingTickets || 0}</strong></article>
          <article><span className="icon">Ship</span><span>Orders today</span><strong>{metrics.ordersToday || 0}</strong></article>
          <article><span className="icon">SLA</span><span>Avg response</span><strong>{metrics.averageResponseMinutes || 0}m</strong></article>
        </section>

        <section className="two-column">
          <section className="panel" id="tickets">
            <h2>Ticket queue</h2>
            {(overview?.tickets || []).map((item) => (
              <article className="ticket-row" key={item.id}>
                <div>
                  <strong>{item.subject}</strong>
                  <span>{item.customer} - {item.channel} - {item.orderId}</span>
                </div>
                <mark>{item.priority}</mark>
              </article>
            ))}
          </section>

          <form className="panel" id="new" onSubmit={createTicket}>
            <h2>Open ticket</h2>
            <label>Customer<input value={ticket.customer} onChange={(event) => setTicket({ ...ticket, customer: event.target.value })} required /></label>
            <label>Subject<input value={ticket.subject} onChange={(event) => setTicket({ ...ticket, subject: event.target.value })} required /></label>
            <label>Priority
              <select value={ticket.priority} onChange={(event) => setTicket({ ...ticket, priority: event.target.value })}>
                <option>low</option>
                <option>medium</option>
                <option>high</option>
              </select>
            </label>
            <label>Channel
              <select value={ticket.channel} onChange={(event) => setTicket({ ...ticket, channel: event.target.value })}>
                <option>chat</option>
                <option>email</option>
                <option>phone</option>
              </select>
            </label>
            <button type="submit">Create ticket</button>
          </form>
        </section>

        <section className="panel" id="orders">
          <h2>Recent orders</h2>
          <div className="order-grid">
            {(overview?.orders || []).map((order) => (
              <article key={order.id}>
                <strong>{order.id}</strong>
                <span>{order.customer}</span>
                <span>{order.shop?.name}</span>
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
