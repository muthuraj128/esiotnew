import React, { useState } from 'react';
import { History, ShieldCheck, AlertTriangle, Search, Download, Calendar } from 'lucide-react';

export default function HistoryView({ history = [] }) {
  const [filterPeriod, setFilterPeriod] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = history.filter((item) => {
    const itemDate = new Date(item.completed_at || item.started_at);
    const now = new Date();

    if (filterPeriod === 'TODAY') {
      const isToday = itemDate.getDate() === now.getDate() &&
                      itemDate.getMonth() === now.getMonth() &&
                      itemDate.getFullYear() === now.getFullYear();
      if (!isToday) return false;
    } else if (filterPeriod === '7DAYS') {
      if ((now - itemDate) / (1000 * 3600 * 24) > 7) return false;
    } else if (filterPeriod === '30DAYS') {
      if ((now - itemDate) / (1000 * 3600 * 24) > 30) return false;
    }

    if (statusFilter === 'HEALTHY' && item.result !== 'HEALTHY') return false;
    if (statusFilter === 'UNHEALTHY' && item.result !== 'UNHEALTHY') return false;

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
      return new Date(isoStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            MONITORING INSPECTION LOGS
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Historical record of automated and manual tree health scans stored in Supabase PostgreSQL
          </p>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', width: '100%', maxWidth: '600px', justifyContent: 'flex-end' }}>
          
          {/* Period Pills */}
          <div style={{ display: 'flex', backgroundColor: '#EAEFE9', padding: '0.2rem', borderRadius: '8px' }}>
            {['ALL', 'TODAY', '7DAYS', '30DAYS'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                style={{
                  backgroundColor: filterPeriod === p ? 'var(--brand-primary)' : 'transparent',
                  color: filterPeriod === p ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)'
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
            className="form-select"
            style={{ width: 'auto', height: '36px', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="HEALTHY">🟢 Healthy Only</option>
            <option value="UNHEALTHY">🔴 Unhealthy Only</option>
          </select>

          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '150px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%', height: '36px', paddingLeft: '2.2rem', fontSize: '0.8rem' }}
            />
          </div>

        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="thm-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="thm-table">
            <thead>
              <tr>
                <th>DATE & TIME</th>
                <th>DEVICE / TREE</th>
                <th>TYPE</th>
                <th>RESULT</th>
                <th>DURATION</th>
                <th>DIAGNOSTIC NOTES</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No historical inspection records match the selected filter parameters.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const isH = row.result === 'HEALTHY';
                  return (
                    <tr key={row.id}>
                      
                      <td style={{ fontWeight: '600' }}>
                        <div>{formatTime(row.completed_at || row.started_at)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                          {formatDate(row.completed_at || row.started_at)}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{row.device_code || 'THM-0001'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)' }}>{row.tree_code || 'TREE-001'}</div>
                      </td>

                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: row.check_type === 'SCHEDULED' ? 'var(--bg-info-soft)' : '#F1F5F3',
                          color: row.check_type === 'SCHEDULED' ? 'var(--color-info)' : 'var(--text-primary)'
                        }}>
                          {row.check_type || 'MANUAL'}
                        </span>
                      </td>

                      <td>
                        <span className={isH ? 'badge badge-healthy' : 'badge badge-unhealthy'}>
                          {isH ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                          {row.result}
                        </span>
                      </td>

                      <td style={{ fontWeight: '700', color: isH ? 'var(--color-success)' : 'var(--color-error)' }}>
                        <div>{row.detected ? `${row.detection_time}s` : `${row.duration || 30.0}s`}</div>
                        {row.fsr_value && (
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                            FSR: {row.fsr_value}
                          </div>
                        )}
                      </td>

                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                        {row.notes || (row.detected ? `FSR threshold (> 1000) exceeded at ${row.detection_time}s. Motor turned off.` : 'Clean 30s evaluation completed (FSR <= 1000). Motor turned off.')}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
