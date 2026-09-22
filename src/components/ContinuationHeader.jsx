import React from 'react';

/**
 * ContinuationHeader — rendered at the top of every page after Page 1.
 * This is a plain React component (NOT part of the TipTap editor content),
 * so it can NEVER be accidentally deleted by the user.
 */
export default function ContinuationHeader({ subjectCode, examType }) {
  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        marginBottom: '18px',
        paddingBottom: '10px',
        borderBottom: '2px solid #000000',
        color: '#000000',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <p
        style={{
          textAlign: 'center',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#6b7280',
          margin: '0 0 3px 0',
        }}
      >
        — Continuation Sheet —
      </p>
      <p
        style={{
          textAlign: 'center',
          fontSize: '11px',
          color: '#9ca3af',
          margin: 0,
          fontWeight: '500',
        }}
      >
        {subjectCode}
        {subjectCode && examType ? ' · ' : ''}
        {examType}
      </p>
    </div>
  );
}
