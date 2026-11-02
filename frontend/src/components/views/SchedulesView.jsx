import React, { useState } from 'react';
import { Calendar, Clock, Plus, Check, Trash2, ToggleLeft, ToggleRight, Save, ShieldCheck } from 'lucide-react';

export default function SchedulesView({
  schedules = [],
  onSaveSchedules
}) {
  const [scheduleList, setScheduleList] = useState(schedules);
  const [newTime, setNewTime] = useState('14:00');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            AUTOMATED MONITORING SCHEDULES
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Configure daily automated inspection scan times dispatched via Render Backend cron
          </p>
        </div>

        <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
          {isSuccess ? <Check size={16} /> : <Save size={16} />}
          <span>{isSuccess ? 'SCHEDULES SAVED' : 'SAVE SCHEDULES'}</span>
        </button>
      </div>

      {/* Main Schedule Container */}
      <div className="thm-card">
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            DAILY INSPECTION TIMELINE
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: '700' }}>
            Active Checks: {activeCount} per day
          </span>
        </div>

        {/* Schedule Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {scheduleList.map((sch) => (
            <div
              key={sch.id}
              style={{
                backgroundColor: sch.enabled ? 'var(--bg-success-soft)' : '#FAFBFB',
                border: `1px solid ${sch.enabled ? 'var(--border-success)' : 'var(--border-color)'}`,
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Clock size={18} color={sch.enabled ? 'var(--color-success)' : 'var(--text-muted)'} />
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  fontFamily: 'var(--font-display)',
                  color: sch.enabled ? 'var(--text-primary)' : 'var(--text-muted)'
                }}>
                  {sch.time}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  onClick={() => handleToggle(sch.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: sch.enabled ? 'var(--color-success)' : 'var(--text-muted)' }}
                  title={sch.enabled ? 'Disable Schedule' : 'Enable Schedule'}
                >
                  {sch.enabled ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
                <button
                  onClick={() => handleDelete(sch.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: '0.2rem' }}
                  title="Delete Time"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Time Form */}
        <div style={{
          backgroundColor: '#FAFBFB',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Add New Check Time:
          </span>
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="form-input"
            style={{ width: '130px', height: '36px', padding: '0 0.5rem' }}
          />
          <button onClick={handleAdd} className="btn btn-secondary" style={{ height: '36px', fontSize: '0.825rem' }}>
            <Plus size={16} /> Add Time Slot
          </button>
        </div>

      </div>

    </div>
  );
}
