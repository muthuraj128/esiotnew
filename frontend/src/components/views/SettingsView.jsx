import React, { useState } from 'react';
import { User, Shield, Database, Radio, Check, Save } from 'lucide-react';

export default function SettingsView({ customer }) {
  const [activeTab, setActiveTab] = useState('account');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          PLATFORM & ACCOUNT SETTINGS
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Manage your customer profile, hardware preferences, database connections, and security
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'account', label: 'Account Profile', icon: User },
          { id: 'hardware', label: 'IoT & Telemetry', icon: Radio },
          { id: 'database', label: 'Supabase Database', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn"
              style={{
                height: '36px',
                fontSize: '0.825rem',
                backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Card */}
      <div className="thm-card" style={{ maxWidth: '680px' }}>
        
        {activeTab === 'account' && (
          <form onSubmit={handleSave}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              CUSTOMER ACCOUNT DETAILS
            </h3>

            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <input type="text" defaultValue={customer?.name || 'Coconut Farmer'} className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <input type="email" defaultValue={customer?.email || 'demo@treehealth.com'} className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">CUSTOMER ID CODE</label>
              <input type="text" value={customer?.customerCode || 'CUST-001'} disabled className="form-input" style={{ backgroundColor: '#FAFBFB', cursor: 'not-allowed' }} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {savedSuccess ? <Check size={16} /> : <Save size={16} />}
              <span>{savedSuccess ? 'CHANGES SAVED' : 'SAVE CHANGES'}</span>
            </button>
          </form>
        )}

        {activeTab === 'hardware' && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              MQTT & HARDWARE PREFERENCES
            </h3>

            <div className="form-group">
              <label className="form-label">MQTT BROKER URL</label>
              <input type="text" defaultValue="mqtt://broker.hivemq.com:1883" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">DEVICE IDENTIFIER</label>
              <input type="text" value="THM-0001" disabled className="form-input" style={{ backgroundColor: '#FAFBFB' }} />
            </div>

            <div className="form-group">
              <label className="form-label">OBSERVATION WINDOW DURATION</label>
              <input type="text" value="30.0 Seconds" disabled className="form-input" style={{ backgroundColor: '#FAFBFB' }} />
            </div>

            <div className="form-group">
              <label className="form-label">FSR UNHEALTHY THRESHOLD</label>
              <input type="text" value="> 1000 (Analog ADC)" disabled className="form-input" style={{ backgroundColor: '#FAFBFB' }} />
            </div>

            <button onClick={handleSave} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {savedSuccess ? <Check size={16} /> : <Save size={16} />}
              <span>{savedSuccess ? 'SAVED' : 'SAVE HARDWARE CONFIG'}</span>
            </button>
          </div>
        )}

        {activeTab === 'database' && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              SUPABASE POSTGRESQL INTEGRATION
            </h3>

            <div className="form-group">
              <label className="form-label">SUPABASE PROJECT URL</label>
              <input type="text" placeholder="https://your-project.supabase.co" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">SUPABASE ANON KEY</label>
              <input type="password" placeholder="eyJhbGciOiJIUzI1Ni..." className="form-input" />
            </div>

            <div style={{ backgroundColor: 'var(--bg-success-soft)', border: '1px solid var(--border-success)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-success)', marginBottom: '1.25rem' }}>
              ✓ Local Persistence mode active automatically when Supabase credentials are blank.
            </div>

            <button onClick={handleSave} className="btn btn-primary">
              {savedSuccess ? <Check size={16} /> : <Save size={16} />}
              <span>{savedSuccess ? 'SAVED' : 'SAVE SUPABASE CREDENTIALS'}</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
