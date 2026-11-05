import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Clock,
  Activity,
  Battery,
  Wifi,
  Trees,
  ArrowUpRight,
  Play,
  RotateCw,
  XCircle,
  CheckCircle2,
  Database,
  Server
} from 'lucide-react';

export default function DashboardView({
  summary,
  isTesting,
  onCheckNow,
  onRefresh,
  onNavigate,
  onResetStatus
}) {
  const device = summary?.device;
  const tree = summary?.tree;
  const latestCheck = summary?.latest_check;
  
  const isOnline = device?.is_online;
  const isDbConnected = summary?.database_connected;
  
  // Tree Health Status: ONLY from real scan results. null = no scan ever run.
  const currentStatus = latestCheck?.result || device?.last_tree_status || null;
  const hasEverScanned = currentStatus !== null;
  const isUnhealthy = currentStatus === 'UNHEALTHY';
  const isHealthy = currentStatus === 'HEALTHY';

  const peakFsr = latestCheck?.fsr_value ?? device?.last_fsr_value ?? null;
  const scanTime = latestCheck?.completed_at || device?.last_check_time || null;
  const detectionTime = latestCheck?.detection_time ?? null;

  const formatTime = (isoStr) => {
    if (!isoStr) return 'No inspection recorded';
    try {
      return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'No inspection recorded';
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      return new Date(isoStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* LIVE SCANNING BANNER (Direct in-dashboard progress without intrusive popup) */}
      {isTesting && (
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          color: '#92400E',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <RotateCw className="animate-spin" size={24} color="#D97706" />
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                🚀 30-Second Hardware Inspection in Progress...
              </div>
              <div style={{ fontSize: '0.8rem', color: '#B45309', marginTop: '0.2rem' }}>
                ESP32 motor active • Sampling FSR pressure sensor • Dashboard will update directly upon completion
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: '#D97706',
            color: '#FFFFFF',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.04em'
          }}>
            SAMPLING ACTIVE
          </div>
        </div>
      )}

      {/* SECTION 1: SYSTEM STATE METRIC CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1rem'
      }}>
        
        {/* Metric 1: TREE HEALTH STATUS */}
        <div className="thm-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TREE HEALTH STATUS
            </span>
            <span className={!hasEverScanned ? 'badge badge-neutral' : (isHealthy ? 'badge badge-healthy' : 'badge badge-unhealthy')}>
              {!hasEverScanned ? <Clock size={14} /> : (isHealthy ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />)}
              {!hasEverScanned ? 'AWAITING SCAN' : (isHealthy ? 'HEALTHY' : 'UNHEALTHY')}
            </span>
          </div>

          <div style={{
            fontSize: '1.65rem',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            color: !hasEverScanned ? 'var(--text-muted)' : (isHealthy ? 'var(--color-success)' : 'var(--color-error)'),
            marginBottom: '0.25rem',
            letterSpacing: '-0.02em'
          }}>
            {!hasEverScanned ? 'NO SCAN YET' : (isHealthy ? 'HEALTHY' : 'UNHEALTHY')}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {!hasEverScanned
              ? 'Press CHECK NOW to run first inspection'
              : (isHealthy
                ? `Normal Peak FSR: ${peakFsr} (Stable <= 1000)`
                : `⚠️ Alert Peak FSR: ${peakFsr} (Exceeded 1000 threshold)`)}
          </div>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #EEF2EF', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasEverScanned ? `Last scan: ${formatTime(scanTime)}` : 'No inspection recorded yet'}
          </div>
        </div>

        {/* Metric 2: ESP32 HARDWARE TELEMETRY */}
        <div className="thm-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ESP32 HARDWARE
            </span>
            <span className={isOnline ? 'badge badge-online' : 'badge badge-offline'}>
              ● {isOnline ? 'ONLINE' : 'DISCONNECTED'}
            </span>
          </div>

          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            marginBottom: '0.25rem'
          }}>
            {device?.device_code || 'THM-0001'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Battery size={14} color="var(--brand-primary)" /> {device?.battery_level ? `${device.battery_level}%` : '100%'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Wifi size={14} color="var(--accent-gold)" /> {device?.signal_strength ? `${device.signal_strength} dBm` : '-44 dBm'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand-primary)', fontWeight: '600' }}>
              <Activity size={14} /> Live FSR: {device?.live_fsr !== undefined && device?.live_fsr !== null ? device.live_fsr : 'Sampling'}
            </span>
          </div>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #EEF2EF', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Firmware: {device?.firmware_version || 'v2.0.0-FSR'}
          </div>
        </div>

        {/* Metric 3: LAST INSPECTION SCAN */}
        <div className="thm-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              LAST INSPECTION SCAN
            </span>
            <Clock size={16} color="var(--brand-primary)" />
          </div>

          <div style={{
            fontSize: '1.4rem',
            fontWeight: '700',
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            marginBottom: '0.25rem'
          }}>
            {hasEverScanned ? formatTime(scanTime) : '— : —'}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {hasEverScanned
              ? `${formatDate(scanTime)} (${latestCheck?.check_type || 'MANUAL'})`
              : 'No inspection run yet'}
          </div>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #EEF2EF', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasEverScanned
              ? (isUnhealthy
                  ? `Peak FSR: ${peakFsr} at ${detectionTime}s (UNHEALTHY)`
                  : `Peak FSR: ${peakFsr} (Clean 30s scan - HEALTHY)`)
              : 'Press CHECK NOW to begin first scan'}
          </div>
        </div>

        {/* Metric 4: DATABASE & SCHEDULE */}
        <div className="thm-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              DATABASE STATUS
            </span>
            <span className={isDbConnected ? 'badge badge-success' : 'badge badge-error'}>
              <Database size={12} /> {isDbConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            marginBottom: '0.25rem'
          }}>
            {summary?.today_checks_completed || 0} Scans Today
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {summary?.history_count || 0} Total Logs Recorded
          </div>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #EEF2EF', fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: '600' }}>
            {summary?.schedules?.some(s => s.enabled)
              ? `Schedules Active`
              : 'No auto-schedules active'}
          </div>
        </div>

      </div>

      {/* SECTION 2: PRIMARY INSPECTION & TREE FOCUS */}
      <div className="dashboard-grid-two-col" style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.25rem'
      }}>
        
        {/* Main Tree Focus Card */}
        <div className="thm-card" style={{ padding: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: !isOnline ? '#F1F5F3' : (isHealthy ? 'var(--bg-success-soft)' : 'var(--bg-error-soft)'),
                border: `1px solid ${!isOnline ? 'var(--border-color)' : (isHealthy ? 'var(--border-success)' : 'var(--border-error)')}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: !isOnline ? 'var(--text-muted)' : (isHealthy ? 'var(--color-success)' : 'var(--color-error)'),
                flexShrink: 0
              }}>
                <Trees size={26} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  MONITORED ASSET • {tree?.tree_code || 'TREE-001'}
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  {tree?.name || 'Coconut Palm #1'}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {tree?.species || 'King Coconut (Cocos nucifera)'} • {tree?.location || 'East Plot - Sector 4'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isUnhealthy && (
                <button
                  onClick={onResetStatus}
                  className="btn btn-secondary"
                  style={{
                    padding: '0 0.75rem',
                    height: '34px',
                    fontSize: '0.78rem',
                    color: 'var(--color-success)',
                    borderColor: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  title="Mark tree as Healthy / Clear Alert"
                >
                  <CheckCircle2 size={14} color="var(--color-success)" />
                  <span>Mark Healthy</span>
                </button>
              )}
              <button onClick={onRefresh} className="btn btn-secondary" style={{ padding: '0 0.75rem', height: '34px' }} title="Refresh System Status">
                <RotateCw size={15} />
              </button>
            </div>
          </div>

          {/* Diagnostic Report Panel */}
          <div style={{
            backgroundColor: '#FAFBFB',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              DIAGNOSTIC STATUS & HARDWARE REPORT
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              {!hasEverScanned
                ? 'No inspection has been run yet. Connect the ESP32 device and press RUN HARDWARE INSPECTION to begin your first 30-second FSR evaluation.'
                : (isUnhealthy
                  ? `FSR reading increased more than 1000 threshold (Peak FSR: ${peakFsr}) during the 30-second motor evaluation window. Tree structural status is evaluated as UNHEALTHY.`
                  : `30-second inspection completed cleanly with motor active. All FSR readings remained normal (Peak FSR: ${peakFsr}). Tree health condition is HEALTHY.`)}
            </p>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Hardware Node: <strong>{device?.device_code || 'THM-0001'}</strong> ({isOnline ? '🟢 Connected' : '⚪ Standby'})
            </div>

            <button
              onClick={onCheckNow}
              disabled={isTesting}
              className="btn btn-primary"
              style={{
                height: '42px',
                padding: '0 1.25rem',
                width: '100%',
                maxWidth: '240px',
                opacity: isTesting ? 0.8 : 1
              }}
            >
              {isTesting ? (
                <>
                  <RotateCw size={15} className="animate-spin" />
                  <span>SCANNING (30s)...</span>
                </>
              ) : (
                <>
                  <Play size={15} fill="#FFFFFF" />
                  <span>RUN HARDWARE INSPECTION</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* System Overview Sidebar Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="thm-card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              SYSTEM CONNECTIONS
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EEF2EF', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>ESP32 Hardware</span>
                <span style={{ color: isOnline ? 'var(--color-success)' : 'var(--color-error)', fontWeight: '700' }}>
                  {isOnline ? '🟢 Connected' : '🔴 Disconnected'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EEF2EF', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Database</span>
                <span style={{ color: isDbConnected ? 'var(--color-success)' : 'var(--color-error)', fontWeight: '700' }}>
                  {isDbConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EEF2EF', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>MQTT Broker</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--brand-primary)' }}>broker.hivemq.com</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('history')}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '1rem', height: '36px', fontSize: '0.78rem' }}
            >
              <span>View History Logs</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
