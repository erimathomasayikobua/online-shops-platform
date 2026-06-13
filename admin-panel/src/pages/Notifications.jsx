import React, { useState } from 'react';
import { Bell, Send, User, Users, Store, Globe, Trash2 } from 'lucide-react';

const Notifications = () => {
  const [notifications] = useState([
    { id: 1, title: 'Platform Maintenance', target: 'All Users', type: 'System', date: 'June 11, 2026', status: 'Sent' },
    { id: 2, title: 'New Commission Rates', target: 'Merchants', type: 'Policy', date: 'June 10, 2026', status: 'Scheduled' },
    { id: 3, title: 'Security Alert', target: 'Staff', type: 'Security', date: 'June 09, 2026', status: 'Draft' },
  ]);

  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Notifications</h1>
          <p>Broadcast messages to platform users and segments</p>
        </div>
        <button className="nav-item active" style={{ border: 'none', cursor: 'pointer' }}>
          <Send size={18} />
          <span>New Broadcast</span>
        </button>
      </div>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Broadcasts</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <p style={{ fontWeight: 600 }}>{n.title}</p>
                      <p style={{ fontSize: '10px', color: '#64748B' }}>{n.type} • {n.date}</p>
                    </td>
                    <td>{n.target}</td>
                    <td><span className={`badge-status status-${n.status.toLowerCase()}`}>{n.status}</span></td>
                    <td>
                      <button className="icon-button" style={{ color: '#EF4444' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Segments</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="nav-item" style={{ border: '1px solid #E5E7EB', padding: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <Globe size={24} className="text-secondary" />
              <p style={{ fontWeight: 600, color: '#1F2937' }}>All Users</p>
              <p style={{ fontSize: '12px' }}>156,782 total</p>
            </div>
            <div className="nav-item" style={{ border: '1px solid #E5E7EB', padding: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <Store size={24} className="text-secondary" />
              <p style={{ fontWeight: 600, color: '#1F2937' }}>Active Merchants</p>
              <p style={{ fontSize: '12px' }}>3,652 total</p>
            </div>
            <div className="nav-item" style={{ border: '1px solid #E5E7EB', padding: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <Users size={24} className="text-secondary" />
              <p style={{ fontWeight: 600, color: '#1F2937' }}>Staff & Admins</p>
              <p style={{ fontSize: '12px' }}>42 total</p>
            </div>
            <div className="nav-item" style={{ border: '1px solid #E5E7EB', padding: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <User size={24} className="text-secondary" />
              <p style={{ fontWeight: 600, color: '#1F2937' }}>New Registrations</p>
              <p style={{ fontSize: '12px' }}>1.2k this week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
