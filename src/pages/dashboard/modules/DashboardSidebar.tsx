import React from 'react';
import {
  LayoutDashboard,
  PlusSquare,
  UtensilsCrossed,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  History,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (m: string) => void;
  pendingCount?: number;
}

const DashboardSidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, pendingCount = 0 }) => {
  const navItems = [
    { id: 'orders',    label: 'Order Board',  icon: <LayoutDashboard size={18} />, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'new-order', label: 'New Order',    icon: <PlusSquare size={18} /> },
    { id: 'menu',      label: 'Menu Manager', icon: <UtensilsCrossed size={18} /> },
    { id: 'history',   label: 'History',      icon: <History size={18} /> },
    { id: 'reports',   label: 'Reports',      icon: <BarChart3 size={18} /> },
    { id: 'settings',  label: 'Settings',     icon: <SettingsIcon size={18} /> },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <UtensilsCrossed size={18} color="#fff" />
          </div>
          <div className="sidebar-brand-text">
            <h2>Staff Panel</h2>
            <p>Operational</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeModule === item.id ? 'active' : ''}`}
            onClick={() => setActiveModule(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label" style={{ flex: 1 }}>{item.label}</span>
            {item.badge !== undefined && (
              <span style={{
                minWidth: '20px', height: '20px', padding: '0 5px', borderRadius: '50px',
                background: activeModule === item.id ? 'rgba(255,255,255,0.35)' : '#E8622A',
                color: '#fff', fontSize: '10px', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="sidebar-nav-item logout" title="Exit to Site">
          <span className="nav-icon"><LogOut size={18} /></span>
          <span className="nav-label">Exit to Site</span>
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
