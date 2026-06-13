import React, { useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Filter, Search } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Payments = () => {
  const [transactions] = useState([
    { id: 'TX-4920', customer: 'Leah N.', amount: 836000, type: 'Payout', method: 'Bank Transfer', status: 'completed', date: 'June 11, 2026' },
    { id: 'TX-4921', customer: 'Daniel K.', amount: 243200, type: 'Sale', method: 'Mobile Money', status: 'completed', date: 'June 10, 2026' },
    { id: 'TX-4922', customer: 'Sarah M.', amount: 323000, type: 'Sale', method: 'Credit Card', status: 'pending', date: 'June 10, 2026' },
    { id: 'TX-4923', customer: 'Maya Chen', amount: 1500000, type: 'Payout', method: 'Bank Transfer', status: 'processing', date: 'June 09, 2026' },
  ]);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Payments</h1>
        <p>Monitor transactions, payouts, and financial health</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="card">
          <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Volume</p>
          <p style={{ fontSize: '24px', fontWeight: 700 }}>{formatCurrency(1248045.50)}</p>
        </div>
        <div className="card">
          <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Pending Payouts</p>
          <p style={{ fontSize: '24px', fontWeight: 700 }}>{formatCurrency(12500.00)}</p>
        </div>
        <div className="card">
          <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Platform Fees (30D)</p>
          <p style={{ fontSize: '24px', fontWeight: 700 }}>{formatCurrency(85420.00)}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex-between">
          <div className="header-search" style={{ maxWidth: '400px' }}>
            <Search size={18} className="text-secondary" />
            <input type="text" placeholder="Search by TX ID or customer..." />
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
                <th>TX ID</th>
                <th>Customer/Merchant</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 600 }}>{tx.id}</td>
                  <td>{tx.customer}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                      {tx.type === 'Sale' ? <ArrowDownLeft size={14} style={{ color: '#10B981' }} /> : <ArrowUpRight size={14} style={{ color: '#EF4444' }} />}
                      {tx.type}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(tx.amount)}</td>
                  <td>{tx.method}</td>
                  <td>
                    <span className={`badge-status status-${tx.status}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
