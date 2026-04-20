import React, { useState, useEffect } from 'react';
import { UserCircle, LayoutDashboard, PlusSquare, UtensilsCrossed, History as HistoryIcon, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import DashboardSidebar from './modules/DashboardSidebar';
import OrderBoard from './modules/OrderBoard';
import NewOrder from './modules/NewOrder';
import MenuManager from './modules/MenuManager';
import Analytics from './modules/Analytics';
import Settings from './modules/Settings';
import History from './modules/History';
import { Order, OrderStatus, StaffProfile, DashboardSettings } from './types';
import { ALL_ITEMS, MenuItem } from '@/data/menuData';
import './Dashboard.css';

const StaffDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(ALL_ITEMS);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [settings, setSettings] = useState<DashboardSettings>({
    restaurantName: 'Restaurant',
    currency: 'ETB',
    timezone: 'UTC+3',
    autoSendReport: false,
    soundAlerts: true,
  });

  // Persistence
  useEffect(() => {
    try {
      const savedOrders   = localStorage.getItem('atot_orders');
      const savedMenu     = localStorage.getItem('atot_menu');
      const savedStaff    = localStorage.getItem('atot_staff');
      const savedSettings = localStorage.getItem('atot_settings');
      if (savedOrders)   setOrders(JSON.parse(savedOrders));
      if (savedMenu)     setMenuItems(JSON.parse(savedMenu));
      if (savedStaff)    setStaff(JSON.parse(savedStaff));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (e) {
      console.error("Local storage sync error", e);
    }
  }, []);

  useEffect(() => { localStorage.setItem('atot_orders',   JSON.stringify(orders));    }, [orders]);
  useEffect(() => { localStorage.setItem('atot_menu',     JSON.stringify(menuItems)); }, [menuItems]);
  useEffect(() => { localStorage.setItem('atot_staff',    JSON.stringify(staff));     }, [staff]);
  useEffect(() => { localStorage.setItem('atot_settings', JSON.stringify(settings));  }, [settings]);

  // Handlers
  const handleUpdateOrderStatus = (id: string, newStatus: OrderStatus) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, lastStatusChange: Date.now() } : o));

  const handleAddNewOrder = (orderData: Partial<Order>) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: orderData.customerName || 'Guest',
      tableNumber: orderData.tableNumber,
      type: orderData.type || 'DINE-IN',
      items: orderData.items || [],
      status: 'PENDING',
      orderTime: Date.now(),
      elapsedTime: 0,
      totalPrice: orderData.totalPrice || 0,
      notes: orderData.notes,
      paymentMethod: orderData.paymentMethod || 'NONE',
      paymentStatus: orderData.paymentStatus || 'UNPAID',
      lastStatusChange: Date.now(),
    };
    setOrders(prev => [newOrder, ...prev]);
    setActiveModule('orders');
  };

  const handleUpdateMenuItem = (id: number, updates: Partial<MenuItem>) =>
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));

  const handleAddMenuItem = (item: MenuItem) =>
    setMenuItems(prev => [item, ...prev]);

  const handleApplyGlobalDiscount = (category: string, discount: number, isPercentage: boolean) => {
    setMenuItems(prev => prev.map(item => {
      if (category === 'All' || item.category === category) {
        const newPrice = isPercentage
          ? item.oldPrice * (1 - discount / 100)
          : item.oldPrice - discount;
        return { ...item, price: Math.max(0, Math.round(newPrice)) };
      }
      return item;
    }));
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const moduleLabels: Record<string, string> = {
    orders:    'Order Board',
    'new-order': 'New Order',
    menu:      'Menu Manager',
    history:   'Order History',
    reports:   'Reports',
    settings:  'Settings',
  };

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="staff-dashboard-root">
      <DashboardSidebar activeModule={activeModule} setActiveModule={setActiveModule} pendingCount={pendingCount} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>{moduleLabels[activeModule] || activeModule}</h1>
            <p>Operational Control · {settings.restaurantName}</p>
          </div>
          <div className="header-actions">
            <div className="staff-info">
              <div className="staff-avatar" style={{ background: 'var(--ds-accent)' }}>
                <UserCircle size={20} color="#fff" />
              </div>
              <div className="staff-meta">
                <p>Staff User</p>
                <span>Operational</span>
              </div>
            </div>
            <div className="time-display">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        <section className={`dashboard-content${activeModule === 'new-order' ? ' no-scroll' : ''}`}>
          {activeModule === 'orders' && (
            <OrderBoard orders={orders} onUpdateStatus={handleUpdateOrderStatus} />
          )}
          {activeModule === 'new-order' && (
            <NewOrder
              isOpen={true}
              onClose={() => setActiveModule('orders')}
              menuItems={menuItems}
              onSubmit={handleAddNewOrder}
            />
          )}
          {activeModule === 'menu' && (
            <MenuManager
              menuItems={menuItems}
              onUpdateItem={handleUpdateMenuItem}
              onApplyGlobalDiscount={handleApplyGlobalDiscount}
              onAddItem={handleAddMenuItem}
            />
          )}
          {activeModule === 'history' && (
            <History orders={orders} />
          )}
          {activeModule === 'reports' && (
            <Analytics orders={orders} />
          )}
          {activeModule === 'settings' && (
            <Settings settings={settings} setSettings={setSettings} staff={staff} setStaff={setStaff} />
          )}
        </section>

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-bottom-nav">
          <button className={`nav-item ${activeModule === 'orders' ? 'active' : ''}`} onClick={() => setActiveModule('orders')}>
            <LayoutDashboard size={20} />
            <span>Board</span>
          </button>
          <button className={`nav-item ${activeModule === 'new-order' ? 'active' : ''}`} onClick={() => setActiveModule('new-order')}>
            <PlusSquare size={20} />
            <span>Order</span>
          </button>
          <button className={`nav-item ${activeModule === 'menu' ? 'active' : ''}`} onClick={() => setActiveModule('menu')}>
            <UtensilsCrossed size={20} />
            <span>Menu</span>
          </button>
          <button className={`nav-item ${activeModule === 'history' ? 'active' : ''}`} onClick={() => setActiveModule('history')}>
            <HistoryIcon size={20} />
            <span>History</span>
          </button>
          <button className={`nav-item ${['reports', 'settings'].includes(activeModule) ? 'active' : ''}`} onClick={() => setActiveModule('settings')}>
            <SettingsIcon size={20} />
            <span>More</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default StaffDashboard;
