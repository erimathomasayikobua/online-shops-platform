import React, { useState } from 'react';
import { Shield, Lock, ShieldCheck, UserCog, Plus, Trash2 } from 'lucide-react';

const RolesPermissions = () => {
  const [roles] = useState([
    { id: 1, name: 'Super Admin', users: 3, permissions: 'All Access', level: 'Level 10' },
    { id: 2, name: 'Shop Manager', users: 12, permissions: 'Shop Management, Orders', level: 'Level 5' },
    { id: 3, name: 'Support Agent', users: 8, permissions: 'Tickets, Order View', level: 'Level 3' },
    { id: 4, name: 'Content Editor', users: 5, permissions: 'Blog, Banners, Pages', level: 'Level 4' },
  ]);

  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Roles & Permissions</h1>
          <p>Define system access levels and administrative privileges</p>
        </div>
        <button className="nav-item active" style={{ border: 'none', cursor: 'pointer' }}>
          <Plus size={18} />
          <span>Create Role</span>
        </button>
      </div>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">System Roles</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Users</th>
                  <th>Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: role.name === 'Super Admin' ? '#FEE2E2' : '#F3F4F6' }}>
                          <Shield size={18} style={{ color: role.name === 'Super Admin' ? '#EF4444' : '#64748B' }} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600 }}>{role.name}</p>
                          <p style={{ fontSize: '10px', color: '#64748B' }}>{role.permissions}</p>
                        </div>
                      </div>
                    </td>
                    <td>{role.users}</td>
                    <td><span style={{ fontSize: '12px', fontWeight: 600, color: '#4F46E5' }}>{role.level}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="icon-button"><UserCog size={16} /></button>
                        {role.name !== 'Super Admin' && <button className="icon-button" style={{ color: '#EF4444' }}><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Access Policy Overview</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', gap: '16px' }}>
              <Lock size={24} className="text-secondary" />
              <div>
                <p style={{ fontWeight: 600 }}>Multi-Factor Authentication</p>
                <p style={{ fontSize: '12px', color: '#64748B' }}>Enforced for all administrative accounts since June 01, 2026.</p>
              </div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', gap: '16px' }}>
              <ShieldCheck size={24} style={{ color: '#10B981' }} />
              <div>
                <p style={{ fontWeight: 600 }}>IP Whitelisting</p>
                <p style={{ fontSize: '12px', color: '#64748B' }}>Access restricted to office VPN for Level 8+ operations.</p>
              </div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', gap: '16px' }}>
              <UserCog size={24} className="text-secondary" />
              <div>
                <p style={{ fontWeight: 600 }}>Role Audit Log</p>
                <p style={{ fontSize: '12px', color: '#64748B' }}>All permission changes are logged and reviewed weekly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
