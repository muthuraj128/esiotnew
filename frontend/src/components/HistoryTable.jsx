import React, { useState } from 'react';
import { History, ShieldCheck, AlertTriangle, Filter, Search, Calendar } from 'lucide-react';

export default function HistoryTable({ history = [] }) {
  const [filterPeriod, setFilterPeriod] = useState('ALL'); // ALL, TODAY, 7DAYS, 30DAYS
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, HEALTHY, UNHEALTHY
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = history.filter((item) => {
    // Period filter
    const itemDate = new Date(item.completed_at || item.started_at);
    const now = new Date();

    if (filterPeriod === 'TODAY') {
      const isToday = itemDate.getDate() === now.getDate() &&
                      itemDate.getMonth() === now.getMonth() &&
                      itemDate.getFullYear() === now.getFullYear();
      if (!isToday) return false;
    } else if (filterPeriod === '7DAYS') {
      const diffDays = (now - itemDate) / (1000 * 3600 * 24);
      if (diffDays > 7) return false;
    } else if (filterPeriod === '30DAYS') {
      const diffDays = (now - itemDate) / (1000 * 3600 * 24);
      if (diffDays > 30) return false;
    }

    // Status filter
    if (statusFilter === 'HEALTHY' && item.result !== 'HEALTHY') return false;
    if (statusFilter === 'UNHEALTHY' && item.result !== 'UNHEALTHY') return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchType = (item.check_type || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      const matchResult = (item.result || '').toLowerCase().includes(q);
      if (!matchType && !matchNotes && !matchResult) return false;
    }

    return true;
  });

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      
      {/* Header & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.625rem', borderRadius: '12px', color: '#06b6d4' }}>
            <History size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              INSPECTION HISTORY LOG
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Complete record of automated and manual tree health scans stored in Supabase PostgreSQL
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Period Filter */}
          <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', padding: '0.25rem', border: '1px solid var(--border-subtle)' }}>
            {['ALL', 'TODAY', '7DAYS', '30DAYS'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                style={{
                  background: filterPeriod === p ? 'var(--emerald-main)' : 'none',
                  color: filterPeriod === p ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {p === '7DAYS' ? '7 Days' : p === '30DAYS' ? '30 Days' : p}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '10px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="HEALTHY">🟢 Healthy Only</option>
            <option value="UNHEALTHY">🔴 Unhealthy Only</option>
          </select>

        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.75rem 1rem' }}>DATE & TIME</th>
              <th style={{ padding: '0.75rem 1rem' }}>DEVICE & TREE</th>
              <th style={{ padding: '0.75rem 1rem' }}>SCAN TYPE</th>
              <th style={{ padding: '0.75rem 1rem' }}>RESULT</th>
              <th style={{ padding: '0.75rem 1rem' }}>DETECTION TIME</th>
              <th style={{ padding: '0.75rem 1rem' }}>NOTES / DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No inspection logs found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
                const isH = row.result === 'HEALTHY';
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                    
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <div>{formatTime(row.completed_at || row.started_at)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(row.completed_at || row.started_at)}</div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: 'var(--teal-accent)', fontWeight: '700', fontSize: '0.8rem' }}>{row.tree_code || 'TREE-001'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.device_code || 'THM-0001'}</div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: row.check_type === 'SCHEDULED' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        color: row.check_type === 'SCHEDULED' ? '#38bdf8' : '#e2e8f0',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        {row.check_type || 'MANUAL'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span className={isH ? 'badge-healthy' : 'badge-unhealthy'}>
                        {isH ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                        <span>{row.result}</span>
                      </span>
                    </td>

                    <td style={{ padding: '1rem', fontWeight: '700', color: isH ? '#34d399' : '#f87171' }}>
                      <div>{row.detected ? `${row.detection_time}s` : `${row.duration || 30.0}s (Clean)`}</div>
                      {row.fsr_value && (
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                          FSR: {row.fsr_value}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      {row.notes || (row.detected ? `FSR threshold (> 1000) exceeded at ${row.detection_time}s. Motor turned off.` : '30-second scan completed under 1000 threshold. Motor turned off.')}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
