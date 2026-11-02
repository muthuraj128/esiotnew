import React from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Battery,
  Wifi,
  Trees,
  RotateCw
} from 'lucide-react';
import CheckNowButton from './CheckNowButton';

export function StatusCard({
  summary,
  isTesting,
  onCheckNow,
  onRefresh
}) {
  const device = summary?.device;
  const tree = summary?.tree;
  const latestCheck = summary?.latest_check;
  const isHealthy = device?.last_tree_status !== 'UNHEALTHY';
  const isOnline = device?.is_online;

  // Format date time helper
  const formatTime = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      
      {/* Top Bar: Tree Info & Status Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: isHealthy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            padding: '1rem',
            borderRadius: '16px',
            color: isHealthy ? '#34d399' : '#f87171'
          }}>
            <Trees size={36} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: '700', color: 'var(--teal-accent)', letterSpacing: '0.05em' }}>
                {tree?.tree_code || 'TREE-001'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                {tree?.species || 'King Coconut Palm'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {tree?.name || 'Coconut Palm #1'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              📍 {tree?.location || 'East Plot - Sector 4'}
            </p>
          </div>
        </div>

        {/* Tree Health Status Badge */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            Current Health Status
          </div>
          <div className={isHealthy ? 'badge-healthy' : 'badge-unhealthy'} style={{ fontSize: '1.25rem', padding: '0.6rem 1.4rem' }}>
            {isHealthy ? <ShieldCheck size={26} /> : <AlertTriangle size={26} />}
            <span>{isHealthy ? 'HEALTHY' : 'UNHEALTHY'}</span>
          </div>
        </div>
      </div>

      {/* Grid: Status Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        {/* Metric 1: Device Info */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: '600' }}>DEVICE STATUS</span>
            <span className={isOnline ? 'badge-online' : 'badge-offline'}>
              {isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {device?.device_code || 'THM-0001'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Battery size={14} color="#34d399" /> {device?.battery_level || 96}%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Wifi size={14} color="#06b6d4" /> {device?.signal_strength || -64} dBm
            </span>
          </div>
        </div>

        {/* Metric 2: Last Check */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: '600' }}>LAST INSPECTION</span>
            <Clock size={16} color="var(--teal-accent)" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {formatTime(device?.last_check_time || latestCheck?.completed_at)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {formatDate(device?.last_check_time || latestCheck?.completed_at)} ({latestCheck?.check_type || 'MANUAL'})
          </div>
        </div>

        {/* Metric 3: Detection Response */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: '600' }}>SENSOR RESPONSE</span>
            <Activity size={16} color={isHealthy ? '#34d399' : '#f87171'} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: isHealthy ? '#34d399' : '#f87171', marginBottom: '0.25rem' }}>
            {latestCheck?.detected ? `Triggered @ ${latestCheck.detection_time}s` : (latestCheck ? `${latestCheck.duration || 30.0}s Clean Scan` : 'Awaiting Inspection')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            30-Sec Motor &amp; FSR Evaluation
          </div>
        </div>

        {/* Metric 4: Checks Completed Today */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: '600' }}>TODAY'S CHECKS</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399' }}>
              {summary?.today_checks_completed || 0} / 6
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Auto-Schedule Active
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Next check: 12:00 PM
          </div>
        </div>

      </div>

      {/* Action Footer: CHECK NOW Button & Refresh */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--emerald-main)', fontWeight: '600' }}>Trigger sequence:</span>
          <span>Web UI → Backend → MQTT → ESP32 → Motor ON (30s) → FSR Check → Motor OFF</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onRefresh}
            className="btn-secondary"
            title="Refresh Status"
            style={{ padding: '0.875rem' }}
          >
            <RotateCw size={18} />
          </button>
          <CheckNowButton isTesting={isTesting} onClick={onCheckNow} />
        </div>
      </div>

    </div>
  );
}
