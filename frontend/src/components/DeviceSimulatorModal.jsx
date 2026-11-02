import React, { useState } from 'react';
import { Cpu, CheckCircle2, Sliders, X } from 'lucide-react';

export default function DeviceSimulatorModal({
  isOpen,
  onClose,
  onUpdateSimulator
}) {
  const [active, setActive] = useState(false);
  const [forceUnhealthy, setForceUnhealthy] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      await onUpdateSimulator({ active, forceUnhealthy });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (e) {
      console.error('Error saving simulator settings:', e);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '2rem', position: 'relative' }}>
        
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ backgroundColor: 'var(--brand-soft-bg)', padding: '0.625rem', borderRadius: '10px', color: 'var(--brand-primary)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              ESP32 HARDWARE SIMULATOR
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Built-In MQTT Node Hardware Module • THM-0001
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#FAFBFB', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Enable Built-In Virtual Hardware
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Responds via MQTT automatically if physical ESP32 is offline.
              </div>
            </div>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
            />
          </label>

          <hr style={{ borderColor: 'var(--border-color)', margin: '0.85rem 0' }} />

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-error)' }}>
                Force Next Scan: UNHEALTHY
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Simulates FSR pressure spike (&gt; 1000) during the 30-second motor scan.
              </div>
            </div>
            <input
              type="checkbox"
              checked={forceUnhealthy}
              onChange={(e) => setForceUnhealthy(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-error)', cursor: 'pointer' }}
            />
          </label>
        </div>

        <div style={{ backgroundColor: '#F1F5F3', padding: '0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--brand-primary)', fontWeight: '700', marginBottom: '0.25rem', fontFamily: 'sans-serif' }}>
            📡 MQTT Topics Active:
          </div>
          <div>CMD: <code>devices/THM-0001/command</code></div>
          <div>RES: <code>devices/THM-0001/result</code></div>
          <div>STA: <code>devices/THM-0001/status</code></div>
        </div>

        <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%' }}>
          {saveSuccess ? <CheckCircle2 size={16} /> : <Sliders size={16} />}
          <span>{saveSuccess ? 'CONFIG APPLIED' : 'APPLY SIMULATOR CONFIG'}</span>
        </button>

      </div>
    </div>
  );
}
