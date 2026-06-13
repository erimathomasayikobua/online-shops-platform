import React, { useState } from 'react';
import { FileText, Plus, Search, Edit, Trash, Eye } from 'lucide-react';

const BlogPosts = () => {
  const [posts] = useState([
    { id: 1, title: 'Top 10 Trends in Sustainable Fashion', author: 'Amina Otieno', category: 'Fashion', status: 'published', date: 'June 05, 2026' },
    { id: 2, title: 'How to Choose the Right Kitchenware', author: 'Maya Chen', category: 'Home', status: 'draft', date: 'June 08, 2026' },
    { id: 3, title: 'The Future of Regional Tech Hubs', author: 'Jonah Reed', category: 'Electronics', status: 'published', date: 'May 30, 2026' },
    { id: 4, title: 'Traditional Craftsmanship in Modern Homes', author: 'Admin User', category: 'Lifestyle', status: 'published', date: 'May 25, 2026' },
  ]);

  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Blog Posts</h1>
          <p>Manage editorial content and platform articles</p>
        </div>
        <button className="nav-item active" style={{ border: 'none', cursor: 'pointer' }}>
          <Plus size={18} />
          <span>New Post</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="header-search" style={{ maxWidth: '400px' }}>
          <Search size={18} className="text-secondary" />
          <input type="text" placeholder="Search articles by title..." />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Post Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td style={{ fontWeight: 600, color: '#1F2937' }}>{post.title}</td>
                  <td>{post.author}</td>
                  <td>{post.category}</td>
                  <td>
                    <span className={`badge-status status-${post.status}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.date}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-button"><Eye size={16} /></button>
                      <button className="icon-button"><Edit size={16} /></button>
                      <button className="icon-button" style={{ color: '#EF4444' }}><Trash size={16} /></button>
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

export default BlogPosts;
