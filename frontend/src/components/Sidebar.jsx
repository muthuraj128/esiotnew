import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Trees,
  History,
  Calendar,
  Bell,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  customer,
  onLogout,
  isOpen,
  onClose
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: Cpu, badge: '1 Active' },
    { id: 'trees', label: 'Trees', icon: Trees },
    { id: 'history', label: 'Monitoring History', icon: History },
    { id: 'schedules', label: 'Schedules', icon: Calendar },
    { id: 'alerts', label: 'Alerts', icon: Bell, badgeColor: '#C58A24' }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay backdrop for mobile slide-in drawer */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      <aside className={`thm-sidebar ${isOpen ? 'open' : ''}`} style={{
        width: '260px',
        backgroundColor: 'var(--bg-dark-surface)',
        color: 'var(--text-on-dark)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderRight: '1px solid var(--border-dark)',
        flexShrink: 0
      }}>
        
        {/* Upper Logo Area */}
        <div>
          <div style={{
            padding: '1.5rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                backgroundColor: 'var(--brand-primary)',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(200, 169, 107, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}>
                <Trees size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: '800',
                  letterSpacing: '-0.01em',
                  color: '#FFFFFF'
                }}>
                  TREE HEALTH <span style={{ color: 'var(--accent-gold)' }}>PRO</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-muted)', fontWeight: '500' }}>
                  Enterprise IoT Inspection
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="mobile-menu-btn"
              style={{ color: '#FFFFFF', border: 'none', padding: '0.2rem' }}
              title="Close Menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav style={{ padding: '1.25rem 0.75rem' }}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              color: 'var(--text-on-dark-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0 0.75rem 0.75rem 0.75rem'
            }}>
              PLATFORM
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? 'rgba(23, 107, 77, 0.4)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--accent-gold)' : '3px solid transparent',
                      color: isActive ? '#FFFFFF' : 'var(--text-on-dark-muted)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon size={18} color={isActive ? 'var(--accent-gold)' : 'currentColor'} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        backgroundColor: item.badgeColor || 'rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Lower Profile & System State Footer */}
        <div style={{
          padding: '1rem 0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'var(--bg-deep-dark)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--accent-gold)'
              }}>
                {customer?.name ? customer.name.charAt(0) : 'C'}
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: '600', color: '#FFFFFF' }}>
                  {customer?.name || 'Coconut Farmer'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-muted)' }}>
                  {customer?.customerCode || 'CUST-001'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-on-dark-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px'
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
