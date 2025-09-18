import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { ThemeProvider } from './contexts/ThemeProvider';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ShopManagement from './pages/ShopManagement';
import ShopDetail from './pages/ShopDetail';
import CategoryManagement from './pages/CategoryManagement';
import OrderManagement from './pages/OrderManagement';
import PaymentManagement from './pages/PaymentManagement';
import Analytics from './pages/Analytics';
import SystemSettings from './pages/SystemSettings';
import ContentManagement from './pages/ContentManagement';
import ReportsAndExports from './pages/ReportsAndExports';
import AuditLogs from './pages/AuditLogs';
import SupportTickets from './pages/SupportTickets';
import Login from './pages/Login';

// Styles
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProvider>
                    <div className="admin-layout">
                      <Sidebar />
                      <div className="main-content">
                        <Header />
                        <div className="content-area">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/users" element={<UserManagement />} />
                            <Route path="/shops" element={<ShopManagement />} />
                            <Route path="/shops/:id" element={<ShopDetail />} />
                            <Route path="/categories" element={<CategoryManagement />} />
                            <Route path="/orders" element={<OrderManagement />} />
                            <Route path="/payments" element={<PaymentManagement />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/content" element={<ContentManagement />} />
                            <Route path="/reports" element={<ReportsAndExports />} />
                            <Route path="/audit-logs" element={<AuditLogs />} />
                            <Route path="/support-tickets" element={<SupportTickets />} />
                            <Route path="/settings" element={<SystemSettings />} />
                          </Routes>
                        </div>
                      </div>
                    </div>
                  </AdminProvider>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;