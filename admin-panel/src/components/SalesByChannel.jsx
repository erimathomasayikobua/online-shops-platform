import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { generateChannelData } from '../utils/chartData';
import { formatCurrency } from '../utils/formatters';

const data = generateChannelData();

const SalesByChannel = () => {
  return (
    <div className="card" style={{ height: '400px' }}>
      <div className="card-header">
        <h3 className="card-title">Sales by Channel</h3>
        <a href="#report" className="text-link">View report</a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', height: '300px' }}>
        <div style={{ width: '50%', height: '240px', position: 'relative' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 700 }}>$1,248,045.50</p>
            <p style={{ fontSize: '10px', color: '#94A3B8' }}>Total Sales</p>
          </div>
        </div>
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                <span style={{ fontSize: '12px', color: '#64748B' }}>{item.name}</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.value}%</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesByChannel;
