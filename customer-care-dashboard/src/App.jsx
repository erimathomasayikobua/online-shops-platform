import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const agents = ['Sneha Chowdhury', 'Rohit Das', 'Ananya Patel', 'Vikram Singh', 'Priya Nair'];
const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed'
};

const navGroups = [
  { label: 'Main', items: [['dashboard', 'Dashboard'], ['tickets', 'Tickets'], ['customers', 'Customers'], ['chat', 'Chat'], ['calls', 'Calls'], ['knowledge', 'Knowledge Base']] },
  { label: 'Ticket Management', items: [['my', 'My Tickets'], ['unassigned', 'Unassigned'], ['all', 'All Tickets'], ['sla', 'SLA Breaches']] },
  { label: 'Reports', items: [['performance', 'Performance'], ['analytics', 'Analytics'], ['csat', 'CSAT Reports']] },
  { label: 'Settings', items: [['automation', 'Automation'], ['macros', 'Macros'], ['settings', 'Settings']] }
];

const knowledgeArticles = [
  ['Delayed delivery', 'Check order status, merchant fulfillment, courier tracking, and customer address before escalating.'],
  ['Refund not received', 'Confirm payment method, refund status, and expected bank or mobile money settlement window.'],
  ['Wrong item delivered', 'Collect photos, order ID, product SKU, and route to merchant replacement workflow.'],
  ['Payment debited', 'Verify transaction reference, payment gateway state, and duplicate order records.']
];

const formatTimeAgo = (dateValue) => {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(dateValue).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
};

function App() {
  const [careUser, setCareUser] = useState(() => {
    const saved = localStorage.getItem('erimCareAuth');
    return saved ? JSON.parse(saved) : null;
  });
  const [authForm, setAuthForm] = useState({ email: 'care@erim.test', password: 'pass123' });
  const [authNotice, setAuthNotice] = useState('');
  const [passwordChange, setPasswordChange] = useState({ session: null, currentPassword: '', newPassword: '', personalEmail: '' });
  const [overview, setOverview] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [agentStatus, setAgentStatus] = useState('Online');
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notice, setNotice] = useState('');
  const [ticketForm, setTicketForm] = useState({
    customer: '',
    email: '',
    phone: '',
    subject: '',
    issue: '',
    priority: 'medium',
    category: 'Shipping & Delivery',
    channel: 'email',
    orderId: ''
  });

  const loadOverview = () => {
    if (!careUser) return;

    fetch(`${API_URL}/customer-care/overview`)
      .then((response) => response.json())
      .then((data) => {
        setOverview(data);
        setSelectedTicketId((current) => current || data.tickets?.[0]?.id || '');
      })
      .catch(() => setNotice('Backend is offline. Start it with npm run dev:backend.'));
  };

  useEffect(loadOverview, [careUser]);

  const loginCare = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    });
    const result = await response.json();

    if (!response.ok || result.user.role !== 'care') {
      setAuthNotice(result.message || 'Use a customer-care account to access this dashboard.');
      return;
    }

    const session = { user: result.user, token: result.token };
    if (result.requiresPasswordChange) {
      setPasswordChange({ session, currentPassword: authForm.password, newPassword: '', personalEmail: result.user.personalEmail || result.user.email || '' });
      setAuthNotice('Temporary password accepted. Create a permanent password and register your personal email.');
      return;
    }
    localStorage.setItem('erimCareAuth', JSON.stringify(session));
    setCareUser(session);
    setAuthNotice('');
    setNotice(`Welcome back, ${result.user.name}.`);
  };

  const completePasswordChange = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: passwordChange.session.user.id,
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

    const session = { user: result.user, token: result.token };
    localStorage.setItem('erimCareAuth', JSON.stringify(session));
    setCareUser(session);
    setPasswordChange({ session: null, currentPassword: '', newPassword: '', personalEmail: '' });
    setAuthNotice('');
    setNotice(result.message);
  };

  const logoutCare = () => {
    localStorage.removeItem('erimCareAuth');
    setCareUser(null);
    setOverview(null);
    setSelectedTicketId('');
    setNotice('');
  };

  const tickets = overview?.tickets || [];
  const orders = overview?.orders || [];
  const metrics = overview?.metrics || {};

  const enrichedTickets = useMemo(() => tickets.map((ticket, index) => ({
    ...ticket,
    displayId: ticket.id.startsWith('ticket-') ? `#ERIM-${10425 - index}` : ticket.id,
    updatedAgo: formatTimeAgo(ticket.lastUpdated),
    assignedTo: ticket.assignedTo || agents[index % agents.length],
    category: ticket.category || 'Shipping & Delivery',
    email: ticket.email || `${ticket.customer.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    phone: ticket.phone || '+256 700 123 456',
    issue: ticket.issue || ticket.subject
  })), [tickets]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return enrichedTickets
      .filter((ticket) => statusFilter === 'all' || ticket.status === statusFilter)
      .filter((ticket) => !normalizedQuery || [ticket.customer, ticket.subject, ticket.orderId, ticket.category].join(' ').toLowerCase().includes(normalizedQuery));
  }, [enrichedTickets, query, statusFilter]);

  const selectedTicket = enrichedTickets.find((ticket) => ticket.id === selectedTicketId) || enrichedTickets[0];

  const updateTicket = async (ticketId, payload, message) => {
    const response = await fetch(`${API_URL}/customer-care/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const updated = await response.json();
    if (!response.ok) {
      setNotice(updated.message || 'Ticket update failed.');
      return;
    }
    setNotice(message || `${updated.id} updated.`);
    loadOverview();
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    const response = await fetch(`${API_URL}/customer-care/tickets/${selectedTicket.id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: 'Sneha Chowdhury', message: replyText.trim() })
    });
    const result = await response.json();
    if (!response.ok) {
      setNotice(result.message || 'Reply failed.');
      return;
    }
    setReplyText('');
    setNotice(`Reply sent to ${selectedTicket.customer}.`);
    loadOverview();
  };

  const addNote = async () => {
    if (!selectedTicket || !noteText.trim()) return;
    await updateTicket(selectedTicket.id, { note: noteText.trim() }, `Note added to ${selectedTicket.displayId}.`);
    setNoteText('');
  };

  const createTicket = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/customer-care/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketForm)
    });
    const created = await response.json();
    if (!response.ok) {
      setNotice(created.message || 'Ticket creation failed.');
      return;
    }
    setTicketForm({ customer: '', email: '', phone: '', subject: '', issue: '', priority: 'medium', category: 'Shipping & Delivery', channel: 'email', orderId: '' });
    setSelectedTicketId(created.id);
    setActivePage('dashboard');
    setNotice(`${created.id} opened for ${created.customer}.`);
    loadOverview();
  };

  const exportReport = () => {
    const csv = ['Ticket,Customer,Subject,Status,Priority,Assigned To'].concat(
      enrichedTickets.map((ticket) => [ticket.displayId, ticket.customer, ticket.subject, statusLabels[ticket.status] || ticket.status, ticket.priority, ticket.assignedTo].join(','))
    ).join('\n');
    navigator.clipboard?.writeText(csv);
    setNotice('Ticket report copied to clipboard.');
  };

  const renderTrendChart = () => (
    <svg className="care-line-chart" viewBox="0 0 760 230" role="img" aria-label="Tickets overview chart">
      {[35, 85, 135, 185].map((y) => <line key={y} x1="40" x2="740" y1={y} y2={y} />)}
      <polyline className="new-line" points="45,145 150,108 260,80 370,118 485,94 600,120 725,62" />
      <polyline className="resolved-line" points="45,168 150,145 260,142 370,160 485,132 600,152 725,92" />
      {['150', '100', '50', '0'].map((label, index) => <text key={label} x="0" y={42 + index * 50}>{label}</text>)}
    </svg>
  );

  const renderDashboard = () => (
    <>
      <section className="care-metrics">
        {[
          ['Total Tickets', metrics.totalTickets || enrichedTickets.length, '18.6%', 'violet'],
          ['Open Tickets', metrics.openTickets || 0, '6.3%', 'orange'],
          ['Resolved Tickets', metrics.resolvedTickets || 0, '22.4%', 'green'],
          ['Avg. Response Time', '2h 15m', '12.6%', 'blue']
        ].map(([label, value, change, tone]) => (
          <article key={label}>
            <span className={`metric-badge ${tone}`}>{label.slice(0, 2)}</span>
            <div><span>{label}</span><strong>{value}</strong><small>Up {change} vs May 05 - May 11</small></div>
          </article>
        ))}
      </section>

      <section className="care-dashboard-grid">
        <article className="care-panel chart-panel">
          <div className="panel-head"><h2>Tickets Overview</h2><button>This Week</button></div>
          <div className="legend"><span className="blue-dot" />New Tickets <span className="green-dot" />Resolved Tickets</div>
          {renderTrendChart()}
        </article>
        <article className="care-panel status-panel">
          <h2>Tickets by Status</h2>
          <div className="status-content">
            <div className="care-donut"><span>{metrics.totalTickets || enrichedTickets.length}<small>Total</small></span></div>
            <div className="status-list">
              {[
                ['Open', metrics.openTickets || 0, 'orange-dot'],
                ['In Progress', metrics.inProgressTickets || 0, 'blue-dot'],
                ['Pending', metrics.waitingTickets || 0, 'yellow-dot'],
                ['Resolved', metrics.resolvedTickets || 0, 'green-dot'],
                ['Closed', 2, 'violet-dot']
              ].map(([label, value, dot]) => <span key={label}><i className={dot} />{label}<strong>{value}</strong></span>)}
            </div>
          </div>
        </article>
      </section>

      <section className="care-panel">
        <div className="panel-head"><h2>Recent Tickets</h2><button className="link-button" onClick={() => setActivePage('tickets')}>View All Tickets</button></div>
        {renderTicketTabs()}
        {renderTicketTable(filteredTickets.slice(0, 6))}
      </section>

      <section className="care-bottom-grid">
        <article className="care-panel status-panel">
          <h2>Tickets by Category</h2>
          <div className="status-content">
            <div className="category-donut" />
            <div className="status-list">
              {['Order & Delivery 40%', 'Returns & Refunds 25%', 'Payment Issues 15%', 'Product Issues 10%', 'Others 10%'].map((item) => <span key={item}><i className="blue-dot" />{item}</span>)}
            </div>
          </div>
        </article>
        <article className="care-panel sla-card">
          <div className="panel-head"><h2>SLA Performance</h2><button>This Week</button></div>
          <div className="sla-ring"><span>92%<small>SLA Met</small></span></div>
          <div className="status-list"><span><i className="green-dot" />Met<strong>1,148</strong></span><span><i className="orange-dot" />Breached<strong>74</strong></span><span><i className="red-dot" />At Risk<strong>26</strong></span></div>
        </article>
        <article className="care-panel">
          <div className="panel-head"><h2>Top Agents (Resolved)</h2><button>This Week</button></div>
          <div className="agent-list">
            {agents.map((agent, index) => <span key={agent}><i>{agent.split(' ').map((part) => part[0]).join('')}</i>{agent}<b style={{ width: `${88 - index * 10}%` }} /><strong>{156 - index * 18}</strong></span>)}
          </div>
        </article>
      </section>
    </>
  );

  const renderTicketTabs = () => (
    <div className="ticket-tabs">
      {[
        ['all', 'All'],
        ['open', 'Open'],
        ['in_progress', 'In Progress'],
        ['waiting', 'Pending'],
        ['resolved', 'Resolved'],
        ['closed', 'Closed']
      ].map(([key, label]) => <button className={statusFilter === key ? 'active' : ''} key={key} onClick={() => setStatusFilter(key)}>{label}</button>)}
    </div>
  );

  const renderTicketTable = (rows) => (
    <div className="ticket-table">
      <div className="ticket-head"><span>Ticket ID</span><span>Customer</span><span>Subject</span><span>Status</span><span>Priority</span><span>Assigned To</span><span>Updated</span><span>Channel</span></div>
      {rows.map((ticket) => (
        <button className={`ticket-row ${selectedTicket?.id === ticket.id ? 'selected' : ''}`} key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)}>
          <span>{ticket.displayId}</span>
          <span>{ticket.customer}</span>
          <span>{ticket.subject}</span>
          <mark className={ticket.status}>{statusLabels[ticket.status] || ticket.status}</mark>
          <mark className={`priority ${ticket.priority}`}>{ticket.priority}</mark>
          <span>{ticket.assignedTo}</span>
          <span>{ticket.updatedAgo}</span>
          <span>{ticket.channel}</span>
        </button>
      ))}
    </div>
  );

  const renderTicketDetail = () => {
    if (!selectedTicket) {
      return <aside className="right-rail"><section className="care-panel"><h2>Ticket Details</h2><p>No ticket selected.</p></section></aside>;
    }

    return (
      <aside className="right-rail">
        <section className="care-panel ticket-detail">
          <div className="panel-head"><h2>Ticket Details</h2><mark className={selectedTicket.status}>{statusLabels[selectedTicket.status] || selectedTicket.status}</mark></div>
          <span className="ticket-id">{selectedTicket.displayId}</span>
          <div className="customer-card">
            <span className="avatar">{selectedTicket.customer.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
            <div><strong>{selectedTicket.customer}</strong><small>{selectedTicket.email}</small></div>
            <button className="icon-button">Mail</button>
            <button className="icon-button">Call</button>
          </div>
          <div className="issue-card">
            <small>Issue</small>
            <strong>{selectedTicket.subject}</strong>
            <p>{selectedTicket.issue}</p>
            <span>Order ID<strong>{selectedTicket.orderId || 'Not linked'}</strong></span>
            <span>Category<strong>{selectedTicket.category}</strong></span>
            <span>Priority<mark className={`priority ${selectedTicket.priority}`}>{selectedTicket.priority}</mark></span>
            <span>Created<strong>{new Date(selectedTicket.createdAt || selectedTicket.lastUpdated).toLocaleString()}</strong></span>
            <span>Channel<strong>{selectedTicket.channel}</strong></span>
          </div>
          <label>Assign To
            <select value={selectedTicket.assignedTo} onChange={(event) => updateTicket(selectedTicket.id, { assignedTo: event.target.value }, `Assigned ${selectedTicket.displayId} to ${event.target.value}.`)}>
              {agents.map((agent) => <option key={agent}>{agent}</option>)}
            </select>
          </label>
          <label>Status
            <select value={selectedTicket.status} onChange={(event) => updateTicket(selectedTicket.id, { status: event.target.value }, `${selectedTicket.displayId} moved to ${statusLabels[event.target.value]}.`)}>
              {Object.entries(statusLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
            </select>
          </label>
          <label>Add Note<textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Type your note here..." /></label>
          <button onClick={addNote} disabled={!noteText.trim()}>Save Note</button>
          <label>Reply<textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Type your reply here..." /></label>
          <button onClick={sendReply} disabled={!replyText.trim()}>Send Reply</button>
          {!!selectedTicket.replies?.length && <div className="reply-history">{selectedTicket.replies.map((reply) => <span key={reply.id}><strong>{reply.agent}</strong>{reply.message}</span>)}</div>}
        </section>

        <section className="care-panel quick-actions">
          <h2>Quick Actions</h2>
          {[
            ['Create New Ticket', 'tickets'],
            ['Search Tickets', 'dashboard'],
            ['Macros', 'macros'],
            ['Knowledge Base', 'knowledge'],
            ['Reports', 'analytics']
          ].map(([label, page]) => <button key={label} onClick={() => setActivePage(page)}>{label}<span>›</span></button>)}
        </section>
      </aside>
    );
  };

  const renderCreateTicket = () => (
    <form className="care-panel create-ticket" onSubmit={createTicket}>
      <div className="panel-head"><h2>Create New Ticket</h2><button type="button" onClick={() => setActivePage('dashboard')}>Back</button></div>
      <div className="form-grid">
        <label>Customer<input value={ticketForm.customer} onChange={(event) => setTicketForm({ ...ticketForm, customer: event.target.value })} required /></label>
        <label>Email<input type="email" value={ticketForm.email} onChange={(event) => setTicketForm({ ...ticketForm, email: event.target.value })} /></label>
        <label>Phone<input value={ticketForm.phone} onChange={(event) => setTicketForm({ ...ticketForm, phone: event.target.value })} /></label>
        <label>Order ID<input value={ticketForm.orderId} onChange={(event) => setTicketForm({ ...ticketForm, orderId: event.target.value })} /></label>
        <label>Priority<select value={ticketForm.priority} onChange={(event) => setTicketForm({ ...ticketForm, priority: event.target.value })}><option>low</option><option>medium</option><option>high</option></select></label>
        <label>Channel<select value={ticketForm.channel} onChange={(event) => setTicketForm({ ...ticketForm, channel: event.target.value })}><option>email</option><option>chat</option><option>call</option><option>form</option></select></label>
        <label>Category<input value={ticketForm.category} onChange={(event) => setTicketForm({ ...ticketForm, category: event.target.value })} /></label>
        <label>Subject<input value={ticketForm.subject} onChange={(event) => setTicketForm({ ...ticketForm, subject: event.target.value })} required /></label>
      </div>
      <label>Issue<textarea value={ticketForm.issue} onChange={(event) => setTicketForm({ ...ticketForm, issue: event.target.value })} required /></label>
      <button type="submit">Create Ticket</button>
    </form>
  );

  const renderFeaturePage = () => {
    if (activePage === 'tickets' || activePage === 'my' || activePage === 'unassigned' || activePage === 'all' || activePage === 'sla') {
      const rows = activePage === 'my'
        ? filteredTickets.filter((ticket) => ticket.assignedTo === 'Sneha Chowdhury')
        : activePage === 'unassigned'
          ? filteredTickets.filter((ticket) => !ticket.assignedTo)
          : activePage === 'sla'
            ? filteredTickets.filter((ticket) => ticket.priority === 'high')
            : filteredTickets;
      return <section className="care-panel"><div className="panel-head"><h2>Tickets</h2><button onClick={() => setActivePage('create')}>Create Ticket</button></div>{renderTicketTabs()}{renderTicketTable(rows)}</section>;
    }

    if (activePage === 'create') return renderCreateTicket();

    if (activePage === 'customers') {
      return <section className="care-panel"><h2>Customers</h2><div className="customer-grid">{[...new Set(enrichedTickets.map((ticket) => ticket.customer))].map((customer) => <article key={customer}><span className="avatar">{customer[0]}</span><strong>{customer}</strong><small>{enrichedTickets.filter((ticket) => ticket.customer === customer).length} tickets</small></article>)}</div></section>;
    }

    if (activePage === 'chat') {
      return <section className="care-panel chat-page"><h2>Live Chat</h2>{enrichedTickets.filter((ticket) => ticket.channel === 'chat').map((ticket) => <article key={ticket.id}><strong>{ticket.customer}</strong><span>{ticket.subject}</span><button onClick={() => { setSelectedTicketId(ticket.id); setActivePage('dashboard'); }}>Open</button></article>)}</section>;
    }

    if (activePage === 'calls') {
      return <section className="care-panel"><h2>Call Queue</h2><div className="settings-list">{enrichedTickets.map((ticket) => <div className="settings-row" key={ticket.id}><span>{ticket.customer}<small>{ticket.phone}</small></span><button onClick={() => setNotice(`Calling ${ticket.customer} at ${ticket.phone}.`)}>Start Call</button></div>)}</div></section>;
    }

    if (activePage === 'knowledge') {
      return <section className="care-panel"><h2>Knowledge Base</h2><div className="kb-grid">{knowledgeArticles.map(([title, body]) => <article key={title}><strong>{title}</strong><p>{body}</p><button onClick={() => setReplyText(body)}>Use as Reply</button></article>)}</div></section>;
    }

    return <section className="care-panel report-page"><h2>{navGroups.flatMap((group) => group.items).find(([key]) => key === activePage)?.[1] || 'Reports'}</h2><p>Operational controls are ready for this area.</p><div className="report-grid">{['Automation status: Active', 'Macros available: 8', 'CSAT score: 4.7 / 5', 'SLA met: 92%', 'Tickets exported: Ready'].map((item) => <span key={item}>{item}</span>)}</div></section>;
  };

  const content = activePage === 'dashboard' ? renderDashboard() : renderFeaturePage();

  if (!careUser) {
    if (passwordChange.session) {
      return (
        <div className="care-auth-shell">
          <section className="auth-brand-panel">
            <a className="brand-logo" href="#login" aria-label="ERIM care login"><img src="/erim-logo.png" alt="Erim" /></a>
            <div><p className="auth-eyebrow">First login security</p><h1>Create your permanent password.</h1><p>Admin-created customer-care accounts must set a private password and register a personal email before access.</p></div>
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
      <div className="care-auth-shell">
        <section className="auth-brand-panel">
          <a className="brand-logo" href="#login" aria-label="ERIM care login"><img src="/erim-logo.png" alt="Erim" /></a>
          <div>
            <p className="auth-eyebrow">ERIM Customer Care</p>
            <h1>Secure access for support agents.</h1>
            <p>Handle customer tickets, replies, calls, knowledge base content, and SLA work from one protected support workspace.</p>
          </div>
          <div className="auth-demo-card">
            <strong>Demo care agent</strong>
            <span>care@erim.test</span>
            <small>Password: pass123</small>
          </div>
        </section>
        <main className="auth-form-panel">
          <form className="auth-card" onSubmit={loginCare}>
            <div>
              <p className="auth-eyebrow">Support login</p>
              <h2>Sign in to Customer Care</h2>
            </div>
            <label>Email<input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required /></label>
            <label>Password<input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required /></label>
            {authNotice && <p className="notice">{authNotice}</p>}
            <button type="submit">Login to Care Dashboard</button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="care-shell">
      <aside className="care-sidebar">
        <a className="brand-logo" href="#dashboard" onClick={() => setActivePage('dashboard')} aria-label="Erim care console"><img src="/erim-logo.png" alt="Erim" /></a>
        <nav>
          {navGroups.map((group) => (
            <div key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([key, label]) => (
                <button className={activePage === key ? 'active' : ''} key={key} onClick={() => setActivePage(key)}>
                  <span>{label.slice(0, 2)}</span>{label}
                  {key === 'chat' && <b>3</b>}
                  {key === 'my' && <b>12</b>}
                  {key === 'unassigned' && <b>8</b>}
                  {key === 'sla' && <b>2</b>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button className="help-card" onClick={() => setActivePage('knowledge')}><strong>Need Help?</strong><span>View Support Guide</span></button>
        <button className="help-card logout-card" onClick={logoutCare}><strong>Logout</strong><span>{careUser.user.name}</span></button>
      </aside>

      <main className="care-main">
        <header className="care-topbar">
          <div><h1>Customer Care Dashboard</h1><p>Overview of support activities and ticket insights</p></div>
          <label className="care-search"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tickets, customers..." /></label>
          <select className="agent-status" value={agentStatus} onChange={(event) => setAgentStatus(event.target.value)}><option>Online</option><option>Busy</option><option>Away</option></select>
          <button className="bell-button">Bell <b>8</b></button>
          <button className="agent-profile" onClick={logoutCare}><span>{careUser.user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><strong>{careUser.user.name}<small>Logout</small></strong></button>
        </header>

        <div className="care-actions-row">
          <button className="date-button">May 12 - May 18, 2024</button>
          <button className="date-button" onClick={exportReport}>Export Report</button>
        </div>

        {notice && <p className="notice">{notice}</p>}

        <div className="care-content-layout">
          <section className="care-content">{content}</section>
          {renderTicketDetail()}
        </div>
      </main>
    </div>
  );
}

export default App;
