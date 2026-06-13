import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShoppingBag, Package, ShoppingCart, 
  RotateCcw, Layers, Tag, Image as ImageIcon, FileText, 
  MessageSquare, CreditCard, Truck, ShieldCheck, Bell, 
  BarChart3, FileBarChart, Settings, LogOut 
} from 'lucide-react';

const navGroups = [
  {
    label: 'Management',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: Users, label: 'Users', path: '/users' },
      { icon: ShoppingBag, label: 'Merchants', path: '/merchants' },
      { icon: Package, label: 'Products', path: '/products' },
      { icon: ShoppingCart, label: 'Orders', path: '/orders' },
      { icon: RotateCcw, label: 'Returns', path: '/returns' },
      { icon: Layers, label: 'Categories', path: '/categories' },
      { icon: Tag, label: 'Brands', path: '/brands' },
      { icon: Tag, label: 'Coupons', path: '/coupons' },
    ]
  },
  {
    label: 'Content',
    items: [
      { icon: ImageIcon, label: 'Banners', path: '/banners' },
      { icon: FileText, label: 'Pages', path: '/pages' },
      { icon: MessageSquare, label: 'Blog Posts', path: '/blog-posts' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { icon: CreditCard, label: 'Payments', path: '/payments' },
      { icon: Truck, label: 'Shipping', path: '/shipping' },
      { icon: ShieldCheck, label: 'Tax Management', path: '/tax-management' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
    ]
  },
  {
    label: 'Reports & Analytics',
    items: [
      { icon: BarChart3, label: 'Sales Analytics', path: '/sales-analytics' },
      { icon: FileBarChart, label: 'Reports', path: '/reports' },
      { icon: FileBarChart, label: 'System Logs', path: '/system-logs' },
    ]
  },
  {
    label: 'System',
    items: [
      { icon: ShieldCheck, label: 'Roles & Permissions', path: '/roles-permissions' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ]
  }
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-logo">
        <img src="/erim-logo.png" alt="ERIM" />
        <span>ERIM</span>
      </NavLink>
      
      <div className="sidebar-nav">
        {navGroups.map((group, i) => (
          <div key={i} className="nav-section">
            <h3 className="nav-label">{group.label}</h3>
            {group.items.map((item, j) => (
              <NavLink 
                key={j} 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <img src="https://i.pravatar.cc/40?u=admin" alt="Admin" className="user-avatar" />
        <div className="user-info">
          <p className="user-name">Admin User</p>
          <p className="user-role">Super Admin</p>
        </div>
        <button className="icon-button">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
