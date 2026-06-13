import React from 'react';
import StatCard from '../components/StatCard';
import SalesOverviewChart from '../components/SalesOverviewChart';
import SalesByChannel from '../components/SalesByChannel';
import PlatformOverview from '../components/PlatformOverview';
import LatestOrders from '../components/LatestOrders';
import TopMerchants from '../components/TopMerchants';
import RecentUsers from '../components/RecentUsers';
import SystemOverview from '../components/SystemOverview';
import SystemStatus from '../components/SystemStatus';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatCurrency } from '../utils/formatters';
import { DollarSign, ShoppingBag, Users, BarChart3, Package } from 'lucide-react';

const Dashboard = () => {
  const { data, systemStatus, loading, error } = useDashboardData();

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: '24px' }}>Error: {error}</div>;

  const metrics = data?.metrics || {};

  return (
    <>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of ERIM platform</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Sales" value={formatCurrency(metrics.grossMerchandiseValue || 0)} trend="+ 18.6%" icon={DollarSign} color="#4F46E5" />
        <StatCard label="Total Orders" value={metrics.orders?.toLocaleString() || '0'} trend="+ 12.5%" icon={ShoppingBag} color="#10B981" />
        <StatCard label="Total Users" value={metrics.totalUsers?.toLocaleString() || '0'} trend="+ 9.4%" icon={Users} color="#8B5CF6" />
        <StatCard label="Total Merchants" value={metrics.shops?.toLocaleString() || '0'} trend="+ 8.7%" icon={ShoppingBag} color="#F59E0B" />
        <StatCard label="Total Products" value={metrics.totalProducts?.toLocaleString() || '0'} trend="+ 5.3%" icon={Package} color="#3B82F6" />
        <StatCard label="Total Revenue" value={formatCurrency(metrics.grossMerchandiseValue || 0)} trend="+ 18.6%" icon={BarChart3} color="#8B5CF6" />
      </div>

      <div className="main-grid">
        <SalesOverviewChart />
        <SalesByChannel />
      </div>

      <div className="overview-grid">
        <PlatformOverview />
      </div>

      <div className="bottom-grid">
        <LatestOrders orders={data?.orders || []} />
        <TopMerchants merchants={data?.shops || []} />
        <RecentUsers users={data?.users || []} />
      </div>

      <div className="main-grid">
        <SystemOverview metrics={metrics} />
        <SystemStatus status={systemStatus} />
      </div>
    </>
  );
};

export default Dashboard;
