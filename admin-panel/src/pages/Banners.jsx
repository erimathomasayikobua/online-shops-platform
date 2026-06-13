import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit } from 'lucide-react';

const Banners = () => {
  const [banners] = useState([
    { id: 1, title: 'Summer Collection 2026', placement: 'Home Hero', type: 'Carousel', status: 'active', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'Electronics Mega Sale', placement: 'Category Sidebar', type: 'Static', status: 'active', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'New Arrival: Kitchenware', placement: 'Home Middle', type: 'Static', status: 'inactive', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=400&q=80' },
  ]);

  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Banners</h1>
          <p>Manage promotional graphics and homepage placements</p>
        </div>
        <button className="nav-item active" style={{ border: 'none', cursor: 'pointer' }}>
          <Plus size={18} />
          <span>Upload Banner</span>
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {banners.map((banner) => (
          <div key={banner.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
            <div style={{ padding: '16px' }}>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{banner.title}</h3>
                <span className={`badge-status status-${banner.status}`}>{banner.status}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}><strong>Placement:</strong> {banner.placement}</p>
              <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}><strong>Type:</strong> {banner.type}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="icon-button" style={{ border: '1px solid #E5E7EB', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', width: '100%' }}>
                  <Edit size={14} style={{ marginRight: '4px' }} /> Edit
                </button>
                <button className="icon-button" style={{ border: '1px solid #FEE2E2', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#EF4444', width: '100%' }}>
                  <Trash2 size={14} style={{ marginRight: '4px' }} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banners;
