import React from 'react';
import { Cpu, HelpCircle, Play, Loader2, Menu, Server, Database } from 'lucide-react';

export default function Header({
  title,
  summary,
  isBackendOnline,
  isTesting,
  onCheckNow,
  onOpenGuide,
  onToggleMobileMenu
}) {
  const isDeviceOnline = summary?.device?.is_online;
  const isDatabaseOnline = summary?.database_connected;

  return (
    <header className="header-container" style={{
      height: '70px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      boxShadow: 'var(--shadow-subtle)'
    }}>
      
      {/* Title & Mobile Hamburger Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onToggleMobileMenu}
          className="mobile-menu-btn"
          title="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.2
          }}>
            {title}
          </h1>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Target Node: <strong>{summary?.device?.device_code || 'THM-0001'}</strong></span>
          </div>
        </div>
      </div>

      {/* Real Status Badges & Action Toolbar */}
      <div className="header-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        
        {/* 1. Backend Server Status */}
        <div
          className={isBackendOnline ? 'badge badge-success' : 'badge badge-error'}
          style={{ height: '34px', fontSize: '0.7rem' }}
          title={isBackendOnline ? 'Express Backend Server Online' : 'Backend Server Offline / Disconnected'}
        >
          <Server size={13} />
          <span className="header-btn-text">{isBackendOnline ? 'Backend Connected' : 'Backend Disconnected'}</span>
        </div>

        {/* 2. Database Status */}
        <div
          className={isDatabaseOnline ? 'badge badge-success' : 'badge badge-error'}
          style={{ height: '34px', fontSize: '0.7rem' }}
          title={isDatabaseOnline ? 'Supabase Database Connected' : 'Database Disconnected'}
        >
          <Database size={13} />
          <span className="header-btn-text">{isDatabaseOnline ? 'Database Connected' : 'Database Disconnected'}</span>
        </div>

        {/* 3. ESP32 Hardware Status */}
        <div
          className={isDeviceOnline ? 'badge badge-online' : 'badge badge-offline'}
          style={{ height: '34px', fontSize: '0.7rem' }}
          title={isDeviceOnline ? 'ESP32 Hardware Connected via MQTT' : 'ESP32 Hardware Disconnected'}
        >
          <Cpu size={13} />
          <span>{isDeviceOnline ? 'ESP32 Connected' : 'ESP32 Disconnected'}</span>
        </div>

        {/* Hardware Circuit Guide Trigger */}
        <button
          onClick={onOpenGuide}
          className="btn btn-secondary"
          style={{ height: '34px', fontSize: '0.78rem', padding: '0 0.65rem' }}
          title="ESP32 Wiring & Firmware Guide"
        >
          <HelpCircle size={14} color="var(--accent-gold)" />
          <span className="header-btn-text">Guide</span>
        </button>

        {/* Primary Action Button: CHECK NOW */}
        <button
          onClick={onCheckNow}
          disabled={isTesting || !isDeviceOnline}
          className="btn btn-primary"
          style={{
            height: '34px',
            padding: '0 0.85rem',
            fontSize: '0.78rem',
            boxShadow: '0 2px 8px rgba(23, 107, 77, 0.25)'
          }}
          title={!isDeviceOnline ? 'Connect physical ESP32 to trigger inspection' : 'Trigger inspection scan'}
        >
          {isTesting ? (
            <>
              <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span className="header-btn-text">SCANNING...</span>
            </>
          ) : (
            <>
              <Play size={13} fill="#FFFFFF" />
              <span>CHECK NOW</span>
            </>
          )}
        </button>

      </div>

    </header>
  );
}
