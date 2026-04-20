import React, { useState } from 'react';
import { X, Search, Minus, Plus, ShoppingBag, MapPin, Utensils, ArrowRight, User } from 'lucide-react';
import { MenuItem } from '@/data/menuData';
import { Order, OrderItem } from '../types';

interface NewOrderProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onSubmit: (order: Partial<Order>) => void;
}

const NewOrder: React.FC<NewOrderProps> = ({ isOpen, onClose, menuItems, onSubmit }) => {
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState<'DINE-IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE-IN');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(menuItems.map(i => i.category))];

  const filteredMenu = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    return matchSearch && matchCat && item.badge !== 'OUT';
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      .filter(i => i.qty > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = () => {
    if (cart.length === 0) return;
    onSubmit({
      customerName: customerName || 'Guest',
      tableNumber: orderType === 'DINE-IN' ? tableNumber : undefined,
      type: orderType,
      items: cart,
      totalPrice: subtotal,
      orderTime: Date.now(),
      status: 'PENDING',
      paymentMethod: 'NONE',
      paymentStatus: 'UNPAID',
    });
    setCart([]); setCustomerName(''); setTableNumber('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    /* Full-height flex column that fills the .dashboard-content viewport */
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 800, margin: 0, color: '#1C1917' }}>
            Create New Order
          </h2>
          <p style={{ fontSize: '13px', color: '#78716C', margin: '3px 0 0', fontWeight: 500 }}>
            Tap dishes to add them, then fill in guest details
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F7F3EE', border: '1.5px solid #EDE8E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716C', flexShrink: 0 }}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', flex: 1, minHeight: 0 }}>

        {/* ════ LEFT PANEL: Menu Browser ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>

          {/* Search — fixed */}
          <div className="md-main-search-wrap" style={{ flexShrink: 0 }}>
            <Search size={16} className="md-search-icon" />
            <input
              type="text" className="md-main-search-input"
              placeholder="Search dishes..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="md-search-clear" onClick={() => setSearch('')}>
                <X size={11} />
              </button>
            )}
          </div>

          {/* Category pills — fixed, horizontal scroll */}
          <div
            style={{ display: 'flex', gap: '8px', overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none', paddingBottom: '2px' }}
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px', borderRadius: '50px', flexShrink: 0,
                  border: `1.5px solid ${activeCategory === cat ? '#E8622A' : '#EDE8E1'}`,
                  background: activeCategory === cat ? '#E8622A' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#78716C',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                  boxShadow: activeCategory === cat ? '0 4px 10px rgba(232,98,42,0.25)' : 'none',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Menu grid — ONLY this div scrolls ── */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              /* custom scrollbar */
              scrollbarWidth: 'thin',
              scrollbarColor: '#EDE8E1 transparent',
            }}
          >
            <div
              style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
              paddingRight: '12px',
              paddingBottom: '40px',
              }}
            >
              {filteredMenu.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#A8A29E' }}>
                  <Search size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>No items found</p>
                </div>
              )}

              {filteredMenu.map(item => {
                const inCart = cart.find(c => c.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item)}
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      border: `1.5px solid ${inCart ? '#E8622A' : '#EDE8E1'}`,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: inCart
                        ? '0 4px 14px rgba(232,98,42,0.18)'
                        : '0 1px 4px rgba(0,0,0,0.04)',
                      transform: inCart ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    {/* Image */}
                    <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative', background: '#FAF7F4' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      {inCart && (
                        <div style={{
                          position: 'absolute', top: '8px', right: '8px',
                          background: '#E8622A', color: '#fff', borderRadius: '50%',
                          width: '26px', height: '26px', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '12px', fontWeight: 800,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        }}>
                          {inCart.qty}
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '14px', fontWeight: 700,
                        marginBottom: '5px', lineHeight: 1.3, color: '#1C1917',
                      }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#E8622A' }}>
                        ETB {item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL: Order Summary ════ */}
        <div style={{
          background: '#fff', borderRadius: '20px', border: '1.5px solid #EDE8E1',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', minHeight: 0,
        }}>

          {/* Guest Details — fixed */}
          <div style={{ padding: '20px', borderBottom: '1px solid #EDE8E1', flexShrink: 0 }}>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#78716C', marginBottom: '12px' }}>
              Guest Details
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', pointerEvents: 'none' }} />
                <input
                  placeholder="Guest name (optional)" className="dashboard-input"
                  style={{ paddingLeft: '36px', fontSize: '13px' }}
                  value={customerName} onChange={e => setCustomerName(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: orderType === 'DINE-IN' ? '1fr 1fr' : '1fr', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <Utensils size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', pointerEvents: 'none', zIndex: 1 }} />
                  <select
                    className="dashboard-input" style={{ paddingLeft: '36px', fontSize: '13px' }}
                    value={orderType} onChange={e => setOrderType(e.target.value as Order['type'])}
                  >
                    <option value="DINE-IN">Dine-in</option>
                    <option value="TAKEAWAY">Takeaway</option>
                    <option value="DELIVERY">Delivery</option>
                  </select>
                </div>
                {orderType === 'DINE-IN' && (
                  <div style={{ position: 'relative' }}>
                    <MapPin size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', pointerEvents: 'none' }} />
                    <input
                      placeholder="Table #" className="dashboard-input"
                      style={{ paddingLeft: '36px', fontSize: '13px' }}
                      value={tableNumber} onChange={e => setTableNumber(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', scrollbarWidth: 'thin', scrollbarColor: '#EDE8E1 transparent' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#78716C', marginBottom: '12px' }}>
              Order Items {cart.length > 0 && <span style={{ color: '#E8622A' }}>({cart.length})</span>}
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#A8A29E' }}>
                <ShoppingBag size={36} style={{ margin: '0 auto 10px', opacity: 0.3, display: 'block' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Tap a dish to add it</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #F7F3EE' }}>
                  <img src={item.image} alt={item.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#E8622A' }}>ETB {(item.price * item.qty).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#F7F3EE', borderRadius: '8px', padding: '3px 7px', flexShrink: 0 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', display: 'flex', padding: '2px' }}><Minus size={12} /></button>
                    <span style={{ fontSize: '13px', fontWeight: 800, minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', display: 'flex', padding: '2px' }}><Plus size={12} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total + Submit — fixed */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #EDE8E1', background: '#FAF7F4', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 800, color: '#1C1917' }}>
                ETB {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <button
              className="dashboard-btn primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '13px', opacity: cart.length === 0 ? 0.5 : 1 }}
              onClick={handleSubmit}
              disabled={cart.length === 0}
            >
              Send to Kitchen <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
