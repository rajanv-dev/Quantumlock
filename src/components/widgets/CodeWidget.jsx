import React, { useState } from 'react';

export const CodeWidget = ({ stage }) => {
  const [copied, setCopied] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  const rawLines = stage?.codeLines || [];
  const lines = Array.isArray(rawLines)
    ? rawLines
    : typeof rawLines === 'string'
    ? rawLines.split('\n')
    : [];

  if (lines.length === 0) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="code-container"
      style={{
        background: 'linear-gradient(180deg, rgba(3, 12, 7, 0.95) 0%, rgba(1, 5, 3, 0.98) 100%)',
        border: '1px solid rgba(0, 255, 102, 0.35)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 0 25px rgba(0, 255, 102, 0.12), 0 10px 30px rgba(0, 0, 0, 0.8)'
      }}
    >
      <div style={{
        background: 'linear-gradient(90deg, rgba(0, 255, 102, 0.12), rgba(0, 229, 255, 0.05), transparent)',
        padding: '10px 16px',
        borderBottom: '1px solid rgba(0, 255, 102, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--doom-green)',
            boxShadow: '0 0 8px var(--doom-green)',
            display: 'inline-block'
          }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--doom-green-bright)', fontFamily: 'var(--font-mono)', fontWeight: 'bold', letterSpacing: '0.1em' }}>
            DOOM LOGIC & CODE INSPECTOR // EXECUTION STATE
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="btn btn--ghost btn--sm"
          style={{ fontSize: '0.72rem', padding: '3px 10px', color: 'var(--doom-green-bright)', borderColor: 'rgba(0,255,102,0.3)' }}
        >
          {copied ? 'COPIED' : 'COPY TRACE'}
        </button>
      </div>

      <div className="code-block" style={{ margin: 0, border: 'none', background: 'transparent', padding: '14px 0', overflowX: 'auto' }}>
        {lines.map((line, idx) => {
          const isSelected = selectedLine === idx;

          return (
            <div
              key={idx}
              onClick={() => setSelectedLine(isSelected ? null : idx)}
              style={{
                display: 'flex',
                padding: '4px 16px',
                background: isSelected ? 'rgba(0, 255, 102, 0.15)' : 'transparent',
                borderLeft: isSelected ? '3px solid var(--doom-green)' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                minWidth: 'fit-content'
              }}
            >
              <span style={{ width: '38px', color: 'var(--ink-faint)', userSelect: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', flexShrink: 0 }}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span style={{
                color: isSelected ? 'var(--doom-green-bright)' : '#7df5ab',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.96rem',
                whiteSpace: 'pre',
                lineHeight: '1.45'
              }}>
                {line}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        padding: '8px 16px',
        borderTop: '1px solid rgba(0, 255, 102, 0.15)',
        fontSize: '0.72rem',
        color: 'var(--ink-faint)',
        fontFamily: 'var(--font-mono)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>▸ CLICK ANY LINE TO PIN OR FOCUS SYSTEM POINTER</span>
        <span style={{ color: 'var(--doom-green)' }}>{lines.length} TRACE LINES</span>
      </div>
    </div>
  );
};
