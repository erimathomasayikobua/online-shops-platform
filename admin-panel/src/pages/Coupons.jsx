import React, { useState } from 'react';
import { Tag, Plus, Trash2, Edit, Copy } from 'lucide-react';

const Coupons = () => {
  const [coupons] = useState([
    { id: 1, code: 'ERIM20', discount: '20%', type: 'Percentage', usage: '1.2k', status: 'active', expires: '2026-12-31' },
    { id: 2, code: 'WELCOME50', discount: '$50.00', type: 'Fixed Amount', usage: '842', status: 'active', expires: '2026-08-15' },
    { id: 3, code: 'FREESHIP', discount: '100%', type: 'Free Shipping', usage: '3.5k', status: 'inactive', expires: '2026-05-20' },
  ]);

  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Coupons</h1>
          <p>Create and manage platform-wide discount codes</p>
        </div>
        <button className="nav-item active" style={{ border: 'none', cursor: 'pointer' }}>
          <Plus size={18} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Type</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Expires On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{ background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, color: '#4F46E5' }}>{coupon.code}</code>
                      <button className="icon-button" title="Copy code"><Copy size={12} /></button>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{coupon.discount}</td>
                  <td>{coupon.type}</td>
                  <td>{coupon.usage}</td>
                  <td>
                    <span className={`badge-status status-${coupon.status}`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td>{coupon.expires}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-button"><Edit size={16} /></button>
                      <button className="icon-button" style={{ color: '#EF4444' }}><Trash2 size={16} /></button>
                    </div>
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

export default Coupons;
