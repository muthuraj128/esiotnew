import React from 'react';
import { Trees, ShieldCheck, AlertTriangle, MapPin, Calendar, Cpu } from 'lucide-react';

export default function TreesView({ summary }) {
  const tree = summary?.tree;
  const device = summary?.device;
  const isHealthy = device?.last_tree_status !== 'UNHEALTHY';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          MONITORED AGRICULTURAL ASSETS
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Registered coconut and palm trees monitored by active THM IoT hardware
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        
        {/* Tree Card 1 */}
        <div className="thm-card" style={{ borderTop: `4px solid ${isHealthy ? 'var(--color-success)' : 'var(--color-error)'}` }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: isHealthy ? 'var(--bg-success-soft)' : 'var(--bg-error-soft)',
                color: isHealthy ? 'var(--color-success)' : 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trees size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  {tree?.name || 'Coconut Palm #1'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: '700' }}>
                  {tree?.tree_code || 'TREE-001'}
                </div>
              </div>
            </div>

            <span className={isHealthy ? 'badge badge-healthy' : 'badge badge-unhealthy'}>
              {isHealthy ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
              {isHealthy ? 'HEALTHY' : 'UNHEALTHY'}
            </span>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Species</span>
              <strong style={{ color: 'var(--text-primary)' }}>{tree?.species || 'King Coconut (Cocos nucifera)'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Location Plot</span>
              <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} color="var(--accent-gold)" /> {tree?.location || 'East Plot - Sector 4'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Paired Device</span>
              <span style={{ color: 'var(--brand-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Cpu size={14} /> {device?.device_code || 'THM-0001'}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
