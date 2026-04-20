import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  UtensilsCrossed, Heart, Bell,
  Search, Star,
  X, ShoppingBag, Check,
  Flame, Tag, Award, Coffee, MessageSquare, Package, Trash2,
  Pizza, Drumstick, Beef, Fish, Salad, CakeSlice, GlassWater, Soup, Wheat, Cherry,
  ChevronLeft, ChevronRight, MapPin, CreditCard, Loader2, AlertCircle, Phone, Mail, User
} from 'lucide-react';
import './MenuDashboard.css';

import { MenuItem, CATEGORY_TAGS, ALL_ITEMS, CHART_DATA, REVIEWS_DATA } from '@/data/menuData';
import { initializeChapaPayment, ChapaCustomer, generateTxRef, verifyChapaPayment } from '@/lib/chapaService';

// ─── Constants ─────────────────────────────────────────────────────────────────

const MAX_VISIBLE_ITEMS = 7;

// ─── Types ─────────────────────────────────────────────────────────────────────

type OrderNotif = { id: string; item: MenuItem; time: string; quantity: number; };
export interface Receipt {
  id: string;
  date: string;
  items: OrderNotif[];
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
  chapaRef?: string;
  tx_ref?: string; // Internal reference for retrying verification
}

declare global {
  interface Window {
    Chapa: {
      initialize: (options: Record<string, unknown>) => void;
    };
  }
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating, small = false }: { rating: number; small?: boolean }) {
  return (
    <span className="md-stars">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={small ? 10 : 12} fill={i <= Math.round(rating) ? '#FF6B35' : 'none'} stroke={i <= Math.round(rating) ? '#FF6B35' : '#ccc'} />
      ))}
    </span>
  );
}

// ─── Heart Button ─────────────────────────────────────────────────────────────

function HeartBtn({ itemId, favIds, onToggle }: { itemId: number; favIds: Set<number>; onToggle: (id: number) => void }) {
  const isFav = favIds.has(itemId);
  return (
    <button
      className={`md-heart-btn ${isFav ? 'active' : ''}`}
      onClick={e => { e.stopPropagation(); onToggle(itemId); }}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart size={14} fill={isFav ? '#FF6B35' : 'none'} />
    </button>
  );
}

// ─── Swipe Slider Button ─────────────────────────────────────────────────────

function SwipeSlider({ label, onComplete }: { label: string; onComplete: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const THUMB = 52;

  const getMax = useCallback(() =>
    Math.max(0, (trackRef.current?.offsetWidth ?? 300) - THUMB - 8), []);

  const moveTo = useCallback((clientX: number) => {
    if (!dragging || done) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const raw = clientX - rect.left - THUMB / 2;
    const x = Math.max(0, Math.min(raw, getMax()));
    setDragX(x);
    if (x >= getMax() * 0.82) {
      setDone(true);
      setDragging(false);
      setDragX(getMax());
      setTimeout(onComplete, 350);
    }
  }, [dragging, done, getMax, onComplete]);

  const release = useCallback(() => {
    if (!done) setDragX(0);
    setDragging(false);
  }, [done]);

  return (
    <div
      ref={trackRef}
      className={`md-swipe-track ${done ? 'done' : ''}`}
      onMouseMove={e => moveTo(e.clientX)}
      onMouseUp={release}
      onMouseLeave={release}
    >
      <div
        className="md-swipe-thumb"
        style={{ transform: `translateX(${dragX}px)`, transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
        onTouchStart={e => { e.stopPropagation(); setDragging(true); }}
        onTouchMove={e => moveTo(e.touches[0].clientX)}
        onTouchEnd={release}
      >
        {done
          ? <Check size={20} strokeWidth={3} />
          : <ChevronRight size={22} strokeWidth={2.5} />}
      </div>
      <span className="md-swipe-label">
        {done ? 'Confirmed!' : label}
      </span>
    </div>
  );
}

// ─── Payment Methods Data ─────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { id: 'chapa',     label: 'Chapa',      sub: 'All Cards & Mobile Money',        brand: 'chapa' },
  { id: 'telebirr',  label: 'TeleBirr',   sub: 'Ethio Telecom — Mobile Wallet',   brand: 'telebirr' },
  { id: 'cbebirr',   label: 'CBE Birr',   sub: 'Commercial Bank of Ethiopia',     brand: 'cbe' },
  { id: 'amole',     label: 'Amole',      sub: 'Dashen Bank Mobile Banking',      brand: 'amole' },
  { id: 'hellocash', label: 'HelloCash',  sub: 'Lion Bank Mobile Payment',        brand: 'hellocash' },
];

// ─── Customer Info Modal ──────────────────────────────────────────────────────

// ─── Orders Page ─────────────────────────────────────────────────────────────

function OrdersPage({ orders, onClear, onViewChange, onUpdateQty, history, isSuccessRedirect, onVerify }: {
  orders: OrderNotif[];
  onClear: () => void;
  onViewChange: (v: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  history: Receipt[];
  isSuccessRedirect?: boolean;
  onVerify: (id: string) => void;
}) {
  const [screen, setScreen] = useState<'cart' | 'history' | 'success'>('cart');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [payLoading, setPayLoading]     = useState(false);
  const [payError, setPayError]         = useState('');
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set(orders.map(o => o.id)));
  const [itemToRemove, setItemToRemove]   = useState<OrderNotif | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  // If orders change, ensure new items are selected by default
  useEffect(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      orders.forEach(o => {
        if (!prev.has(o.id)) next.add(o.id);
      });
      return next;
    });
  }, [orders]);

  const PROMO_CODE     = '2K5-GH65';
  const PROMO_DISCOUNT = 50;   // ETB
  const DELIVERY_FEE   = 80;   // ETB
  const TAX_AMOUNT     = 45;   // ETB

  const billingAmount = orders
    .filter(o => selectedIds.has(o.id))
    .reduce((sum, o) => sum + (o.item.price * o.quantity), 0);
  const discount      = (promoApplied && selectedIds.size > 0) ? PROMO_DISCOUNT : 0;
  const total         = billingAmount > 0 ? (billingAmount - discount + DELIVERY_FEE + TAX_AMOUNT) : 0;

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map(o => o.id)));
    }
  }

  function applyPromo() {
    setPromoApplied(promoCode.trim().toUpperCase() === PROMO_CODE);
  }

  // Sync screen state with redirect prop
  useEffect(() => {
    if (isSuccessRedirect) {
      setScreen('success');
    }
  }, [isSuccessRedirect]);
async function handlePayNow() {
  setPayLoading(true);
  setPayError('');

  try {
    const selectedOrders = orders.filter(o => selectedIds.has(o.id));
    const result = await initializeChapaPayment({
      customer: {
        firstName: 'Guest',
        lastName: 'Customer',
        email: 'guest@gmail.com',
      },
      amount: total,
      orderItems: selectedOrders.map((o) => ({
        name: o.item.name,
        qty: o.quantity,
        price: o.item.price,
      })),
    });

    localStorage.setItem('md-pending-pay', JSON.stringify({ 
      ids: Array.from(selectedIds),
      chapaRef: result.reference
    }));

    // Hard redirect to Chapa's hosted checkout page
    window.location.href = result.checkout_url;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Payment failed';
    setPayError(msg);
    setPayLoading(false);
  }
}
  // Note: Success screen is now handled by the root SuccessOverlay component
  // to avoid UI 'mixing' and allow global background blurring.

  // ── HISTORY SCREEN ──────────────────────────────────────────────────────────
  if (screen === 'history') return (
    <div className="md-full-page md-orders-page">
      <div className="md-page-header">
        <div>
          <h2 className="md-page-title">Order History</h2>
          <p className="md-page-subtitle">Your past delicious moments with Atot.</p>
        </div>
        <button className="md-btn-icon-label" onClick={() => setScreen('cart')}>
          <ShoppingBag size={16}/> Back to Cart
        </button>
      </div>

      {history.length === 0 ? (
        <div className="md-page-empty">
          <Package size={48} strokeWidth={1} style={{ marginBottom: '16px', color: '#ccc' }} />
          <h2 className="md-page-empty-title">No order history</h2>
          <p className="md-page-empty-desc">Once you complete a payment, your receipts will appear here.</p>
          <button className="md-btn-orange" onClick={() => setScreen('cart')}>View Cart</button>
        </div>
      ) : (
        <div className="md-history-list compact">
          {history.map(receipt => (
            <div key={receipt.id} className="md-history-row-item" onClick={() => setActiveReceipt(receipt)}>
              <div className="md-hist-icon">
                <div className="md-hist-icon-inner">
                  <ShoppingBag size={14} />
                </div>
              </div>
              
              <div className="md-hist-main">
                <div className="md-hist-title-row">
                  <span className="md-hist-date">{receipt.date}</span>
                  <span className="md-hist-amount">ETB {receipt.total.toFixed(2)}</span>
                </div>
                <div className="md-hist-sub-row">
                  <span className="md-hist-id">#{receipt.id.split('-').pop()}</span>
                  <span className="md-hist-dot">•</span>
                  <span className="md-hist-count">{receipt.items.length} dishes</span>
                </div>
              </div>

              <div className="md-hist-action">
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeReceipt && (
        <ReceiptModal 
          receipt={activeReceipt} 
          onClose={() => setActiveReceipt(null)} 
          onVerify={() => onVerify(activeReceipt.id)}
        />
      )}

      {itemToRemove && (
        <div className="md-overlay-blur" onClick={() => setItemToRemove(null)}>
          <div className="md-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="md-confirm-icon">
              <Trash2 size={24} color="#FF4B4B" />
            </div>
            <h3 className="md-confirm-title">Remove this dish?</h3>
            <p className="md-confirm-desc">Are you sure you want to remove <strong>{itemToRemove.item.name}</strong> from your cart?</p>
            
            <div className="md-confirm-actions">
              <button className="md-btn-confirm-cancel" onClick={() => setItemToRemove(null)}>
                Keep It
              </button>
              <button className="md-btn-confirm-delete" onClick={() => { onUpdateQty(itemToRemove.id, -1); setItemToRemove(null); }}>
                Remove Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Note: Payment screen is now bypassed for immediate checkout flow.

  // ── CART SCREEN (default) ───────────────────────────────────────────────────
  return (
    <div className="md-full-page md-orders-page">
      <div className="md-page-header">
        <div>
          <h2 className="md-page-title">My Cart</h2>
          <p className="md-page-subtitle">Review your order before checkout.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {orders.length > 0 && (
            <button className="md-btn-icon-label" onClick={toggleSelectAll}>
              {selectedIds.size === orders.length ? <><Check size={16}/> Deselect All</> : <><ShoppingBag size={16}/> Select All</>}
            </button>
          )}
          {history.length > 0 && (
            <button className="md-btn-icon-label info" onClick={() => setScreen('history')}>
              <Package size={16}/> History
            </button>
          )}
          {orders.length > 0 && (
            <button className="md-btn-icon-label" onClick={onClear}>
              <Trash2 size={16}/> Clear
            </button>
          )}
        </div>
      </div>

      {payError && (
        <div className="md-pay-error" style={{ margin: '0 24px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4b4b', background: 'rgba(255, 75, 75, 0.1)', padding: '12px', borderRadius: '12px', fontSize: '13px' }}>
          <AlertCircle size={16} />
          {payError}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="md-page-empty">
          <h2 className="md-page-empty-title">Your cart is empty</h2>
          <p className="md-page-empty-desc">Explore our magnificent menu and add your first delicious item!</p>
          <button className="md-btn-orange" onClick={() => onViewChange('menu')}>Browse Menu</button>
        </div>
      ) : (
        <div className="md-orders-layout">

          {/* Cart Items + Promo */}
          <div className="md-orders-list-wide">
            {orders.slice().reverse().map(o => (
              <div 
                key={o.id} 
                className={`md-cart-item-row ${selectedIds.has(o.id) ? 'selected' : 'unselected'}`} 
                onClick={() => toggleSelect(o.id)}
              >
                <div className="md-cart-checkbox">
                  <div className={`md-check-circle ${selectedIds.has(o.id) ? 'checked' : ''}`}>
                    {selectedIds.has(o.id) && <Check size={12} strokeWidth={4} />}
                  </div>
                </div>
                <div className="md-cart-img-wrap">
                  <img src={o.item.image} alt={o.item.name} className="md-cart-img" />
                  <span className="md-cart-qty-badge">{String(o.quantity).padStart(2, '0')}</span>
                </div>
                <div className="md-cart-info">
                  <div className="md-cart-item-name">{o.item.name}</div>
                  <div className="md-cart-item-shop">{o.item.category}</div>
                  <div className="md-cart-item-price">ETB {o.item.price}.00</div>
                </div>
                <div className="md-cart-qty-controls vertical">
                  <button
                    className="md-cart-qty-btn add circle"
                    onClick={e => { e.stopPropagation(); onUpdateQty(o.id, 1); }}
                    title="Add one more"
                  >+</button>
                  <span className="md-cart-qty-display">{String(o.quantity).padStart(2, '0')}</span>
                  <button
                    className="md-cart-qty-btn remove circle"
                    onClick={e => { 
                      e.stopPropagation(); 
                      if (o.quantity === 1) {
                        setItemToRemove(o);
                      } else {
                        onUpdateQty(o.id, -1);
                      }
                    }}
                    title="Remove one"
                  >−</button>
                </div>
              </div>
            ))}

            {/* Promo */}
            <div className="md-promo-row" onClick={e => e.stopPropagation()}>
              <Tag size={16} className="md-promo-tag-icon" />
              <input
                className="md-promo-input"
                placeholder={PROMO_CODE}
                value={promoCode}
                onChange={e => { setPromoCode(e.target.value); setPromoApplied(false); }}
                onKeyDown={e => e.key === 'Enter' && applyPromo()}
              />
              {promoApplied
                ? <span className="md-promo-confirmed"><Check size={12} strokeWidth={3} /> Promo Code Confirmed</span>
                : <button className="md-promo-apply-btn" onClick={applyPromo}>Apply</button>}
            </div>
          </div>

          {/* Billing Summary */}
          <div className="md-orders-summary-card">
            <h3 className="md-summary-title">Billing Summary</h3>
            <div className="md-billing-row">
              <span className="md-billing-label">Billing Amount</span>
              <span className="md-billing-val">ETB {billingAmount.toFixed(2)}</span>
            </div>
            <div className={`md-billing-row ${promoApplied ? 'promo' : 'muted'}`}>
              <span className="md-billing-label">Promo-code</span>
              <span className="md-billing-val">{promoApplied ? `-ETB ${PROMO_DISCOUNT.toFixed(2)}` : '—'}</span>
            </div>
            <div className="md-billing-row">
              <span className="md-billing-label">Delivery</span>
              <span className="md-billing-val">ETB {DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="md-billing-row">
              <span className="md-billing-label">Tax</span>
              <span className="md-billing-val">ETB {TAX_AMOUNT.toFixed(2)}</span>
            </div>
            <div className="md-billing-divider" />
            <div className="md-billing-total-row">
              <span className="md-billing-total-label">Total Amount</span>
              <span className="md-billing-total-val">ETB {total.toFixed(2)}</span>
            </div>
            <SwipeSlider 
              label={payLoading ? 'Redirecting to Chapa...' : selectedIds.size === 0 ? 'Select items to pay' : `Pay for ${selectedIds.size} ${selectedIds.size === 1 ? 'item' : 'items'}`} 
              onComplete={selectedIds.size > 0 ? handlePayNow : () => {}} 
            />
          </div>

        </div>
      )}
    </div>
  );
}

function FavsPage({ favItems, onSelectItem, onToggle, favIds, onViewChange, orders }: {
  favItems: MenuItem[]; onSelectItem: (i: MenuItem) => void; onToggle: (id: number) => void; favIds: Set<number>; onViewChange: (v: string) => void; orders: OrderNotif[];
}) {
  const categories = Array.from(new Set(favItems.map(i => i.category)));
  const shouldSeparate = categories.length > 4;

  return (
    <div className="md-full-page md-favs-page">
      <div className="md-page-header">
        <div>
          <h2 className="md-page-title">Favorites</h2>
          <p className="md-page-subtitle">Your personally curated collection of amazing dishes.</p>
        </div>
        <div className="md-table-badge">
          <div className="md-table-icon"><UtensilsCrossed size={10} strokeWidth={3} /></div>
          Table 12
        </div>
      </div>
      
      {favItems.length === 0 ? (
        <div className="md-page-empty">
          <h2 className="md-page-empty-title">No favorites yet</h2>
          <p className="md-page-empty-desc">Tap the heart icon on any dish to save it here for quick access later.</p>
          <button className="md-btn-orange" onClick={() => onViewChange('menu')}>Explore Menu</button>
        </div>
      ) : (
        <>
          {shouldSeparate ? (
            <div className="md-favs-sections-list">
              {categories.map(cat => {
                const itemsInCat = favItems.filter(i => i.category === cat);
                return (
                  <Section key={cat} title={cat} icon={<UtensilsCrossed size={16} />}>
                    <div className="md-grid-4">
                      {itemsInCat.map(item => (
                        <DrinkCard 
                          key={item.id} 
                          item={item} 
                          onSelect={onSelectItem} 
                          favIds={favIds} 
                          onToggleFav={onToggle} 
                          onAddOrder={() => {}} 
                          isOrdered={orders.some(o => o.item.id === item.id)}
                        />
                      ))}
                    </div>
                  </Section>
                );
              })}
            </div>
          ) : (
            <div className="md-grid-4">
              {favItems.map(item => (
                <DrinkCard 
                  key={item.id} 
                  item={item} 
                  onSelect={onSelectItem} 
                  favIds={favIds} 
                  onToggleFav={onToggle} 
                  onAddOrder={() => {}} 
                  isOrdered={orders.some(o => o.item.id === item.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function MainContent({ onSelectItem, favIds, onToggleFav, onAddOrder, orders }: {
  onSelectItem: (item: MenuItem) => void; favIds: Set<number>; onToggleFav: (id: number) => void; onAddOrder: (item: MenuItem, q: number) => void;
  orders: OrderNotif[];
}) {
  const [search, setSearch]   = useState('');
  const [activeTag, setActiveTag] = useState('All');

  const filtered = ALL_ITEMS.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
    const matchTag = activeTag === 'All' || item.category === activeTag;
    return matchSearch && matchTag;
  });

  const featured = filtered.filter(i => i.rating >= 4.7).slice(0, 4);
  const promo    = filtered.filter(i => i.badgeType === 'promo');
  const topRated = filtered.filter(i => i.orders >= 350).slice(0, 3);
  const drinks   = filtered.filter(i => i.category === 'Drinks' || i.category === 'Beverages');

  // showAll: user is searching OR has selected a specific category tag
  const showAll  = !!search || activeTag !== 'All';
  // showHero: show on specific category views, hide on "All" view
  const showHero = !search && activeTag !== 'All';

  return (
    <div className="md-main-content">
      {showHero && (
        <div className="md-hero-banner">
          <div className="md-hero-overlay" />
          <div className="md-hero-content">
            <div className="md-hero-label">Welcome to</div>
            <h1 className="md-hero-title">Atot Menu</h1>
            <p className="md-hero-sub">Where every dish tells a different story</p>
          </div>
        </div>
      )}

      <div className="md-main-search-wrap">
        <Search size={16} className="md-search-icon" />
        <input className="md-main-search-input" placeholder="Search dishes, drinks, categories..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="md-search-clear" onClick={() => setSearch('')}><X size={13}/></button>}
      </div>

      <div className="md-tag-row">
        {CATEGORY_TAGS.map(tag => (
          <button key={tag} className={`md-tag-pill ${activeTag === tag ? 'active' : ''}`} onClick={() => setActiveTag(tag)}>{tag}</button>
        ))}
      </div>

      {search && <p className="md-search-info">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong>{search}</strong>"</p>}

      {filtered.length === 0 ? (
        <div className="md-no-results">
          <UtensilsCrossed size={52} strokeWidth={1} className="md-no-results-icon" />
          <p>No items found for "<strong>{search || activeTag}</strong>"</p>
          <button className="md-btn-orange sm" onClick={() => { setSearch(''); setActiveTag('All'); }}>Clear filters</button>
        </div>
      ) : (
        <>
          {/* ─── Ordered Items Section ─── */}
          {!showAll && orders.length > 0 && (
            <Section title="Ordered Items" icon={<Package size={16} />}>
              <div className="md-grid-4">
                {Array.from(new Map(orders.map(o => [o.item.id, o.item])).values()).map(item => (
                  <MiniCard 
                    key={item.id} 
                    item={item} 
                    onSelect={onSelectItem} 
                    favIds={favIds} 
                    onToggleFav={onToggleFav} 
                    onAddOrder={onAddOrder}
                    isOrdered={true}
                  />
                ))}
              </div>
            </Section>
          )}

          {!showAll && featured.length > 0 && (
            <>
              <Section title="Featured Menu" icon={<Award size={16} />}>
                <div className="md-feat-grid-main">
                  {featured.map(item => (
                    <FeatCard 
                      key={item.id} 
                      item={item} 
                      onSelect={onSelectItem} 
                      favIds={favIds} 
                      onToggleFav={onToggleFav} 
                      onAddOrder={onAddOrder}
                      isOrdered={orders.some(o => o.item.id === item.id)}
                    />
                  ))}
                </div>
              </Section>
              <ElegantDivider />
            </>
          )}

          {!showAll && promo.length > 0 && (
            <Section title="Promos & Offers" icon={<Tag size={16} />}>
              <div className="md-promo-marquee-wrap">
                <div className="md-promo-marquee">
                  {promo.map(item => (
                    <PromoCard 
                      key={item.id} 
                      item={item} 
                      onSelect={onSelectItem} 
                      favIds={favIds} 
                      onToggleFav={onToggleFav} 
                      onAddOrder={onAddOrder}
                      isOrdered={orders.some(o => o.item.id === item.id)}
                    />
                  ))}
                </div>
              </div>
            </Section>
          )}

          {!showAll && topRated.length > 0 && (
            <Section title="Top-Rated" icon={<Flame size={16} />}>
              <div className="md-grid-3">
                {topRated.map(item => (
                  <SmallCard 
                    key={item.id} 
                    item={item} 
                    onSelect={onSelectItem} 
                    favIds={favIds} 
                    onToggleFav={onToggleFav} 
                    onAddOrder={onAddOrder}
                    isOrdered={orders.some(o => o.item.id === item.id)}
                  />
                ))}
              </div>
            </Section>
          )}

          {!showAll && drinks.length > 0 && (
            <>
              <Section title="Drinks & Beverages" icon={<Coffee size={16} />} action={<button className="md-see-all-btn" onClick={() => setActiveTag('Drinks')}>See All &gt;</button>}>
                <div className="md-grid-4">
                  {drinks.slice(0, MAX_VISIBLE_ITEMS).map(item => (
                    <DrinkCard 
                      key={item.id} 
                      item={item} 
                      onSelect={onSelectItem} 
                      favIds={favIds} 
                      onToggleFav={onToggleFav} 
                      onAddOrder={onAddOrder}
                      isOrdered={orders.some(o => o.item.id === item.id)}
                    />
                  ))}
                </div>
              </Section>
              <ElegantDivider />
            </>
          )}

          {!showAll && CATEGORY_TAGS.filter(t => t !== 'All' && t !== 'Drinks' && t !== 'Beverages').map((category, index) => {
            const allCatItems = ALL_ITEMS.filter(i => i.category === category);
            const categoryItems = allCatItems.slice(0, MAX_VISIBLE_ITEMS);
            if (categoryItems.length === 0) return null;
            return (
              <React.Fragment key={category}>
                <Section 
                  title={category} 
                  icon={<UtensilsCrossed size={16} />}
                  action={allCatItems.length > MAX_VISIBLE_ITEMS ? <button className="md-see-all-btn" onClick={() => setActiveTag(category)}>See All &gt;</button> : undefined}
                >
                  <div className="md-grid-4">
                    {categoryItems.map(item => (
                      <MiniCard 
                        key={item.id} 
                        item={item} 
                        onSelect={onSelectItem} 
                        favIds={favIds} 
                        onToggleFav={onToggleFav} 
                        onAddOrder={onAddOrder}
                        isOrdered={orders.some(o => o.item.id === item.id)}
                      />
                    ))}
                  </div>
                </Section>
                {(index + 1) % 3 === 0 && <ElegantDivider />}
              </React.Fragment>
            );
          })}

          {showAll && (
            <Section title={`${activeTag === 'All' ? 'All Results' : activeTag} (${filtered.length})`} icon={<Search size={16} />}>
              <div className="md-grid-4">
                {filtered.slice(0, MAX_VISIBLE_ITEMS).map(item => (
                  <MiniCard 
                    key={item.id} 
                    item={item} 
                    onSelect={onSelectItem} 
                    favIds={favIds} 
                    onToggleFav={onToggleFav} 
                    onAddOrder={onAddOrder}
                    isOrdered={orders.some(o => o.item.id === item.id)}
                  />
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, icon, action, children }: { title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="md-section">
      <div className="md-section-header">
        <span className="md-section-title">
          {icon && <span className="md-section-icon">{icon}</span>}
          {title}
        </span>
        {action && action}
      </div>
      {children}
    </div>
  );
}

function ElegantDivider() {
  return (
    <div className="md-elegant-divider">
      <div className="md-elegant-line"></div>
      <div className="md-elegant-dot"></div>
      <div className="md-elegant-line"></div>
    </div>
  );
}

// ─── Card Components ──────────────────────────────────────────────────────────

function FeatCard({ item, onSelect, favIds, onToggleFav, onAddOrder, isOrdered }: { item: MenuItem; onSelect: (i: MenuItem) => void; favIds: Set<number>; onToggleFav: (id: number) => void; onAddOrder: (item: MenuItem, q: number) => void; isOrdered?: boolean }) {
  return (
    <div className="md-feat-card-main" onClick={e => { e.stopPropagation(); onSelect(item); }}>
      <div className="md-feat-img-main-wrap">
        <img src={item.image} alt={item.name} className="md-feat-img-main" />
        <span className="md-pill-cat">{item.category}</span>
        <span className="md-pill-badge">{item.badge}</span>
        {isOrdered && <span className="md-pill-ordered">Ordered</span>}
        <HeartBtn itemId={item.id} favIds={favIds} onToggle={onToggleFav} />
      </div>
      <div className="md-feat-body-main">
        <div className="md-card-name">{item.name}</div>
        <div className="md-feat-desc-main">{item.description.slice(0,55)}...</div>
        <div className="md-feat-meta"><Stars rating={item.rating} small /><span className="md-feat-reviews">({item.reviews})</span></div>
        <div className="md-feat-price-row">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="md-old-price">ETB {item.oldPrice}</span>
            <span className="md-new-price large">ETB {item.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromoCard({ item, onSelect, favIds, onToggleFav, onAddOrder, isOrdered }: { item: MenuItem; onSelect: (i: MenuItem) => void; favIds: Set<number>; onToggleFav: (id: number) => void; onAddOrder: (item: MenuItem, q: number) => void; isOrdered?: boolean }) {
  return (
    <div className="md-promo-card-main" onClick={e => { e.stopPropagation(); onSelect(item); }}>
      <div className="md-promo-img-main-wrap">
        <img src={item.image} alt={item.name} className="md-promo-img-main" />
        <span className="md-pill-promo">{item.badge}</span>
        {isOrdered && <span className="md-pill-ordered">Ordered</span>}
        <HeartBtn itemId={item.id} favIds={favIds} onToggle={onToggleFav} />
      </div>
      <div className="md-promo-body-main">
        <div className="md-promo-name-main">{item.name}</div>
        <div className="md-promo-tags">{item.tags.map(t => <span key={t} className="md-inline-tag">{t}</span>)}</div>
        <div className="md-promo-price-row"><span className="md-new-price">ETB {item.price}</span><span className="md-old-price">ETB {item.oldPrice}</span></div>
      </div>
    </div>
  );
}

function SmallCard({ item, onSelect, favIds, onToggleFav, onAddOrder, isOrdered }: { item: MenuItem; onSelect: (i: MenuItem) => void; favIds: Set<number>; onToggleFav: (id: number) => void; onAddOrder: (item: MenuItem, q: number) => void; isOrdered?: boolean }) {
  return (
    <div className="md-small-card" onClick={e => { e.stopPropagation(); onSelect(item); }}>
      <div className="md-small-img-wrap">
        <img src={item.image} alt={item.name} className="md-small-img" />
        <span className="md-order-badge"><ShoppingBag size={10} /> {item.orders}</span>
        {isOrdered && <span className="md-pill-ordered">Ordered</span>}
        <HeartBtn itemId={item.id} favIds={favIds} onToggle={onToggleFav} />
      </div>
      <div className="md-small-body">
        <div className="md-small-cat">{item.category}</div>
        <div className="md-card-name">{item.name}</div>
        <div className="md-small-footer">
          <Stars rating={item.rating} small />
          <div className="md-small-price-row">
            <span className="md-new-price">ETB {item.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrinkCard({ item, onSelect, favIds, onToggleFav, onAddOrder, isOrdered }: { item: MenuItem; onSelect: (i: MenuItem) => void; favIds: Set<number>; onToggleFav: (id: number) => void; onAddOrder: (item: MenuItem, q: number) => void; isOrdered?: boolean }) {
  return (
    <div className="md-drink-card" onClick={e => { e.stopPropagation(); onSelect(item); }}>
      <div className="md-drink-card-img-wrap">
        <img src={item.image} alt={item.name} className="md-drink-card-img" />
        <span className="md-drink-card-badge">{item.category}</span>
        {isOrdered && <span className="md-pill-ordered">Ordered</span>}
        <HeartBtn itemId={item.id} favIds={favIds} onToggle={onToggleFav} />
      </div>
      <div className="md-drink-card-content">
        <div className="md-drink-card-header">
          <h4 className="md-drink-card-name">{item.name}</h4>
          <div className="md-drink-card-meta">
            <span className="md-drink-card-price">ETB {item.price}</span>
            <div className="md-drink-card-item-rating">
              <Star size={11} fill="#FF6B35" stroke="#FF6B35" />
              <span>{item.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ item, onSelect, favIds, onToggleFav, onAddOrder, isOrdered }: { item: MenuItem; onSelect: (i: MenuItem) => void; favIds: Set<number>; onToggleFav: (id: number) => void; onAddOrder: (item: MenuItem, q: number) => void; isOrdered?: boolean }) {
  return (
    <div className="md-mini-card" onClick={e => { e.stopPropagation(); onSelect(item); }}>
      <div className="md-mini-img-wrap">
        <img src={item.image} alt={item.name} className="md-mini-img" />
        <span className="md-pill-cat sm">{item.category}</span>
        {isOrdered && <span className="md-pill-ordered sm">Ordered</span>}
        <HeartBtn itemId={item.id} favIds={favIds} onToggle={onToggleFav} />
      </div>
      <div className="md-mini-body">
        <div className="md-card-name sm">{item.name}</div>
        <div className="md-mini-footer"><Stars rating={item.rating} small /><span className="md-new-price sm">ETB {item.price}</span></div>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailModal({ item, onClose, onAddOrder, favIds, onToggleFav, orders }: {
  item: MenuItem; onClose: () => void; onAddOrder: (item: MenuItem, q: number) => void;
  favIds: Set<number>; onToggleFav: (id: number) => void; orders: OrderNotif[];
}) {
  const [ordered, setOrdered] = useState(false);
  const [qty, setQty] = useState(1);
  const isPreviouslyOrdered = orders.some(o => o.item.id === item.id);
  const decreaseQty = () => setQty(q => Math.max(1, q - 1));
  const increaseQty = () => setQty(q => Math.min(20, q + 1));

  function handleOrder() {
    onAddOrder(item, qty);
    setOrdered(true);
    setTimeout(() => setOrdered(false), 3000);
  }

  const btnLabel = ordered ? <><Check size={18}/> Successfully Added</> : 
                   isPreviouslyOrdered ? `Add ${qty} more` : 
                   `Add ${qty} to Order`;

  return (
    <div className="md-modal-overlay" onClick={onClose}>
      <div className="md-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="md-modal-close" onClick={onClose}><X size={24}/></button>
        
        <div className="md-modal-single-scroll">
          <div className="md-modal-header-hero">
            <img src={item.image} alt={item.name} className="md-modal-hero-img" />
            <div className="md-modal-hero-overlay">
              <HeartBtn itemId={item.id} favIds={favIds} onToggle={onToggleFav} />
            </div>
          </div>

          <div className="md-modal-body">
            <p className="md-breadcrumb">Menu / {item.category}</p>
            <h2 className="md-modal-name">{item.name}</h2>
            
            <div className="md-modal-meta-row">
              <span className="md-modal-price">ETB {item.price}.00</span>
              <div className="md-modal-stats">
                <div className="md-stat"><Star size={16} fill="#FF6B35" stroke="#FF6B35"/><span>{item.rating}</span></div>
                <div className="md-stat"><MessageSquare size={16} /><span>{item.reviews} reviews</span></div>
              </div>
            </div>

            <div className="md-modal-content-grid">
              <div className="md-modal-info-col">
                <div className="md-modal-desc">{item.description}</div>

                <div className="md-modal-nutrition">
                  <div className="md-nutr-item">
                    <div className="md-nutr-val">{item.nutrition.calories}</div>
                    <div className="md-nutr-label">Calories</div>
                  </div>
                  <div className="md-nutr-item">
                    <div className="md-nutr-val">{item.nutrition.protein}</div>
                    <div className="md-nutr-label">Protein</div>
                  </div>
                  <div className="md-nutr-item">
                    <div className="md-nutr-val">{item.nutrition.fats}</div>
                    <div className="md-nutr-label">Fats</div>
                  </div>
                  <div className="md-nutr-item">
                    <div className="md-nutr-val">{item.nutrition.carbs}</div>
                    <div className="md-nutr-label">Carbs</div>
                  </div>
                </div>

                <div className="md-modal-ingredients">
                  <h4 className="md-modal-section-title">Ingredients</h4>
                  <div className="md-ingredient-cloud">
                    {item.ingredients.map(ing => <span key={ing} className="md-ingredient-tag">{ing}</span>)}
                  </div>
                </div>
              </div>

              <div className="md-modal-reviews-col">
                <div className="md-modal-reviews-section">
                  <h4 className="md-modal-section-title">Latest Reviews</h4>
                  <div className="md-modal-reviews-list">
                    {REVIEWS_DATA.map((r, i) => (
                      <div key={i} className="md-review-card">
                        <div className="md-review-top">
                          <div className="md-reviewer-avatar">{r.name[0]}</div>
                          <div className="md-reviewer-info">
                            <div className="md-reviewer-name">{r.name}</div>
                            <div className="md-reviewer-date">{r.date}</div>
                          </div>
                          <Stars rating={r.rating} small />
                        </div>
                        <p className="md-review-text">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md-modal-action-row">
           <div className="md-qty-controls large">
              <button className="md-qty-btn" onClick={decreaseQty}>−</button>
              <span className="md-qty-val">{qty}</span>
              <button className="md-qty-btn" onClick={increaseQty}>+</button>
           </div>
           
           <button className={`md-add-btn-large ${ordered ? 'ordered' : ''}`} onClick={handleOrder}>
              {btnLabel} — <span className="md-btn-price-large">ETB {item.price * qty}.00</span>
           </button>
        </div>
        
        {(ordered || isPreviouslyOrdered) && (
          <div className="md-already-ordered-hint">
             <Check size={16} strokeWidth={3} />
             {ordered ? "Order updated in your cart." : "This item is currently in your cart."}
          </div>
        )}
      </div>
    </div>
  );
}

function MdSidebar({ onViewChange, activeView, orderCount }: { onViewChange: (v: string) => void; activeView: string; orderCount: number; }) {
  const topNavItems = [
    { id: 'menu',   label: 'Our Menu',   icon: <UtensilsCrossed size={18} /> },
    { id: 'favs',   label: 'Favorites',  icon: <Heart size={18} /> },
  ];

  const bottomNavItem = { id: 'notifs', label: 'My Orders',  icon: <Bell size={18} />, count: orderCount };

  return (
    <div className="md-sidebar">
      <div className="md-sidebar-logo">
        <div className="md-sidebar-logo-icon">A</div>
        <span className="md-sidebar-brand">Atot</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', flex: 1 }}>
        {topNavItems.map(item => (
          <button 
            key={item.id}
            className={`md-sidebar-btn ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            title={item.label}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </div>
            <span className="md-sidebar-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div style={{ width: '100%' }}>
        <button 
          className={`md-sidebar-btn ${activeView === bottomNavItem.id ? 'active' : ''}`}
          onClick={() => onViewChange(bottomNavItem.id)}
          title={bottomNavItem.label}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {bottomNavItem.icon}
            {bottomNavItem.count !== undefined && bottomNavItem.count > 0 && (
              <span className="md-sidebar-notif-pill">{bottomNavItem.count}</span>
            )}
          </div>
          <span className="md-sidebar-label">{bottomNavItem.label}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Bottom Navigation Bar ────────────────────────────────────────────

function MobileBottomNav({ onViewChange, activeView, orderCount }: { onViewChange: (v: string) => void; activeView: string; orderCount: number; }) {
  const navItems = [
    { id: 'menu',   label: 'Menu',      icon: <UtensilsCrossed size={22} /> },
    { id: 'favs',   label: 'Favorites', icon: <Heart size={22} /> },
    { id: 'notifs', label: 'Orders',    icon: <ShoppingBag size={22} />, count: orderCount },
  ];

  return (
    <nav className="md-mobile-bottom-nav">
      <div className="md-mobile-nav-logo" onClick={() => onViewChange('menu')}>
        <span className="md-mobile-nav-logo-icon">A</span>
      </div>
      {navItems.map(item => (
        <button
          key={item.id}
          className={`md-mobile-nav-btn ${activeView === item.id ? 'active' : ''}`}
          onClick={() => onViewChange(item.id)}
        >
          <span className="md-mobile-nav-icon" style={{ position: 'relative' }}>
            {item.icon}
            {item.count !== undefined && item.count > 0 && (
              <span className="md-mobile-nav-badge">{item.count}</span>
            )}
          </span>
          <span className="md-mobile-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Receipt Modal ────────────────────────────────────────────────────────────

function ReceiptModal({ receipt, onClose, onVerify }: { receipt: Receipt; onClose: () => void; onVerify?: () => void }) {
  const billingAmount = receipt.items.reduce((sum, o) => sum + (o.item.price * o.quantity), 0);
  const DELIVERY_FEE   = 80;
  const TAX_AMOUNT     = 45;

  return (
    <div className="md-receipt-overlay" onClick={onClose}>
      <div className="md-receipt-modal" onClick={e => e.stopPropagation()}>
        <button className="md-receipt-close" onClick={onClose}><X size={20}/></button>
        
        <div className="md-receipt-content" id="printable-receipt">
          <div className="md-receipt-compact-header">
            <div className="md-receipt-logo-icon mini">A</div>
            <div className="md-receipt-brand-text">
              <h2 className="md-brand-mini">Atot</h2>
              <p className="md-subbrand-mini">Official Receipt</p>
            </div>
            <div className="md-receipt-info-grid compact">
              <div className="md-receipt-info-item">
                <span className="label">Date</span>
                <span className="val">{receipt.date}</span>
              </div>
            </div>
          </div>

          <div className="md-receipt-divider-dash" />

          <div className="md-receipt-items-list">
            {receipt.items.map(o => (
              <div key={o.id} className="md-receipt-item-row">
                <div className="md-receipt-item-info">
                  <div className="md-receipt-item-img-wrap">
                    <img src={o.item.image} alt={o.item.name} className="md-receipt-item-img" />
                  </div>
                  <div className="md-receipt-item-details">
                    <span className="name">{o.item.name}</span>
                    <span className="meta">{o.quantity} x ETB {o.item.price}</span>
                  </div>
                </div>
                <span className="md-receipt-item-total">ETB {(o.item.price * o.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="md-receipt-divider-dash" />

          <div className="md-receipt-summary">
            <div className="md-receipt-summary-row">
              <span>Subtotal</span>
              <span>ETB {billingAmount.toFixed(2)}</span>
            </div>
            <div className="md-receipt-summary-row">
              <span>Delivery Fee</span>
              <span>ETB {DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="md-receipt-summary-row">
              <span>Tax (VAT)</span>
              <span>ETB {TAX_AMOUNT.toFixed(2)}</span>
            </div>
            <div className="md-receipt-total-row">
              <span>Total Amount</span>
              <span>ETB {receipt.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="md-receipt-divider-dash" />

          <div className="md-receipt-footer compact">
            <div className="md-status-stamp mini">PAID</div>
            
            <div className="md-qr-section-unified">
              <div className="md-qr-code-wrapper">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/receipt/' + receipt.id)}`}
                  alt="Receipt QR"
                  className="md-qr-img"
                />
              </div>
              <div className="md-qr-details">
                <div className="md-qr-badge">OFFICIAL RECEIPT</div>
                <p className="md-qr-text">Scan to verify this transaction on your device.</p>
                <div className="md-receipt-actions">
                  <a 
                    href={`https://checkout.chapa.co/checkout/test-payment-receipt/${receipt.chapaRef || receipt.tx_ref}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="md-download-btn"
                  >
                    <Package size={14} /> Download PDF Receipt
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Root ─────────────────────────────────────────────────────────────────────

export default function MenuDashboard() {
  const [selected, setSelected]     = useState<MenuItem | null>(null);
  const [activeView, setActiveView] = useState('menu');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  
  // Persistent Favorites State
  const [favIds, setFavIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('md-favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Persistent Orders State
  const [orders, setOrders] = useState<OrderNotif[]>(() => {
    const saved = localStorage.getItem('md-orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistent History State
  const [orderHistory, setOrderHistory] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem('md-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [justPaid, setJustPaid] = useState(false);

  async function handleManualVerify(receiptId: string) {
    const target = orderHistory.find(r => r.id === receiptId);
    if (!target || !target.tx_ref || target.chapaRef) return;
    
    try {
      const liveRef = await verifyChapaPayment(target.tx_ref);
      if (liveRef) {
        setOrderHistory(prev => prev.map(r => 
          r.id === receiptId ? { ...r, chapaRef: liveRef } : r
        ));
        // Also update selectedReceipt if it's currently open
        if (selectedReceipt?.id === receiptId) {
          setSelectedReceipt(prev => prev ? { ...prev, chapaRef: liveRef } : null);
        }
      }
    } catch (err) {
      console.warn("Manual verification failed:", err);
    }
  }

  // Effect: Handle Chapa Redirection Success
  useEffect(() => {
    const handleVerification = async () => {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      // Multiple ways to get the reference from URL params
      const tx_ref = params.get('tx_ref') || params.get('trx_ref');
      const paramRef = params.get('reference') || params.get('id') || params.get('transaction_id');

      if (status === 'success') {
        let officialRef: string | null = paramRef;
        const pending = localStorage.getItem('md-pending-pay');
        
        try {
          // Attempt official verification if tx_ref is available
          if (tx_ref && !officialRef) {
            officialRef = await verifyChapaPayment(tx_ref);
          }
        } catch (error) {
          console.warn("Official Chapa verification failed:", error);
        }

        // If official verification failed/skipped, fallback to locally stored ref
        if (!officialRef && pending) {
          try {
            const parsed = JSON.parse(pending);
            officialRef = parsed.chapaRef;
          } catch (e) {
            console.error("Failed to parse pending payment data:", e);
          }
        }

        if (pending) {
          try {
            const { ids } = JSON.parse(pending);
            const paidOrders = orders.filter((o: OrderNotif) => ids.includes(o.id));
            
            if (paidOrders.length > 0) {
              const subtotal = paidOrders.reduce((sum, o) => sum + (o.item.price * o.quantity), 0);
              const DELIVERY_FEE = 80;
              const TAX_AMOUNT = 45;
              const total = subtotal + DELIVERY_FEE + TAX_AMOUNT;

              const newReceipt: Receipt = {
                id: `REC-${Date.now()}`,
                date: new Date().toLocaleString(),
                items: paidOrders,
                subtotal,
                discount: 0,
                delivery: DELIVERY_FEE,
                tax: TAX_AMOUNT,
                total,
                // Use the official Chapa reference (from API or local cache)
                // Do NOT fallback to tx_ref as it results in 404s on Chapa's portal
                chapaRef: officialRef || undefined,
                tx_ref: tx_ref || undefined
              };

              setOrderHistory(prev => [newReceipt, ...prev]);
              setOrders(prev => prev.filter(o => !ids.includes(o.id)));
              setJustPaid(true);
              setActiveView('notifs');
            }
          } catch (e) {
            console.error("Critical error during receipt generation:", e);
          }
          // Always clean up the pending flag once we've processed it (even if empty to prevent loops)
          localStorage.removeItem('md-pending-pay');
        }
        
        // Clean up URL parameters without refreshing
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleVerification();
  }, [orders]);

  // Effect: Save Favorites to Storage
  useEffect(() => {
    localStorage.setItem('md-favorites', JSON.stringify(Array.from(favIds)));
  }, [favIds]);

  // Effect: Save Orders to Storage
  useEffect(() => {
    localStorage.setItem('md-orders', JSON.stringify(orders));
  }, [orders]);

  // Effect: Save History to Storage
  useEffect(() => {
    localStorage.setItem('md-history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  function handleToggleFav(id: number) {
    setFavIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleAddOrder(item: MenuItem, quantity: number) {
    setOrders(prev => {
      const existingIdx = prev.findIndex(o => o.item.id === item.id);
      const now = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
      
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = { 
          ...next[existingIdx], 
          quantity: next[existingIdx].quantity + quantity,
          time: now 
        };
        return next;
      }
      
      return [...prev, {
        id: `${item.id}-${Date.now()}`,
        item,
        time: now,
        quantity,
      }];
    });
  }

  function handleUpdateQty(id: string, delta: number) {
    setOrders(prev => {
      const idx = prev.findIndex(o => o.id === id);
      if (idx === -1) return prev;
      const newQty = prev[idx].quantity + delta;
      if (newQty <= 0) return prev.filter(o => o.id !== id);
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: newQty };
      return next;
    });
  }

  function handleViewChange(v: string) {
    setActiveView(v);
    setSelected(null);
  }

  const favItems = ALL_ITEMS.filter(i => favIds.has(i.id));
  const totalOrderCount = orders.reduce((sum, o) => sum + o.quantity, 0);

  return (
    <div className="md-root">
      <MdSidebar onViewChange={handleViewChange} activeView={activeView} orderCount={totalOrderCount} />
      <div className="md-main">
        {activeView === 'menu' && (
          <div className="md-top-header">
            <div className="md-header-top-row">
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: 700, margin: 0, color: '#1A1A1A' }}>Our Menu</h2>
                <p style={{ margin: '4px 0 0', color: '#888', fontSize: '13px' }}>Explore our exquisite culinary offerings</p>
              </div>
              <div className="md-table-badge">
                <div className="md-table-icon"><UtensilsCrossed size={10} strokeWidth={3} /></div>
                Table 12
              </div>
            </div>
          </div>
        )}
        
        <div className="md-dashboard-workspace">
          {activeView === 'menu' && (
            <div className="md-content-area" onClick={() => setSelected(null)}>
              <MainContent
                onSelectItem={item => setSelected(item)}
                favIds={favIds}
                onToggleFav={handleToggleFav}
                onAddOrder={handleAddOrder}
                orders={orders}
              />
            </div>
          )}

          {activeView === 'notifs' && (
            <div className="md-content-area" onClick={() => setSelected(null)}>
              <OrdersPage
                orders={orders}
                onViewChange={handleViewChange}
                onClear={() => setOrders([])}
                onUpdateQty={handleUpdateQty}
                history={orderHistory}
                isSuccessRedirect={justPaid}
                onVerify={handleManualVerify}
              />
            </div>
          )}

          {activeView === 'favs' && (
             <div className="md-content-area" onClick={() => setSelected(null)}>
              <FavsPage
                favItems={favItems}
                onViewChange={handleViewChange}
                onSelectItem={item => setSelected(item)}
                onToggle={handleToggleFav}
                favIds={favIds}
                orders={orders}
              />
            </div>
          )}

        </div>

        {/* ─── Overlays (Item Detail) ─── */}
        {selected && (
          <DetailModal
            item={selected}
            onClose={() => setSelected(null)}
            onAddOrder={handleAddOrder}
            favIds={favIds}
            onToggleFav={handleToggleFav}
            orders={orders}
          />
        )}
      </div>

      {justPaid && (
        <SuccessOverlay 
          chapaRef={orderHistory[0]?.chapaRef}
          onHome={() => {
            setJustPaid(false);
            setActiveView('menu');
          }}
          onViewReceipt={() => {
            setJustPaid(false);
            setActiveView('history');
          }} 
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onViewChange={handleViewChange}
        activeView={activeView}
        orderCount={totalOrderCount}
      />
      {selectedReceipt && (
        <ReceiptModal 
          receipt={selectedReceipt} 
          onClose={() => setSelectedReceipt(null)} 
          onVerify={() => handleManualVerify(selectedReceipt.id)}
        />
      )}
    </div>
  );
}

function SuccessOverlay({ chapaRef, onHome, onViewReceipt }: { chapaRef?: string; onHome: () => void; onViewReceipt: () => void }) {
    return (
      <div className="md-success-global-overlay">
        <div className="md-success-sheet">
          <div className="md-success-sheet-handle" />
          <div className="md-success-circle-outer">
            <div className="md-success-circle-inner"><Check size={48} strokeWidth={4} color="#fff" /></div>
          </div>
          <h2 className="md-success-title">Payment Completed</h2>
          <p className="md-success-desc">Your transaction was successful. <br/> Thank you for your payment!</p>
          
          <div className="md-success-actions-vertical">
            <button className="md-btn-success-primary" onClick={onHome}>Go to Homepage</button>
            <button className="md-btn-success-secondary" onClick={() => onViewReceipt()}>View Receipt</button>
            
            {chapaRef && (
              <a 
                href={`https://checkout.chapa.co/checkout/test-payment-receipt/${chapaRef}`} 
                target="_blank" 
                rel="noreferrer"
                className="md-chapa-external-link"
                style={{ fontSize: '13px', textDecoration: 'underline', marginTop: '10px', display: 'block' }}
              >
                Open Official Chapa Receipt
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

