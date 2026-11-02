import React from 'react';
import { Play, Loader2 } from 'lucide-react';

export default function CheckNowButton({ isTesting, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={isTesting}
      className="btn-primary"
      style={{
        padding: '0.875rem 2rem',
        fontSize: '1.05rem',
        letterSpacing: '0.02em',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isTesting ? (
        <>
          <Loader2 className="animate-spin" size={22} style={{ animation: 'spin 1s linear infinite' }} />
          <span>INSPECTION RUNNING...</span>
        </>
      ) : (
        <>
          <Play size={20} fill="#ffffff" />
          <span>CHECK NOW</span>
        </>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
