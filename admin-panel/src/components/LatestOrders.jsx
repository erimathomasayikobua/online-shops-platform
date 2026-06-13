import React from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';

const LatestOrders = ({ orders = [] }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Latest Orders</h3>
        <a href="#orders" className="text-link">View all</a>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600 }}>#{order.id.replace('ord-', 'ERIM-')}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="icon" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                      {order.customer.split(' ').map(n => n[0]).join('')}
                    </div>
                    {order.customer}
                  </div>
                </td>
                <td>{formatCurrency(order.total)}</td>
                <td>Paid</td>
                <td>
                  <span className={`badge-status status-${order.status === 'fulfilled' ? 'delivered' : 'processing'}`}>
                    {order.status === 'fulfilled' ? 'Delivered' : 'Processing'}
                  </span>
                </td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LatestOrders;
