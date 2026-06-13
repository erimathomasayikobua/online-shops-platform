import React from 'react';
import { formatCurrency } from '../utils/formatters';

const TopMerchants = ({ merchants = [] }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Top Merchants</h3>
        <a href="#merchants" className="text-link">View all</a>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Orders</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            {merchants.slice(0, 5).map((merchant) => (
              <tr key={merchant.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>
                      {merchant.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {merchant.name}
                  </div>
                </td>
                <td>{merchant.orders.toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(merchant.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopMerchants;
