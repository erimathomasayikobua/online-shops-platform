import React, { useState, useEffect } from 'react';
import { fetchOrders } from '../services/api';
import { Search, Filter, MoreVertical, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="card">Loading orders...</div>;
  if (error) return <div className="card" style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Orders</h1>
          <p>Global order history and fulfillment status</p>
        </div>
        <button className="icon-button" style={{ border: '1px solid #E5E7EB', padding: '8px 12px', borderRadius: '8px' }}>
          <Download size={18} />
          <span style={{ marginLeft: '8px', fontSize: '14px' }}>Export CSV</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex-between" style={{ gap: '16px' }}>
          <div className="header-search" style={{ width: '100%', maxWidth: '400px' }}>
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search by order ID or customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="icon-button" style={{ border: '1px solid #E5E7EB', padding: '8px 12px', borderRadius: '8px' }}>
            <Filter size={18} />
            <span style={{ marginLeft: '8px', fontSize: '14px' }}>Filter</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>#{order.id.replace('ord-', 'ERIM-')}</td>
                  <td>{order.customer}</td>
                  <td>{order.shop?.name || 'N/A'}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                  <td>
                    <span className={`badge-status status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <button className="icon-button">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
