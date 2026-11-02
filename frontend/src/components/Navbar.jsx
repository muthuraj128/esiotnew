import React from 'react';
import { Trees, Cpu, Database, HelpCircle, LogOut, User, Radio } from 'lucide-react';

export default function Navbar({
  customer,
  device,
  onOpenGuide,
  onOpenSimulator,
  onLogout
}) {
  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 16px 16px', borderTop: 'none', padding: '1rem 2rem', marginBottom: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}>
            <Trees size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TREE HEALTH MONITOR
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              Coconut & Palm IoT Inspection System
            </p>
          </div>
        </div>

        {/* System Quick Badges & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Device Online Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '0.4rem 0.85rem',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.825rem'
          }}>
            <span className={`pulse-dot ${device?.is_online ? 'online' : ''}`} style={{ backgroundColor: device?.is_online ? '#10b981' : '#64748b' }}></span>
            <span style={{ fontWeight: '600', color: device?.is_online ? '#34d399' : '#94a3b8' }}>
              {device?.device_code || 'THM-0001'}: {device?.is_online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Simulator Toggle Button */}
          <button
            onClick={onOpenSimulator}
            className="btn-secondary"
            title="Configure ESP32 Simulator"
            style={{ fontSize: '0.825rem', padding: '0.4rem 0.85rem' }}
          >
            <Cpu size={16} color="#06b6d4" />
            <span>Simulator</span>
          </button>

          {/* ESP32 Hardware Guide Button */}
          <button
            onClick={onOpenGuide}
            className="btn-secondary"
            title="ESP32 Circuit & Code Guide"
            style={{ fontSize: '0.825rem', padding: '0.4rem 0.85rem' }}
          >
            <HelpCircle size={16} color="#34d399" />
            <span>Hardware Guide</span>
          </button>

          {/* User Profile / Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-subtle)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: '700', color: 'var(--text-primary)' }}>{customer?.name || 'Customer CUST-001'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{customer?.email || 'demo@treehealth.com'}</div>
            </div>
            <button
              onClick={onLogout}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.6rem', color: '#f87171' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
