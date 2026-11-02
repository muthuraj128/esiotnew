import React from 'react';
import { Cpu, Zap, Activity, Code2, X } from 'lucide-react';

export default function HardwareGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        
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
              ESP32 MOTOR & FSR SENSOR HARDWARE GUIDE
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Tree Health Monitor • Device THM-0001 Wiring & Protocol
            </p>
          </div>
        </div>

        {/* Pinout Table */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <table className="thm-table">
            <thead>
              <tr>
                <th>ESP32 BOARD PIN</th>
                <th>CONNECTED COMPONENT</th>
                <th>FUNCTION / PROTOCOL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: '700', color: 'var(--color-error)' }}>GPIO 18</td>
                <td>Motor Driver / Relay / MOSFET</td>
                <td><strong>Motor Power Control</strong> (Turns ON for 30s during inspection)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700', color: 'var(--color-info)' }}>GPIO 34 (ADC1)</td>
                <td>FSR (Force Sensitive Resistor)</td>
                <td><strong>Analog Pressure Input</strong> (Evaluates if value &gt; 1000)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>GPIO 2</td>
                <td>Onboard Status LED</td>
                <td>Blinks during active 30s test execution</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>GPIO 4</td>
                <td>Alarm Buzzer (+)</td>
                <td>Audible alert on UNHEALTHY detection</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>3V3 / 5V</td>
                <td>FSR &amp; Motor Supply</td>
                <td>Power Supply Rail</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>GND</td>
                <td>Sensor GND &amp; Motor Driver GND</td>
                <td>Ground Reference (with 10kΩ pull-down for FSR)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Protocol Info */}
        <div style={{ backgroundColor: '#FAFBFB', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            ⚙️ 30-Second Motor &amp; FSR Logic:
          </div>
          <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <li>When <strong>CHECK NOW</strong> is pressed, ESP32 receives command and turns <strong>ON</strong> the motor.</li>
            <li>ESP32 samples the FSR analog pin for <strong>30 seconds</strong>.</li>
            <li>If the FSR reading increases <strong>more than 1000</strong>, the scan is flagged as <strong>UNHEALTHY</strong>.</li>
            <li>If values remain <strong>&lt;= 1000</strong> throughout 30 seconds, it is evaluated as <strong>HEALTHY</strong>.</li>
            <li>After 30 seconds, ESP32 <strong>turns OFF the motor</strong> and publishes results to MQTT to save history.</li>
          </ol>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
          <div style={{ backgroundColor: '#FAFBFB', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              📚 Required Arduino Libraries:
            </div>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.1rem', lineHeight: '1.5' }}>
              <li><code>PubSubClient</code> (by Nick O'Leary)</li>
              <li><code>ArduinoJson</code> (v6 / v7)</li>
            </ul>
          </div>

          <div style={{ backgroundColor: '#FAFBFB', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              📡 MQTT Broker Details:
            </div>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.1rem', lineHeight: '1.5' }}>
              <li>Broker: <code>broker.hivemq.com</code></li>
              <li>Port: <code>1883</code></li>
            </ul>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--brand-soft-bg)', border: '1px solid var(--border-success)', padding: '0.85rem', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--brand-primary)' }}>
          <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Code2 size={16} /> ESP32 C++ Code File:
          </div>
          Located in workspace: <code>firmware/esp32_thm/esp32_thm.ino</code>
        </div>

      </div>
    </div>
  );
}
