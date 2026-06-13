import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../services/api';
import { Search, Filter, MoreVertical, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="card">Loading products...</div>;
  if (error) return <div className="card" style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Products</h1>
          <p>Global product catalog management</p>
        </div>
        <button className="nav-item active" style={{ border: 'none', cursor: 'pointer' }}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex-between" style={{ gap: '16px' }}>
          <div className="header-search" style={{ width: '100%', maxWidth: '400px' }}>
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search by product name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="icon-button" style={{ border: '1px solid #E5E7EB', padding: '8px 12px', borderRadius: '8px' }}>
            <Filter size={18} />
            <span style={{ marginLeft: '8px', fontSize: '14px' }}>Filter</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Shop</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
                      />
                      <span style={{ fontWeight: 600 }}>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.shop?.name || 'N/A'}</td>
                  <td>{product.category}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`badge-status status-${product.status}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button className="icon-button">
                      <MoreVertical size={18} />
                    </button>
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

export default Products;
