import React, { useState } from 'react';
import { Save, Shield, Globe, Bell, CreditCard, Mail } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  return (
    <div>
      <div className="dashboard-header">
        <h1>Settings</h1>
        <p>Configure platform preferences and system rules</p>
      </div>

      <div className="main-grid" style={{ gridTemplateColumns: '250px 1fr' }}>
        <div className="card" style={{ padding: '12px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', cursor: 'pointer', marginBottom: '4px', textAlign: 'left' }}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ textTransform: 'capitalize' }}>{activeTab} Settings</h3>
            <button className="nav-item active" style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', minHeight: '34px' }}>
              <Save size={16} />
              <span style={{ fontSize: '13px' }}>Save Changes</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeTab === 'general' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Platform Name</label>
                  <input type="text" className="notice" style={{ width: '100%', background: 'white', border: '1px solid #E5E7EB', margin: 0 }} defaultValue="ERIM Platform" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Support Email</label>
                  <input type="email" className="notice" style={{ width: '100%', background: 'white', border: '1px solid #E5E7EB', margin: 0 }} defaultValue="support@erim.test" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Currency</label>
                  <select className="notice" style={{ width: '100%', background: 'white', border: '1px solid #E5E7EB', margin: 0 }}>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>UGX (Ugx)</option>
                  </select>
                </div>
              </>
            )}
            {activeTab !== 'general' && (
              <p style={{ color: '#64748B', fontSize: '14px' }}>Configure your {activeTab} preferences here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
