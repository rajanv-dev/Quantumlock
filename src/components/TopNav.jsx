import React from 'react';
import {
  IconLightbulb,
  IconCross,
  IconTerminal
} from './CyberIcons';

export const TopNav = ({
  timerString,
  isWarning,
  sessionLabel,
  isPaused,
  isExpired,
  progressPct,
  evidenceCount,
  onOpenEvidence,
  onOpenHint,
  onOpenLeaderboard,
  onLogout,
  teamName,
}) => {
  return (
    <header className="top-nav">
      <div className="top-nav__brand">
        <IconTerminal size={14} color="#00FF9C" style={{ marginRight: '8px' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: '#E8F5EE', letterSpacing: '0.08em', fontWeight: '800' }}>
          &gt; AIDEX '26
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#00FF9C', marginLeft: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          MISSION CONTROL
        </span>
        {teamName && (
          <span style={{ marginLeft: '14px', background: 'rgba(0,255,156,0.1)', border: '1px solid rgba(0,255,156,0.3)', padding: '2px 8px', borderRadius: '4px', color: '#00FF9C', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '700', letterSpacing: '0.04em' }}>
            CALLSIGN: {teamName.toUpperCase()}
          </span>
        )}
      </div>

      <div className={`top-nav__timer ${isWarning ? 'is-warning' : ''}`} id="topnav-timer">
        {sessionLabel && (
          <span style={{
            fontSize: '0.78rem',
            letterSpacing: '0.06em',
            color: isWarning ? '#FF4D5A' : '#9BAFA5',
            marginRight: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            {sessionLabel.toUpperCase()}
          </span>
        )}
        <span className="top-nav__timer-value" id="game-countdown" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: '700', color: isWarning ? '#FF4D5A' : '#00FF9C', letterSpacing: '0.06em', textShadow: isWarning ? '0 0 10px rgba(255,77,90,0.6)' : '0 0 10px rgba(0,255,156,0.5)' }}>
          ● {isPaused ? `${timerString} (PAUSED)` : (isExpired ? '00:00 (LOCKED)' : timerString)}
        </span>
      </div>

      <div className="top-nav__progress-bar">
        <div className="top-nav__progress-fill" id="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="top-nav__actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {onOpenHint && (
          <button
            id="btn-open-hints-nav"
            className="btn btn--ghost btn--sm"
            style={{ borderColor: 'rgba(240,180,41,0.4)', color: '#F0B429', display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '5px 10px' }}
            title="Open Decryption Hints"
            onClick={onOpenHint}
          >
            <IconLightbulb size={13} color="#F0B429" />
            <span>[ HINTS ]</span>
          </button>
        )}
        <button id="btn-open-evidence" className="btn btn--ghost btn--sm" style={{ borderColor: 'rgba(0,255,156,0.3)', color: '#00FF9C', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '5px 10px' }} title="Open evidence database" onClick={onOpenEvidence}>
          [ EVIDENCE <span className="badge" id="evidence-count" style={{ marginLeft: '4px', background: 'rgba(0,255,156,0.18)', border: '1px solid rgba(0,255,156,0.4)', color: '#00FF9C', padding: '1px 6px', borderRadius: '3px', fontSize: '0.72rem' }}>{String(evidenceCount).padStart(2, '0')}</span> ]
        </button>

        {onLogout && (
          <button
            id="btn-logout-nav"
            className="btn btn--ghost btn--sm"
            style={{ borderColor: 'rgba(255, 77, 90, 0.4)', color: '#FF4D5A', display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '5px 10px' }}
            title="Sign out operative team"
            onClick={onLogout}
          >
            <IconCross size={12} color="#FF4D5A" />
            <span>[ LOG OUT ]</span>
          </button>
        )}
      </div>
    </header>
  );
};
