import React, { useState, useEffect } from 'react';
import { Clock, Users, ArrowRight, CheckCircle2, CreditCard, ChefHat } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderBoardProps {
  orders: Order[];
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
}

const OrderBoard: React.FC<OrderBoardProps> = ({ orders, onUpdateStatus }) => {
  const [activeLane, setActiveLane] = useState<OrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (activeLane === 'ALL') setActiveLane('PENDING');
      } else {
        setActiveLane('ALL');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const lanes: { id: OrderStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'PENDING',   label: 'Pending',     icon: <Clock size={14} />,        color: '#78716C' },
    { id: 'PREPARING', label: 'Preparing',   icon: <ChefHat size={14} />,      color: '#2563EB' },
    { id: 'READY',     label: 'Ready',       icon: <CheckCircle2 size={14} />, color: '#16A34A' },
  ];
  const paymentPendingLane = orders
    .filter(o => o.status === 'PAYMENT_PENDING')
    .sort((a, b) => a.orderTime - b.orderTime);

  const urgentPayments = paymentPendingLane.filter(o => {
    // We basically need to recalculate the status here or pass it up.
    // To keep it simple, I'll use a helper that matches the one in OrderCard.
    const limits: Record<string, number> = { 'PAYMENT_PENDING': 30 * 60 * 1000 };
    const yellowLimits: Record<string, number> = { 'PAYMENT_PENDING': 8 * 60 * 1000 };
    const elapsed = Date.now() - o.lastStatusChange;
    const remaining = limits['PAYMENT_PENDING'] - elapsed;
    return remaining <= yellowLimits['PAYMENT_PENDING'];
  });

  const hasCritical = urgentPayments.some(o => {
    const redLimit = 4 * 60 * 1000;
    const remaining = (30 * 60 * 1000) - (Date.now() - o.lastStatusChange);
    return remaining <= redLimit;
  });

  return (
    <div className="order-board-wrapper" style={{ position: 'relative', paddingBottom: urgentPayments.length > 0 ? '50px' : '0' }}>
      {/* Mobile Lane Switcher */}
      <div className="mobile-lane-switcher">
        {lanes.map(l => (
          <button
            key={l.id}
            className={`lane-tab ${activeLane === l.id ? 'active' : ''}`}
            onClick={() => setActiveLane(l.id)}
            style={{ borderColor: activeLane === l.id ? l.color : 'transparent', color: activeLane === l.id ? l.color : 'var(--ds-text-muted)' }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className={`order-board ${activeLane !== 'ALL' ? 'single-lane' : ''}`}>
        {lanes.map(lane => {
          if (activeLane !== 'ALL' && activeLane !== lane.id) return null;
          const laneOrders = orders
            .filter(o => o.status === lane.id)
            .sort((a, b) => a.orderTime - b.orderTime);
          return (
            <div key={lane.id} className="board-column">
              <div className="column-header">
                <h3 style={{ color: lane.color }}>
                  {lane.icon} {lane.label}
                </h3>
                <span className="order-count" style={{ background: lane.color }}>
                  {laneOrders.length}
                </span>
              </div>
              <div className="column-content">
                {laneOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#A8A29E' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>—</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>No orders here</div>
                  </div>
                ) : laneOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={onUpdateStatus}
                    onAction={() => {
                      if (order.status === 'PENDING')    onUpdateStatus(order.id, 'PREPARING');
                      else if (order.status === 'PREPARING') onUpdateStatus(order.id, 'READY');
                      else if (order.status === 'READY')     onUpdateStatus(order.id, 'PAYMENT_PENDING');
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <aside className="payment-sidebar">
        <div className="sidebar-collapsed-trigger">
          <CreditCard size={20} />
          <div className="sidebar-badge">{paymentPendingLane.length}</div>
        </div>
        <div className="payment-sidebar-content">
          <div className="payment-pending-section">
          <div className="column-header">
            <h3 className="priority">
              <CreditCard size={14} /> Pending Payment
            </h3>
            <span className="order-count" style={{ background: '#D97706' }}>
              {paymentPendingLane.length}
            </span>
          </div>
          <div className="payment-grid">
            {paymentPendingLane.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A8A29E' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>No pending payments</div>
              </div>
            ) : (
              paymentPendingLane.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isPayment
                  onUpdateStatus={onUpdateStatus}
                  onAction={() => onUpdateStatus(order.id, 'DELIVERED')}
                />
              ))
            )}
          </div>
          </div>
        </div>
      </aside>

      {urgentPayments.length > 0 && (
        <div className={`urgent-alert-bar ${hasCritical ? 'critical' : 'warning'}`}>
          <span>
            <CreditCard size={16} />
            {hasCritical ? 'CRITICAL:' : 'WARNING:'} {urgentPayments.length} Pending Payments require attention
          </span>
          <ArrowRight size={14} />
        </div>
      )}
    </div>
  );
};

const OrderCard: React.FC<{
  order: Order;
  onAction: () => void;
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  isPayment?: boolean;
}> = ({ order, onAction, onUpdateStatus, isPayment }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimerInfo = () => {
    const limits: Record<OrderStatus, number> = {
      'PENDING': 5 * 60 * 1000,
      'PREPARING': 40 * 60 * 1000,
      'READY': 3 * 60 * 1000,
      'PAYMENT_PENDING': 30 * 60 * 1000,
      'DELIVERED': 0
    };

    const yellowThresholds: Record<OrderStatus, number> = {
      'PENDING': 2 * 60 * 1000,
      'PREPARING': 10 * 60 * 1000,
      'READY': 1 * 60 * 1000,
      'PAYMENT_PENDING': 8 * 60 * 1000,
      'DELIVERED': 0
    };

    const redThresholds: Record<OrderStatus, number> = {
      'PENDING': 1 * 60 * 1000,
      'PREPARING': 5 * 60 * 1000,
      'READY': 30 * 1000, // 30s
      'PAYMENT_PENDING': 4 * 60 * 1000,
      'DELIVERED': 0
    };

    const maxTime = limits[order.status] || 0;
    if (maxTime === 0) return { timeStr: '--', status: '' };

    const elapsed = now - order.lastStatusChange;
    const remaining = maxTime - elapsed;
    const isOverdue = remaining < 0;

    const absRemaining = Math.abs(remaining);
    const mins = Math.floor(absRemaining / 60000);
    const secs = Math.floor((absRemaining % 60000) / 1000);
    const timeStr = `${isOverdue ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;

    let status = '';
    if (remaining <= redThresholds[order.status]) status = 'critical';
    else if (remaining <= yellowThresholds[order.status]) status = 'warning';

    return { timeStr, status };
  };

  const { timeStr, status } = getTimerInfo();
  const statusClass = order.status.toLowerCase().replace('_', '-');

  return (
    <div className={`order-card ${isPayment ? 'payment-pending compact' : statusClass} ${status}`}>
      <div className="order-card-header">
        <div>
          <div className="order-id">#{order.id}</div>
          <div className="order-table">
            {order.tableNumber ? `Table ${order.tableNumber}` : order.type}
          </div>
        </div>
        <div className={`order-timer ${status}`}>
          {timeStr}
        </div>
      </div>

      <div className="order-customer">
        <Users size={12} /> {order.customerName}
      </div>

      <ul className="order-items-list">
        {order.items.map((item, idx) => (
          <li key={idx} className="order-item-row">
            <span>{item.qty}× {item.name}</span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <div className="order-notes">📝 {order.notes}</div>
      )}

      <div className="order-card-footer">
        <div className="order-total">
          ETB {order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="order-actions">
          {order.status === 'PENDING' && (
            <button
              className="dashboard-btn-sm"
              style={{ color: '#DC2626', borderColor: 'rgba(220,38,38,0.3)', background: '#FFF5F5' }}
              onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
            >
              Reject
            </button>
          )}
          <button className="dashboard-btn-sm primary" onClick={onAction}>
            {order.status === 'PENDING'         && 'Accept'}
            {order.status === 'PREPARING'       && 'Ready'}
            {order.status === 'READY'           && 'Deliver'}
            {order.status === 'PAYMENT_PENDING' && 'Paid'}
            <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderBoard;
