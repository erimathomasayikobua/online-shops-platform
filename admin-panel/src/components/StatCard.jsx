import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ label, value, trend, icon: Icon, color }) => {
  const isPositive = trend.startsWith('+');

  return (
    <div className="card stat-card">
      <div className="stat-header">
        <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={20} />
        </div>
        <div className={`stat-trend ${isPositive ? 'up' : 'down'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend.replace('+', '').replace('-', '')}
        </div>
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
      <p style={{ fontSize: '10px', color: '#94A3B8' }}>vs May 05 - May 11</p>
    </div>
  );
};

export default StatCard;
