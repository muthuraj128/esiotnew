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
  Database,
  Server
} from 'lucide-react';

export default function DashboardView({
  summary,
  isTesting,
  onCheckNow,
  onRefresh,
  onNavigate
}) {
  const device = summary?.device;
  const tree = summary?.tree;
  const latestCheck = summary?.latest_check;
  
  const isOnline = device?.is_online;
  const isDbConnected = summary?.database_connected;
  
  const treeStatus = device?.last_tree_status;
  const hasChecked = latestCheck && (treeStatus === 'HEALTHY' || treeStatus === 'UNHEALTHY');
  const isHealthy = treeStatus === 'HEALTHY';
  const isUnhealthy = treeStatus === 'UNHEALTHY';

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
            {hasChecked ? (
              <span className={isHealthy ? 'badge badge-healthy' : 'badge badge-unhealthy'}>
                {isHealthy ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                {isHealthy ? 'HEALTHY' : 'UNHEALTHY'}
              </span>
            ) : (
              <span className="badge badge-offline">
                ● NOT INSPECTED
              </span>
            )}
          </div>

          <div style={{
            fontSize: '1.65rem',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            color: hasChecked ? (isHealthy ? 'var(--color-success)' : 'var(--color-error)') : 'var(--text-muted)',
            marginBottom: '0.25rem',
            letterSpacing: '-0.02em'
          }}>
            {!isOnline ? 'DISCONNECTED' : (hasChecked ? (isHealthy ? 'HEALTHY' : 'UNHEALTHY') : 'AWAITING SCAN')}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {!isOnline
              ? 'ESP32 hardware disconnected'
              : (hasChecked
                ? (isHealthy
                  ? `Normal Peak FSR: ${latestCheck?.fsr_value ?? '<= 1000'}`
                  : `⚠️ Alert Peak FSR: ${latestCheck?.fsr_value ?? '> 1000'} (Exceeded 1000)`)
                : 'Connect device & run first inspection')}
          </div>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #EEF2EF', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Last scan: {formatTime(device?.last_check_time || latestCheck?.completed_at)}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Battery size={14} color="var(--brand-primary)" /> {isOnline && device?.battery_level ? `${device.battery_level}%` : 'N/A'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Wifi size={14} color="var(--accent-gold)" /> {isOnline && device?.signal_strength ? `${device.signal_strength} dBm` : 'N/A'}
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
            color: latestCheck ? 'var(--text-primary)' : 'var(--text-muted)',
            marginBottom: '0.25rem'
          }}>
            {latestCheck ? formatTime(latestCheck.completed_at) : 'No Scan Recorded'}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {latestCheck ? `${formatDate(latestCheck.completed_at)} (${latestCheck.check_type || 'MANUAL'})` : 'Awaiting hardware check'}
          </div>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #EEF2EF', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Response: {latestCheck ? (latestCheck.detected ? `Peak FSR: ${latestCheck.fsr_value ?? '> 1000'} at ${latestCheck.detection_time}s` : `Peak FSR: ${latestCheck.fsr_value ?? '<= 1000'} (Clean scan)`) : 'N/A'}
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
            Automated Schedules Configured
          </div>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #EEF2EF', fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: '600' }}>
            Next schedule: 12:00 PM
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

            <button onClick={onRefresh} className="btn btn-secondary" style={{ padding: '0 0.75rem' }} title="Refresh System Status">
              <RotateCw size={15} />
            </button>
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
              {!isOnline
                ? 'ESP32 hardware device (THM-0001) is currently disconnected. Power on your physical ESP32 board to transmit telemetry and perform scans.'
                : (hasChecked
                  ? (isHealthy
                    ? `30-second inspection completed cleanly with motor active. All FSR readings remained normal (Peak FSR: ${latestCheck?.fsr_value ?? '<= 1000'}). Tree health condition is healthy.`
                    : `FSR reading increased more than 1000 threshold (Peak FSR: ${latestCheck?.fsr_value ?? '> 1000'}) during the 30-second motor evaluation window. Tree is evaluated as UNHEALTHY.`)
                  : 'ESP32 hardware is connected online. Click RUN HARDWARE INSPECTION below to trigger the 30-second motor and FSR scan.')}
            </p>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Hardware Node: <strong>{device?.device_code || 'THM-0001'}</strong> ({isOnline ? '🟢 Connected' : '🔴 Disconnected'})
            </div>

            <button
              onClick={onCheckNow}
              disabled={isTesting || !isOnline}
              className="btn btn-primary"
              style={{ height: '42px', padding: '0 1.25rem', width: '100%', maxWidth: '240px' }}
            >
              <Play size={15} fill="#FFFFFF" />
              <span>RUN HARDWARE INSPECTION</span>
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
