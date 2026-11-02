import React, { useState } from 'react';
import { Calendar, Clock, Plus, Check, Trash2, ToggleLeft, ToggleRight, Save } from 'lucide-react';

export default function ScheduleSection({
  schedules = [],
  onSaveSchedules
}) {
  const [scheduleList, setScheduleList] = useState(schedules);
  const [newTime, setNewTime] = useState('14:00');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync state if props change
  React.useEffect(() => {
    if (schedules && schedules.length > 0) {
      setScheduleList(schedules);
    }
  }, [schedules]);

  const handleToggle = (id) => {
    setScheduleList(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleAdd = () => {
    if (!newTime) return;
    if (scheduleList.some(s => s.time === newTime)) return;
    const item = {
      id: 'sch-' + Date.now(),
      time: newTime,
      enabled: true
    };
    const updated = [...scheduleList, item].sort((a, b) => a.time.localeCompare(b.time));
    setScheduleList(updated);
  };

  const handleDelete = (id) => {
    setScheduleList(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSchedules(scheduleList);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to save schedules:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const activeCount = scheduleList.filter(s => s.enabled).length;

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.625rem', borderRadius: '12px', color: '#10b981' }}>
            <Calendar size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              AUTOMATED MONITORING SCHEDULE
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Backend automatically dispatches MQTT inspection commands at set times
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Active Checks: <strong style={{ color: '#34d399' }}>{activeCount} per day</strong>
          </span>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            {isSuccess ? <Check size={16} /> : <Save size={16} />}
            <span>{isSuccess ? 'SAVED' : 'SAVE SCHEDULE'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Schedule Chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {scheduleList.map((sch) => (
          <div
            key={sch.id}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              border: sch.enabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
              background: sch.enabled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color={sch.enabled ? '#34d399' : '#64748b'} />
              <span style={{ fontWeight: '700', fontSize: '1rem', color: sch.enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {sch.time}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                onClick={() => handleToggle(sch.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: sch.enabled ? '#10b981' : '#64748b' }}
                title={sch.enabled ? 'Disable' : 'Enable'}
              >
                {sch.enabled ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
              </button>
              <button
                onClick={() => handleDelete(sch.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: '0.2rem' }}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Time Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(30, 41, 59, 0.4)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Add Check Time:</span>
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            color: '#ffffff',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontFamily: 'inherit'
          }}
        />
        <button onClick={handleAdd} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          <Plus size={16} /> Add Time
        </button>
      </div>

    </div>
  );
}
