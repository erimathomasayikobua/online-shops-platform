import React from 'react';
import { Search, Bell, MessageSquare, ChevronDown, Calendar, RefreshCw } from 'lucide-react';

const Header = ({ onRefresh, loading }) => {
  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} className="text-secondary" />
        <input type="text" placeholder="Search anything..." />
        <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>⌘ K</span>
      </div>

      <div className="header-actions">
        <button 
          className="icon-button" 
          onClick={onRefresh} 
          disabled={loading}
          style={{ marginRight: '8px' }}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>

        <div className="flex-between" style={{ gap: '12px', background: '#F3F4F6', padding: '6px 12px', borderRadius: '8px' }}>
          <Calendar size={18} className="text-secondary" />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>May 12 - May 18, 2024</span>
          <ChevronDown size={14} className="text-secondary" />
        </div>

        <button className="icon-button">
          <Bell size={20} />
          <span className="badge">12</span>
        </button>

        <button className="icon-button">
          <MessageSquare size={20} />
        </button>

        <div className="flex-between" style={{ gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '16px' }}>
          <img src="https://i.pravatar.cc/32?u=admin-erim" alt="Admin" className="user-avatar" style={{ width: '32px', height: '32px' }} />
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', fontWeight: 700 }}>ERIM Admin</p>
            <p style={{ fontSize: '10px', color: '#64748B' }}>Super Admin</p>
          </div>
          <ChevronDown size={14} className="text-secondary" />
        </div>
      </div>
    </header>
  );
};

export default Header;
