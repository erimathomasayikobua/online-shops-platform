import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerCareProvider } from './contexts/CustomerCareContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import TicketManagement from './pages/TicketManagement';
import TicketDetail from './pages/TicketDetail';
import CustomerManagement from './pages/CustomerManagement';
import CustomerDetail from './pages/CustomerDetail';
import LiveChat from './pages/LiveChat';
import KnowledgeBase from './pages/KnowledgeBase';
import CommunicationCenter from './pages/CommunicationCenter';
import Reports from './pages/Reports';
import TeamManagement from './pages/TeamManagement';
import Settings from './pages/Settings';
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
                <ProtectedRoute requiredRole="customer_care">
                  <CustomerCareProvider>
                    <div className="customer-care-layout">
                      <Sidebar />
                      <div className="main-content">
                        <Header />
                        <div className="content-area">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/tickets" element={<TicketManagement />} />
                            <Route path="/tickets/:id" element={<TicketDetail />} />
                            <Route path="/customers" element={<CustomerManagement />} />
                            <Route path="/customers/:id" element={<CustomerDetail />} />
                            <Route path="/live-chat" element={<LiveChat />} />
                            <Route path="/knowledge-base" element={<KnowledgeBase />} />
                            <Route path="/communications" element={<CommunicationCenter />} />
                            <Route path="/team" element={<TeamManagement />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                          </Routes>
                        </div>
                      </div>
                    </div>
                  </CustomerCareProvider>
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