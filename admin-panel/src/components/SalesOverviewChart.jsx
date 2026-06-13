import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { generateSalesData } from '../utils/chartData';

const data = generateSalesData();

const SalesOverviewChart = () => {
  return (
    <div className="card" style={{ height: '400px' }}>
      <div className="card-header">
        <h3 className="card-title">Sales Overview</h3>
        <select style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #E5E7EB', fontSize: '12px' }}>
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickFormatter={(value) => `$${value / 1000}K`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend verticalAlign="top" align="left" iconType="circle" height={36} wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />
            <Line type="monotone" dataKey="sales" name="Sales" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4, fill: '#4F46E5' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="orders" name="Orders" stroke="#94A3B8" strokeWidth={2} dot={{ r: 4, fill: '#94A3B8' }} />
            <Line type="monotone" dataKey="visitors" name="Visitors" stroke="#CBD5E1" strokeWidth={2} dot={{ r: 4, fill: '#CBD5E1' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverviewChart;
