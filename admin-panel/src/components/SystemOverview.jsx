import React from 'react';
import { Users, UserCheck, ShoppingBag, ShoppingCart, Package, Layers } from 'lucide-react';

const SystemOverview = ({ metrics = {} }) => {
  const items = [
    { label: 'Total Users', value: metrics.totalUsers || 0, icon: Users, trend: '+ 9.4%', color: '#4F46E5' },
    { label: 'Active Users (30D)', value: '45,678', icon: UserCheck, trend: '+ 11.2%', color: '#10B981' },
    { label: 'Total Merchants', value: metrics.shops || 0, icon: ShoppingBag, trend: '+ 8.7%', color: '#F59E0B' },
    { label: 'Active Merchants', value: '2,856', icon: UserCheck, trend: '+ 10.3%', color: '#F59E0B' },
    { label: 'Total Products', value: metrics.totalProducts || 0, icon: Package, trend: '+ 5.3%', color: '#4F46E5' },
    { label: 'Total Categories', value: '1,245', icon: Layers, trend: '+ 4.2%', color: '#8B5CF6' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">System Overview</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: `${item.color}15`, color: item.color }}>
                <item.icon size={14} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>{item.trend}</span>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700 }}>{item.value.toLocaleString()}</p>
              <p style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemOverview;
