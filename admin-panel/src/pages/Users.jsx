import React, { useState, useEffect } from 'react';
import { fetchUsers } from '../services/api';
import { Search, Filter, MoreVertical, UserPlus } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="card">Loading users...</div>;
  if (error) return <div className="card" style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Users</h1>
          <p>Manage platform users and their roles</p>
        </div>
        <button className="nav-item active" style={{ border: 'none', cursor: 'pointer' }}>
          <UserPlus size={18} />
          <span>Add User</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex-between" style={{ gap: '16px' }}>
          <div className="header-search" style={{ width: '100%', maxWidth: '400px' }}>
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
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
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={`https://i.pravatar.cc/40?u=${user.id}`} 
                        alt={user.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
                      />
                      <div>
                        <p style={{ fontWeight: 600 }}>{user.name}</p>
                        <p style={{ fontSize: '12px', color: '#64748B' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                  <td>
                    <span className="badge-status status-active">Active</span>
                  </td>
                  <td>June 11, 2026</td>
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

export default Users;
