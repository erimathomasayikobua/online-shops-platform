import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useDashboardData } from '../hooks/useDashboardData';

const Layout = () => {
  const { refresh, loading } = useDashboardData();

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="main-content">
        <Header onRefresh={refresh} loading={loading} />
        <div className="dashboard">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
