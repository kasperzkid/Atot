import React, { useState } from 'react';
import { Search, Tag, Eye, EyeOff, Edit3, Save, X, Plus, LayoutGrid, Upload, Image as ImageIcon } from 'lucide-react';
import { MenuItem } from '@/data/menuData';

interface MenuManagerProps {
  menuItems: MenuItem[];
  onUpdateItem: (id: number, updates: Partial<MenuItem>) => void;
  onApplyGlobalDiscount: (category: string, discount: number, isPercentage: boolean) => void;
  onAddItem?: (item: MenuItem) => void;
}

const DEFAULT_CATEGORIES = ['Pizza', 'Chicken', 'Burgers', 'Beef', 'Pasta', 'Seafood', 'Salad', 'Rice', 'Noodles', 'Desserts', 'Beverages', 'Drinks'];

const BLANK_ITEM: Partial<MenuItem> = {
  name: '', category: 'Pizza', price: 0, oldPrice: 0, description: '',
  image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
  badge: '', badgeType: '', rating: 4.5, ingredients: [], tags: [],
  nutrition: { calories: 0, protein: '0g', fats: '0g', carbs: '0g' },
  orders: 0, reviews: 0, favorites: 0,
};

const MenuManager: React.FC<MenuManagerProps> = ({ menuItems, onUpdateItem, onApplyGlobalDiscount, onAddItem }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});
  const [discountAmount, setDiscountAmount] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({ ...BLANK_ITEM });

  const categories = ['All', ...new Set(menuItems.map(i => i.category))];

  const filteredItems = menuItems.filter(item => {
    const matchesTab = activeTab === 'All' || item.category === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const startEditing = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({ price: item.price });
  };

  const saveEdit = (id: number) => {
    onUpdateItem(id, editForm);
    setEditingId(null);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return;
    const item: MenuItem = {
      ...(BLANK_ITEM as MenuItem),
      ...newItem,
      id: Date.now(),
      oldPrice: newItem.price || 0,
    } as MenuItem;
    if (onAddItem) onAddItem(item);
    setShowAddModal(false);
    setNewItem({ ...BLANK_ITEM });
  };

  const totalCount = menuItems.length;
  const visibleCount = menuItems.filter(i => i.badge !== 'OUT').length;
  const hiddenCount = menuItems.filter(i => i.badge === 'OUT').length;

  return (
    <div className="staff-menu-root">
      {/* Hero */}
      <div className="staff-menu-hero">
        <div className="staff-menu-hero-content">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, marginBottom: '8px', fontWeight: 700 }}>
            Menu Management
          </div>
          <h1 className="staff-menu-hero-title">Cuisine Catalog</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.85, fontSize: '14px', fontWeight: 400 }}>
            Manage availability, pricing and discounts
          </p>
        </div>
      </div>

      <div className="staff-menu-container">
        {/* Stats */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Items', value: totalCount, color: '#1C1917' },
            { label: 'Available',   value: visibleCount, color: '#16A34A' },
            { label: 'Hidden',      value: hiddenCount,  color: '#DC2626' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #EDE8E1', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#78716C' }}>{s.label}</span>
              <span style={{ fontSize: '26px', fontWeight: 900, color: s.color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div className="md-main-search-wrap">
              <Search size={16} className="md-search-icon" />
              <input type="text" className="md-main-search-input" placeholder="Search menu items..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && <button className="md-search-clear" onClick={() => setSearchQuery('')}><X size={11} /></button>}
            </div>
          </div>

          {/* Bulk discount box */}
          <div style={{ background: '#fff', border: '1.5px solid #EDE8E1', borderRadius: '14px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <Tag size={15} color="#E8622A" />
            <div>
              <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#78716C' }}>Bulk Discount</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="number" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))}
                  style={{ width: '40px', border: 'none', fontWeight: 800, fontSize: '14px', outline: 'none', background: 'transparent', color: '#1C1917' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#78716C' }}>% off</span>
              </div>
            </div>
            <button className="dashboard-btn-sm primary" onClick={() => onApplyGlobalDiscount(activeTab, discountAmount, true)}>Apply</button>
          </div>

          <button className="dashboard-btn primary" style={{ flexShrink: 0 }} onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Category Pills — horizontally scrollable */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button key={cat} className={`staff-menu-tag-pill ${activeTab === cat ? 'active' : ''}`} onClick={() => setActiveTab(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="staff-menu-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="staff-menu-card">
              {item.badge === 'OUT' && (
                <div className="out-of-stock-overlay"><span>Out of Stock</span></div>
              )}
              <div className="staff-menu-card-img-wrap">
                <img src={item.image} alt={item.name} className="staff-menu-card-img" />
                <div className="card-mgmt-overlay">
                  <button
                    className={`btn-circle-mgmt ${item.badge === 'OUT' ? 'danger' : 'success'}`}
                    onClick={() => onUpdateItem(item.id, { badge: item.badge === 'OUT' ? '' : 'OUT' })}
                    title={item.badge === 'OUT' ? 'Make Available' : 'Mark Out of Stock'}
                  >
                    {item.badge === 'OUT' ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button className="btn-circle-mgmt" onClick={() => startEditing(item)} title="Edit Price">
                    <Edit3 size={15} />
                  </button>
                </div>
              </div>

              <div className="staff-menu-card-content">
                <div className="staff-menu-card-category">{item.category}</div>
                <h3 className="staff-menu-card-name">{item.name}</h3>
                {item.description && (
                  <p style={{ fontSize: '12px', color: '#78716C', lineHeight: 1.5, height: '36px', overflow: 'hidden', margin: '0 0 10px' }}>
                    {item.description}
                  </p>
                )}
                <div className="staff-menu-card-footer">
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 800, color: '#E8622A' }}>ETB</span>
                        <input type="number" autoFocus value={editForm.price}
                          onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                          style={{ width: '100%', padding: '8px 8px 8px 34px', border: '2px solid #E8622A', borderRadius: '10px', outline: 'none', fontWeight: 800, fontSize: '14px', color: '#1C1917', boxSizing: 'border-box' }} />
                      </div>
                      <button onClick={() => saveEdit(item.id)} className="btn-circle-mgmt" style={{ background: '#E8622A', color: '#fff' }}><Save size={14} /></button>
                      <button onClick={() => setEditingId(null)} className="btn-circle-mgmt danger"><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {item.oldPrice > item.price && (
                          <span style={{ fontSize: '11px', textDecoration: 'line-through', color: '#A8A29E', fontWeight: 600 }}>ETB {item.oldPrice.toLocaleString()}</span>
                        )}
                        <span className="staff-menu-price">ETB {item.price.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700,
                        color: item.badge === 'OUT' ? '#DC2626' : '#16A34A',
                        background: item.badge === 'OUT' ? '#FEF2F2' : '#F0FDF4',
                        padding: '4px 10px', borderRadius: '50px' }}>
                        <LayoutGrid size={10} />
                        {item.badge === 'OUT' ? 'Hidden' : 'Live'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Item Modal ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '28px', width: '100%', maxWidth: '560px', boxShadow: '0 30px 80px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '26px 30px', borderBottom: '1px solid #EDE8E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 800, margin: 0, color: '#1C1917' }}>Add New Menu Item</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: '#F7F3EE', border: '1.5px solid #EDE8E1', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716C' }}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Image preview */}
              <div style={{ border: '2px dashed #EDE8E1', borderRadius: '16px', overflow: 'hidden', height: '140px', position: 'relative', background: '#FAF7F4' }}>
                {newItem.image ? (
                  <img src={newItem.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#A8A29E', gap: '8px' }}>
                    <ImageIcon size={32} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Paste image URL below</span>
                  </div>
                )}
              </div>

              <input placeholder="Image URL" className="dashboard-input"
                value={newItem.image || ''}
                onChange={e => setNewItem({ ...newItem, image: e.target.value })} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <input placeholder="Item Name *" className="dashboard-input"
                    value={newItem.name || ''}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                </div>
                <select className="dashboard-input" value={newItem.category || 'Pizza'}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                  {DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Price (ETB) *" className="dashboard-input"
                  value={newItem.price || ''}
                  onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} />
              </div>

              <textarea placeholder="Description (optional)" rows={3}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #EDE8E1', borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#1C1917', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                value={newItem.description || ''}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '18px 30px', background: '#FAF7F4', borderTop: '1px solid #EDE8E1', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="dashboard-btn secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="dashboard-btn primary" onClick={handleAddItem}
                disabled={!newItem.name || !newItem.price}
                style={{ opacity: !newItem.name || !newItem.price ? 0.5 : 1 }}>
                <Plus size={15} /> Add to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
