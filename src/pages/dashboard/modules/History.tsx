import React, { useState } from 'react';
import { Calendar, CalendarDays, CalendarRange, Search, X, Clock, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import { Order } from '../types';

interface HistoryProps {
  orders: Order[];
}

type Period = 'today' | 'week' | 'month';

const History: React.FC<HistoryProps> = ({ orders }) => {
  const [period, setPeriod] = useState<Period>('today');
  const [search, setSearch] = useState('');

  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

  const now = Date.now();
  const MS_DAY   = 86400000;
  const MS_WEEK  = MS_DAY * 7;
  const MS_MONTH = MS_DAY * 30;

  const cutoff = period === 'today' ? now - MS_DAY : period === 'week' ? now - MS_WEEK : now - MS_MONTH;

  const filteredOrders = deliveredOrders.filter(o => {
    const inPeriod = o.orderTime >= cutoff;
    const matchSearch = search === '' ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.tableNumber && o.tableNumber.includes(search));
    return inPeriod && matchSearch;
  });

  const periodRevenue = filteredOrders.reduce((s, o) => s + o.totalPrice, 0);
  const periodAvg     = filteredOrders.length > 0 ? periodRevenue / filteredOrders.length : 0;

  const PERIOD_TABS: { id: Period; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today',     icon: <Calendar size={15} /> },
    { id: 'week',  label: 'This Week', icon: <CalendarDays size={15} /> },
    { id: 'month', label: 'This Month',icon: <CalendarRange size={15} /> },
  ];

  const statusBadge: Record<string, { label: string; bg: string; color: string }> = {
    DELIVERED:       { label: 'Delivered',       bg: '#F0FDF4', color: '#16A34A' },
    PENDING:         { label: 'Pending',          bg: '#F7F3EE', color: '#78716C' },
    PREPARING:       { label: 'Preparing',        bg: '#EFF6FF', color: '#2563EB' },
    READY:           { label: 'Ready',            bg: '#F0FDF4', color: '#16A34A' },
    PAYMENT_PENDING: { label: 'Awaiting Payment', bg: '#FFFBEB', color: '#D97706' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 800, margin: 0, color: '#1C1917' }}>Order History</h2>
        <p style={{ fontSize: '13px', color: '#78716C', margin: '4px 0 0', fontWeight: 500 }}>Browse completed orders by day, week or month</p>
      </div>

      {/* Period Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1.5px solid #EDE8E1', borderRadius: '16px', padding: '6px', width: 'fit-content' }}>
        {PERIOD_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setPeriod(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700,
              background: period === t.id ? '#E8622A' : 'transparent',
              color: period === t.id ? '#fff' : '#78716C',
              transition: 'all 0.2s',
              boxShadow: period === t.id ? '0 4px 12px rgba(232,98,42,0.25)' : 'none',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Orders', value: filteredOrders.length.toString(), icon: <CheckCircle2 size={20} color="#16A34A" />, bg: '#F0FDF4' },
          { label: 'Revenue', value: `ETB ${periodRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: <TrendingUp size={20} color="#E8622A" />, bg: '#FFF0EB' },
          { label: 'Avg Order', value: `ETB ${periodAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: <Users size={20} color="#2563EB" />, bg: '#EFF6FF' },
        ].map(card => (
          <div key={card.label} style={{ background: '#fff', borderRadius: '18px', border: '1px solid #EDE8E1', padding: '22px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#78716C' }}>{card.label}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 800, color: '#1C1917', lineHeight: 1.2 }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="md-main-search-wrap">
        <Search size={16} className="md-search-icon" />
        <input type="text" className="md-main-search-input" placeholder="Search by name, table, or order ID..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="md-search-clear" onClick={() => setSearch('')}><X size={11} /></button>}
      </div>

      {/* Orders Table */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #EDE8E1', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 120px 80px 140px 140px', gap: '0', borderBottom: '2px solid #EDE8E1', padding: '14px 24px', background: '#FAF7F4' }}>
          {['Order ID', 'Customer', 'Table / Type', 'Items', 'Total', 'Status'].map(h => (
            <div key={h} style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#78716C' }}>{h}</div>
          ))}
        </div>

        {/* Table Body */}
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A8A29E' }}>
            <Clock size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.25 }} />
            <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
              {deliveredOrders.length === 0 ? 'No completed orders yet' : 'No orders match this filter'}
            </p>
          </div>
        ) : (
          filteredOrders.slice().reverse().map((order, idx) => {
            const badge = statusBadge[order.status] ?? { label: order.status, bg: '#F7F3EE', color: '#78716C' };
            return (
              <div key={order.id} style={{
                display: 'grid', gridTemplateColumns: '100px 1fr 120px 80px 140px 140px',
                gap: '0', padding: '16px 24px', borderBottom: idx < filteredOrders.length - 1 ? '1px solid #F7F3EE' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF9')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#78716C', fontFamily: 'monospace' }}>#{order.id}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>
                  {order.customerName || 'Guest'}
                </div>
                <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 600 }}>
                  {order.tableNumber ? `Table ${order.tableNumber}` : order.type}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917' }}>{order.items.length}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1C1917' }}>
                  ETB {order.totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: '50px' }}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default History;
