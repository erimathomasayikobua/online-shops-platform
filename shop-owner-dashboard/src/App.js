import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ShopProvider } from './contexts/ShopContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import ShopSettings from './pages/ShopSettings';
import CustomerReviews from './pages/CustomerReviews';
import Promotions from './pages/Promotions';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';

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
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <ShopProvider>
                    <div className="dashboard-layout">
                      <Sidebar />
                      <div className="main-content">
                        <Header />
                        <div className="content-area">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/products/new" element={<ProductForm />} />
                            <Route path="/products/edit/:id" element={<ProductForm />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/orders/:id" element={<OrderDetail />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/reviews" element={<CustomerReviews />} />
                            <Route path="/promotions" element={<Promotions />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<ShopSettings />} />
                          </Routes>
                        </div>
                      </div>
                    </div>
                  </ShopProvider>
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