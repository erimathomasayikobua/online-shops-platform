import React from 'react';
import { FileBarChart, Download, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];

const Reports = () => {
  return (
    <div>
      <div className="dashboard-header flex-between">
        <div>
          <h1>Reports</h1>
          <p>Analytical reports and platform performance metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="icon-button" style={{ border: '1px solid #E5E7EB', padding: '8px 12px', borderRadius: '8px' }}>
            <Calendar size={18} />
            <span style={{ marginLeft: '8px', fontSize: '14px' }}>Last 30 Days</span>
          </button>
          <button className="nav-item active" style={{ border: 'none', cursor: 'pointer', padding: '8px 16px' }}>
            <Download size={18} />
            <span style={{ fontSize: '14px' }}>Download Report</span>
          </button>
        </div>
      </div>

      <div className="main-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Revenue Growth</h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Report Types</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="nav-item" style={{ border: '1px solid #E5E7EB', padding: '12px', cursor: 'pointer' }}>
              <FileBarChart size={18} className="text-secondary" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: '#1F2937' }}>Sales Summary Report</p>
                <p style={{ fontSize: '10px' }}>Daily/Weekly/Monthly Sales</p>
              </div>
              <Download size={16} className="text-secondary" />
            </div>
            <div className="nav-item" style={{ border: '1px solid #E5E7EB', padding: '12px', cursor: 'pointer' }}>
              <FileBarChart size={18} className="text-secondary" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: '#1F2937' }}>Merchant Payouts</p>
                <p style={{ fontSize: '10px' }}>Scheduled and pending payouts</p>
              </div>
              <Download size={16} className="text-secondary" />
            </div>
            <div className="nav-item" style={{ border: '1px solid #E5E7EB', padding: '12px', cursor: 'pointer' }}>
              <FileBarChart size={18} className="text-secondary" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: '#1F2937' }}>Inventory Status</p>
                <p style={{ fontSize: '10px' }}>Low stock and out of stock items</p>
              </div>
              <Download size={16} className="text-secondary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
