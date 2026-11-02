import React from 'react';
import { Cpu, Wifi, Battery, Radio, CheckCircle2, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default function DevicesView({
  summary,
  onOpenGuide
}) {
  const device = summary?.device;
  const isOnline = device?.is_online;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            REGISTERED HARDWARE NODES
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Physical ESP32 microcontrollers assigned to your tree assets
          </p>
        </div>

        <button onClick={onOpenGuide} className="btn btn-secondary">
          <HelpCircleIcon size={16} /> Hardware Wiring Guide
        </button>
      </div>

      {/* Main Device Grid Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        
        {/* Device 1: THM-0001 */}
        <div className="thm-card" style={{ borderTop: `4px solid ${isOnline ? 'var(--brand-primary)' : 'var(--color-error)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--brand-soft-bg)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Cpu size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  {device?.device_code || 'THM-0001'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Assigned Tree: <strong>{summary?.tree?.tree_code || 'TREE-001'}</strong>
                </div>
              </div>
            </div>

            <span className={isOnline ? 'badge badge-online' : 'badge badge-offline'}>
              ● {isOnline ? 'ONLINE' : 'DISCONNECTED'}
            </span>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />

          {/* Device Telemetry Rows */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: '#FAFBFB', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                BATTERY LEVEL
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: isOnline ? 'var(--brand-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Battery size={16} /> {isOnline && device?.battery_level ? `${device.battery_level}%` : 'N/A'}
              </div>
            </div>

            <div style={{ backgroundColor: '#FAFBFB', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                WI-FI SIGNAL
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wifi size={16} color="var(--accent-gold)" /> {isOnline && device?.signal_strength ? `${device.signal_strength} dBm` : 'N/A'}
              </div>
            </div>

            <div style={{ backgroundColor: '#FAFBFB', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                FIRMWARE
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {device?.firmware_version || 'v2.0.0-FSR'}
              </div>
            </div>

            <div style={{ backgroundColor: '#FAFBFB', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                SENSOR PROTOCOL
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--brand-primary)' }}>
                Motor (GPIO 18) &amp; FSR (GPIO 34)
              </div>
            </div>
          </div>

          <button onClick={onOpenGuide} className="btn btn-secondary" style={{ width: '100%', height: '38px', fontSize: '0.825rem' }}>
            <Radio size={14} /> View Wiring &amp; MQTT Schema
          </button>
        </div>

      </div>

      {/* MQTT Channel Info */}
      <div className="thm-card" style={{ backgroundColor: '#FAFBFB' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          📡 ENTERPRISE MQTT PROTOCOL MAP
        </h3>
        <div className="table-responsive">
          <table className="thm-table" style={{ background: '#FFFFFF', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <thead>
              <tr>
                <th>CHANNEL DIRECTION</th>
                <th>MQTT TOPIC STRING</th>
                <th>QOS LEVEL</th>
                <th>PAYLOAD CONTENT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Backend → ESP32</td>
                <td><code>devices/THM-0001/command</code></td>
                <td>QoS 1</td>
                <td><code>{"{\"action\":\"START_TEST\"}"}</code></td>
              </tr>
              <tr>
                <td>ESP32 → Backend</td>
                <td><code>devices/THM-0001/result</code></td>
                <td>QoS 1</td>
                <td><code>{"{\"device_id\":\"THM-0001\",\"result\":\"HEALTHY\",\"detected\":false,\"duration\":30.0,\"fsr_value\":420}"}</code></td>
              </tr>
              <tr>
                <td>ESP32 → Backend</td>
                <td><code>devices/THM-0001/status</code></td>
                <td>QoS 0</td>
                <td><code>{"{\"device_id\":\"THM-0001\",\"online\":true,\"motor_status\":\"OFF\",\"fsr_baseline\":210}"}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function HelpCircleIcon({ size = 16 }) {
  return <Radio size={size} />;
}
