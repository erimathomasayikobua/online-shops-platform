import React from 'react';
import { ShoppingBag, RotateCcw, AlertTriangle, Tag, ShieldCheck, Ticket } from 'lucide-react';

const stats = [
  { label: 'Pending Orders', value: '1,248', icon: ShoppingBag, color: '#F59E0B' },
  { label: 'Pending Returns', value: '312', icon: RotateCcw, color: '#4F46E5' },
  { label: 'Disputes', value: '56', icon: ShieldCheck, color: '#EF4444' },
  { label: 'Low Stock Products', value: '842', icon: ShoppingBag, color: '#8B5CF6' },
  { label: 'Out of Stock', value: '128', icon: AlertTriangle, color: '#F43F5E' },
  { label: 'Active Coupons', value: '76', icon: Ticket, color: '#10B981' },
];

const PlatformOverview = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Platform Overview</h3>
        <a href="#view-all" className="text-link">View all</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={18} />
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>{stat.label}</p>
              <p style={{ fontSize: '14px', fontWeight: 700 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformOverview;
