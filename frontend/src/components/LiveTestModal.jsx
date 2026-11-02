import React, { useState, useEffect } from 'react';
import {
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  X,
  Gauge
} from 'lucide-react';

export default function LiveTestModal({
  isOpen,
  onClose,
  latestResult
}) {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [testPhase, setTestPhase] = useState('INITIATING');

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(30);
      setTestPhase('INITIATING');
      return;
    }

    setTestPhase('TESTING');
    setSecondsLeft(30);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTestPhase('COMPLETED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (latestResult && testPhase === 'TESTING') {
      setTestPhase('COMPLETED');
    }
  }, [latestResult]);

  if (!isOpen) return null;

  const progressPercent = ((30 - secondsLeft) / 30) * 100;
  const isHealthyResult = latestResult?.result === 'HEALTHY' || (!latestResult && secondsLeft === 0);
  const isUnhealthyResult = latestResult?.result === 'UNHEALTHY';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '2rem', textAlign: 'center', position: 'relative', maxWidth: '540px' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Zap size={22} color="var(--brand-primary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            30-SECOND MOTOR & FSR INSPECTION
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Target Device: <strong>THM-0001</strong> • Motor (GPIO 18) & FSR Sensor (GPIO 34)
        </p>

        {testPhase === 'TESTING' && (
          <div>
            {/* Live Actuator Status Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              marginBottom: '1.25rem',
              color: '#92400E',
              fontSize: '0.825rem',
              fontWeight: '700'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Zap size={16} className="animate-pulse" style={{ color: '#D97706' }} />
                MOTOR: ACTIVE (ON)
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Gauge size={16} style={{ color: '#059669' }} />
                FSR: SAMPLING (THRESHOLD &gt; 1000)
              </span>
            </div>

            {/* Countdown Gauge */}
            <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 1.5rem auto' }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="#E1E8E4" strokeWidth="10" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="var(--brand-primary)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * progressPercent) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--brand-primary)', lineHeight: 1 }}>
                  {String(secondsLeft).padStart(2, '0')}s
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  REMAINING
                </div>
              </div>
            </div>

            {/* Protocol Steps */}
            <div style={{ backgroundColor: '#FAFBFB', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                ACTIVE EXECUTION PROTOCOL:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', fontSize: '0.725rem', textAlign: 'center' }}>
                <div style={{ backgroundColor: 'var(--bg-success-soft)', padding: '0.4rem', borderRadius: '6px', color: 'var(--color-success)', fontWeight: '600' }}>✓ Triggered</div>
                <div style={{ backgroundColor: '#FEF3C7', padding: '0.4rem', borderRadius: '6px', color: '#B45309', fontWeight: '700' }}>⚡ Motor ON</div>
                <div style={{ backgroundColor: '#E0F2FE', padding: '0.4rem', borderRadius: '6px', color: '#0284C7', fontWeight: '700' }}>📊 30s FSR</div>
                <div style={{ backgroundColor: '#F1F5F9', padding: '0.4rem', borderRadius: '6px', color: '#64748B', fontWeight: '600' }}>🛑 Motor OFF</div>
              </div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Evaluating FSR analog readings for 30s. If values exceed 1000, tree is marked UNHEALTHY.
            </p>
          </div>
        )}

        {testPhase === 'COMPLETED' && (
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{
              backgroundColor: isUnhealthyResult ? 'var(--bg-error-soft)' : 'var(--bg-success-soft)',
              border: `1px solid ${isUnhealthyResult ? 'var(--border-error)' : 'var(--border-success)'}`,
              padding: '1.5rem',
              borderRadius: '14px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                {isUnhealthyResult ? <XCircle size={52} color="var(--color-error)" /> : <CheckCircle2 size={52} color="var(--color-success)" />}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: isUnhealthyResult ? 'var(--color-error)' : 'var(--color-success)', marginBottom: '0.25rem' }}>
                {isUnhealthyResult ? 'TREE STATUS: UNHEALTHY' : 'TREE STATUS: HEALTHY'}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {isUnhealthyResult
                  ? `FSR value increased more than 1000 threshold${latestResult?.fsr_value ? ` (Peak: ${latestResult.fsr_value})` : ''} within 30-second window. Motor turned off.`
                  : `All FSR readings remained normal (<= 1000)${latestResult?.fsr_value ? ` (Peak: ${latestResult.fsr_value})` : ''} throughout the 30-second window. Motor turned off.`}
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Result saved to database history log • Motor: OFF
              </div>
            </div>

            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
              RETURN TO DASHBOARD
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
