import React from 'react';
import { Server, Database, CreditCard, Mail } from 'lucide-react';

const SystemStatus = ({ status = {} }) => {
  const items = [
    { label: 'Server Status', value: status.server || 'Operational', icon: Server },
    { label: 'Database', value: status.database || 'Operational', icon: Database },
    { label: 'Payment Gateway', value: status.paymentGateway || 'Operational', icon: CreditCard },
    { label: 'Email Service', value: status.emailService || 'Operational', icon: Mail },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">System Status</h3>
        <a href="#logs" className="text-link">View logs</a>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item, i) => (
          <div key={i} className="flex-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <item.icon size={18} className="text-secondary" />
              <span style={{ fontSize: '13px', color: '#64748B' }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemStatus;
