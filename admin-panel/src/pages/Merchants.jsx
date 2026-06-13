import React, { useState, useEffect } from 'react';
import { fetchMerchants, updateShopStatus } from '../services/api';
import { Search, Filter, MoreVertical, Store } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Merchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadMerchants = () => {
    setLoading(true);
    fetchMerchants()
      .then(setMerchants)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateShopStatus(id, status);
      loadMerchants();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const filteredMerchants = merchants.filter(merchant => 
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="card">Loading merchants...</div>;
  if (error) return <div className="card" style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Merchants</h1>
          <p>Review and manage platform shops</p>
        </div>
        <button className="nav-item active" style={{ border: 'none', cursor: 'pointer' }}>
          <Store size={18} />
          <span>Onboard Merchant</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex-between" style={{ gap: '16px' }}>
          <div className="header-search" style={{ width: '100%', maxWidth: '400px' }}>
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search by shop name or owner..." 
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
                <th>Merchant</th>
                <th>Owner</th>
                <th>Plan</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800 }}>
                        {merchant.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600 }}>{merchant.name}</p>
                        <p style={{ fontSize: '12px', color: '#64748B' }}>{merchant.category}</p>
                      </div>
                    </div>
                  </td>
                  <td>{merchant.owner}</td>
                  <td>{merchant.plan}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(merchant.revenue || 0)}</td>
                  <td>
                    <span className={`badge-status status-${merchant.status}`}>
                      {merchant.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      {merchant.status === 'review' && (
                        <button onClick={() => handleUpdateStatus(merchant.id, 'active')} style={{ padding: '4px 8px', minHeight: '30px', fontSize: '12px' }}>Approve</button>
                      )}
                      {merchant.status === 'active' && (
                        <button className="secondary" onClick={() => handleUpdateStatus(merchant.id, 'suspended')} style={{ padding: '4px 8px', minHeight: '30px', fontSize: '12px', backgroundColor: '#EF4444' }}>Suspend</button>
                      )}
                      {merchant.status === 'suspended' && (
                        <button onClick={() => handleUpdateStatus(merchant.id, 'active')} style={{ padding: '4px 8px', minHeight: '30px', fontSize: '12px' }}>Reactive</button>
                      )}
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

export default Merchants;
