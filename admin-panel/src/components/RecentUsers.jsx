import React from 'react';

const RecentUsers = ({ users = [] }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Users</h3>
        <a href="#users" className="text-link">View all</a>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Joined On</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 5).map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={`https://i.pravatar.cc/32?u=${user.id}`} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>{user.email}</span>
                    </div>
                  </div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                <td>May 18, 2024</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentUsers;
