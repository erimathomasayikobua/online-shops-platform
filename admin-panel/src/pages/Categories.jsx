import React, { useState } from 'react';
import { Layers, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const Categories = () => {
  const [categories] = useState([
    { id: 1, name: 'Home and Living', slug: 'home-and-living', products: 142, status: 'active' },
    { id: 2, name: 'Fashion', slug: 'fashion', products: 385, status: 'active' },
    { id: 3, name: 'Electronics', slug: 'electronics', products: 210, status: 'active' },
    { id: 4, name: 'Groceries', slug: 'groceries', products: 56, status: 'inactive' },
    { id: 5, name: 'Beauty', slug: 'beauty', products: 120, status: 'active' },
  ]);

  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Categories</h1>
          <p>Organize products into meaningful groups</p>
        </div>
        <button className="nav-item active" style={{ border: 'none', cursor: 'pointer' }}>
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Product Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#F3F4F6' }}>
                        <Layers size={18} className="text-secondary" />
                      </div>
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#64748B', fontFamily: 'monospace' }}>/{cat.slug}</td>
                  <td>{cat.products.toLocaleString()}</td>
                  <td>
                    <span className={`badge-status status-${cat.status}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-button"><Edit2 size={16} /></button>
                      <button className="icon-button" style={{ color: '#EF4444' }}><Trash2 size={16} /></button>
                      <button className="icon-button"><MoreVertical size={16} /></button>
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

export default Categories;
