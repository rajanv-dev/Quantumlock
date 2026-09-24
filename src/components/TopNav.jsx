import React from 'react';
import {
  IconLightbulb,
  IconVolume,
  IconVolumeMute,
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
  soundOn,
  onToggleSound,
  onOpenLeaderboard,
  onLogout,
  teamName,
}) => {
  return (
    <header className="top-nav">
      <div className="top-nav__brand">
        <IconTerminal size={14} color="var(--doom-gold-bright)" style={{ marginRight: '6px' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#E8F5EE', letterSpacing: '0.02em' }}>
          AIDEX '26
        </span>
        <span style={{ fontSize: '0.8rem', color: '#9BAFA5', marginLeft: '6px' }}>
          Mission Control
        </span>
        {teamName && (
          <span style={{ marginLeft: '12px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '2px 8px', borderRadius: '4px', color: '#F0B429', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
            Callsign: {teamName}
          </span>
        )}
      </div>

      <div className={`top-nav__timer ${isWarning ? 'is-warning' : ''}`} id="topnav-timer">
        {sessionLabel && (
          <span style={{
            fontSize: '0.75rem',
            letterSpacing: '0.03em',
            color: isWarning ? '#FF4D5A' : '#9BAFA5',
            marginRight: '8px',
            fontFamily: 'var(--font-mono)',
            fontWeight: '600'
          }}>
            Session {sessionLabel.replace(/SESSION\s*/i, '')}
          </span>
        )}
        <span className="top-nav__timer-value" id="game-countdown">
          {isPaused ? `${timerString} (Paused)` : (isExpired ? '00:00 (Locked)' : timerString)}
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
            style={{ borderColor: 'rgba(240,180,41,0.4)', color: '#F0B429', display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'none', letterSpacing: '0.03em' }}
            title="Open Decryption Hints"
            onClick={onOpenHint}
          >
            <IconLightbulb size={13} color="#F0B429" />
            <span>Hints</span>
          </button>
        )}
        <button id="btn-open-evidence" className="btn btn--ghost btn--sm" style={{ textTransform: 'none', letterSpacing: '0.03em' }} title="Open evidence database" onClick={onOpenEvidence}>
          Evidence <span className="badge" id="evidence-count" style={{ marginLeft: '4px', background: 'rgba(0,255,156,0.12)', border: '1px solid rgba(0,255,156,0.3)', color: '#00FF9C', padding: '1px 6px', borderRadius: '3px', fontSize: '0.7rem' }}>{evidenceCount}</span>
        </button>

        <button
          id="btn-sound-toggle-2"
          className="btn btn--ghost btn--sm"
          aria-pressed={soundOn}
          title="Toggle sound"
          onClick={onToggleSound}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'none', letterSpacing: '0.03em' }}
        >
          {soundOn ? <IconVolume size={13} color="#00FF9C" /> : <IconVolumeMute size={13} />}
          <span>Sound</span>
        </button>

        {onLogout && (
          <button
            id="btn-logout-nav"
            className="btn btn--ghost btn--sm"
            style={{ borderColor: 'rgba(255, 77, 90, 0.4)', color: '#FF4D5A', display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'none', letterSpacing: '0.03em' }}
            title="Sign out operative team"
            onClick={onLogout}
          >
            <IconCross size={12} color="#FF4D5A" />
            <span>Log out</span>
          </button>
        )}
      </div>
    </header>
  );
};
