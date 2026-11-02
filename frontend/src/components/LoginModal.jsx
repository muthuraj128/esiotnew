import React, { useState } from 'react';
import { Trees, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginModal({ onLogin }) {
  const [email, setEmail] = useState('demo@treehealth.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, name: 'Coconut Farmer', customerCode: 'CUST-001' });
  };

  return (
    <div className="modal-overlay" style={{ backgroundColor: '#0B1713' }}>
      <div className="modal-content" style={{ maxWidth: '420px', padding: '2.5rem', textAlign: 'center' }}>
        
        {/* Logo */}
        <div style={{
          backgroundColor: 'var(--brand-primary)',
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          border: '1px solid var(--accent-gold)',
          boxShadow: '0 6px 20px rgba(23, 107, 77, 0.3)'
        }}>
          <Trees size={28} color="#FFFFFF" />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          TREE HEALTH <span style={{ color: 'var(--accent-gold)' }}>PRO</span>
        </h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Enterprise Palm & Coconut Tree Monitoring System
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          
          <div className="form-group">
            <label className="form-label">ACCOUNT EMAIL</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', fontSize: '0.95rem' }}>
            <span>CUSTOMER SIGN IN</span>
            <ArrowRight size={16} />
          </button>

        </form>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🔒 Powered by Supabase Authentication & PostgreSQL
        </div>

      </div>
    </div>
  );
}
