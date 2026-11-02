import React from 'react';
import { Bell, AlertTriangle, ShieldCheck, Cpu, Info, CheckCircle2 } from 'lucide-react';

export default function AlertsView({ summary, history = [] }) {
  const device = summary?.device;
  const isOnline = device?.is_online;

  // Build real alerts from actual system state and real inspection history records
  const alerts = [];

  // 1. Device hardware status alert
  if (device) {
    if (isOnline) {
      alerts.push({
        id: 'alt-device-online',
        title: 'ESP32 Hardware Connected',
        message: `${device.device_code || 'THM-0001'} is connected online via MQTT. Motor & FSR ready.`,
        time: device.last_seen ? new Date(device.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
        type: 'SYSTEM',
        icon: Cpu,
        color: 'var(--brand-primary)'
      });
    } else {
      alerts.push({
        id: 'alt-device-offline',
        title: 'ESP32 Hardware Disconnected',
        message: `${device.device_code || 'THM-0001'} is currently offline. Connect ESP32 to power/WiFi to run live scans.`,
        time: 'Live',
        type: 'WARNING',
        icon: AlertTriangle,
        color: 'var(--color-error)'
      });
    }
  }

  // 2. Real alerts from history
  history.slice(0, 5).forEach((record) => {
    const isHealthy = record.result === 'HEALTHY';
    alerts.push({
      id: 'alt-record-' + record.id,
      title: isHealthy ? `Inspection Passed: HEALTHY (${record.check_type || 'MANUAL'})` : `ALERT: UNHEALTHY Tree Detected (${record.check_type || 'MANUAL'})`,
      message: record.notes || (isHealthy 
        ? '30-second inspection completed cleanly with FSR value <= 1000.' 
        : `FSR reading increased more than 1000 threshold at ${record.detection_time || '0'}s!`),
      time: record.completed_at ? new Date(record.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      type: isHealthy ? 'INFO' : 'ALERT',
      icon: isHealthy ? ShieldCheck : AlertTriangle,
      color: isHealthy ? 'var(--color-success)' : 'var(--color-error)'
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          SYSTEM ADVISORIES & ALERTS
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Real-time hardware notifications, threshold triggers, and device telemetry
        </p>
      </div>

      <div className="thm-card" style={{ padding: 0, overflow: 'hidden' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No Advisories Recorded Yet
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Run a hardware inspection on the dashboard to generate live advisories and records.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {alerts.map((alert, idx) => {
              const Icon = alert.icon;
              return (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem 1.5rem',
                    borderBottom: idx < alerts.length - 1 ? '1px solid #EEF2EF' : 'none'
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: alert.type === 'ALERT' 
                      ? 'var(--bg-error-soft)' 
                      : (alert.type === 'INFO' ? 'var(--bg-success-soft)' : 'var(--bg-info-soft)'),
                    color: alert.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={20} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {alert.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{alert.time}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
