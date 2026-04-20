import React, { useState } from 'react';
import { UserPlus, Save, Trash2, Bell, Shield, Globe } from 'lucide-react';
import { DashboardSettings, StaffProfile } from '../types';

interface SettingsProps {
  settings: DashboardSettings;
  setSettings: (s: DashboardSettings) => void;
  staff: StaffProfile[];
  setStaff: (s: StaffProfile[]) => void;
}

const SettingsGroup: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="settings-group">
    <div className="settings-group-header">
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(232,98,42,0.1)', color: '#E8622A' }}>
        {icon}
      </span>
      <h3>{title}</h3>
    </div>
    <div className="settings-group-body">
      {children}
    </div>
  </div>
);

const SettingsRow: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="settings-row">
    <div className="settings-label">
      <label>{label}</label>
      {hint && <span>{hint}</span>}
    </div>
    <div>{children}</div>
  </div>
);

const Settings: React.FC<SettingsProps> = ({ settings, setSettings, staff, setStaff }) => {
  const [newStaff, setNewStaff] = useState({ name: '', role: 'WAITER', pin: '' });

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.pin) return;
    const s: StaffProfile = {
      id: Math.random().toString(36).substr(2, 5),
      name: newStaff.name,
      role: newStaff.role as StaffProfile['role'],
      pin: newStaff.pin,
    };
    setStaff([...staff, s]);
    setNewStaff({ name: '', role: 'WAITER', pin: '' });
  };

  const removeStaff = (id: string) => setStaff(staff.filter(s => s.id !== id));

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 800, margin: 0 }}>Settings</h2>
        <p style={{ fontSize: '13px', color: '#78716C', margin: '4px 0 0', fontWeight: 500 }}>Configure your restaurant and staff preferences</p>
      </div>

      <div className="settings-section">
        {/* General */}
        <SettingsGroup icon={<Globe size={16} />} title="General">
          <SettingsRow label="Restaurant Name" hint="Displayed across the staff portal">
            <input
              className="dashboard-input"
              value={settings.restaurantName}
              onChange={e => setSettings({ ...settings, restaurantName: e.target.value })}
            />
          </SettingsRow>
          <SettingsRow label="Currency & Timezone" hint="Used for billing and reporting">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <select className="dashboard-input" value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                <option value="ETB">Ethiopian Birr (ETB)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
              <select className="dashboard-input" value={settings.timezone} onChange={e => setSettings({ ...settings, timezone: e.target.value })}>
                <option value="UTC+3">East Africa (UTC+3)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </SettingsRow>
        </SettingsGroup>

        {/* Staff */}
        <SettingsGroup icon={<Shield size={16} />} title="Staff Management">
          {/* Existing Staff */}
          {staff.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {staff.map(s => (
                <div key={s.id} className="staff-list-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="staff-avatar">{s.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#1C1917' }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 600 }}>
                        {s.role} <span style={{ color: '#E8622A', marginLeft: '6px' }}>PIN: {s.pin}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStaff(s.id)}
                    style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Staff Form */}
          <div className="add-staff-area">
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#78716C', marginBottom: '14px' }}>
              Register New Personnel
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '12px', marginBottom: '12px' }}>
              <input
                placeholder="Full Name"
                className="dashboard-input"
                value={newStaff.name}
                onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
              />
              <select
                className="dashboard-input"
                value={newStaff.role}
                onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
              >
                <option value="WAITER">Waiter</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="MANAGER">Manager</option>
                <option value="CASHIER">Cashier</option>
              </select>
              <input
                placeholder="4-digit PIN"
                className="dashboard-input"
                maxLength={4}
                value={newStaff.pin}
                onChange={e => setNewStaff({ ...newStaff, pin: e.target.value })}
              />
            </div>
            <button
              className="dashboard-btn primary"
              onClick={handleAddStaff}
              style={{ gap: '8px' }}
            >
              <UserPlus size={16} /> Add Staff Member
            </button>
          </div>
        </SettingsGroup>

        {/* Notifications */}
        <SettingsGroup icon={<Bell size={16} />} title="Notifications & Integrations">
          <SettingsRow label="Telegram Reports" hint="Send daily summary to your Telegram channel">
            <div
              className={`toggle-switch ${settings.autoSendReport ? 'active' : ''}`}
              onClick={() => setSettings({ ...settings, autoSendReport: !settings.autoSendReport })}
            >
              <div className="toggle-knob" />
            </div>
          </SettingsRow>

          {settings.autoSendReport && (
            <SettingsRow label="Bot Credentials" hint="Telegram Bot Token and Chat ID">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input placeholder="Bot Token" className="dashboard-input" type="password" />
                <input placeholder="Chat ID" className="dashboard-input" />
              </div>
            </SettingsRow>
          )}

          <SettingsRow label="Sound Alerts" hint="Audible notification for new orders">
            <div
              className={`toggle-switch ${settings.soundAlerts ? 'active' : ''}`}
              onClick={() => setSettings({ ...settings, soundAlerts: !settings.soundAlerts })}
            >
              <div className="toggle-knob" />
            </div>
          </SettingsRow>
        </SettingsGroup>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button className="dashboard-btn primary" style={{ padding: '14px 36px', fontSize: '15px' }}>
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
