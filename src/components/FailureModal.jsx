import React from 'react';
import { IconAlert, IconTrophy } from './CyberIcons';

export const FailureModal = ({ isOpen, onRestart, onDismiss, onViewLeaderboard }) => {
  if (!isOpen) return null;

  return (
    <div
      className="failure-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(10, 0, 0, 0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Mission Failed — Time Expired"
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #1f050a 0%, #080103 100%)',
          border: '2px solid var(--doom-red)',
          borderRadius: '10px',
          boxShadow: '0 0 60px rgba(255, 34, 68, 0.4), 0 20px 50px rgba(0,0,0,0.9)',
          maxWidth: '560px',
          width: '100%',
          padding: '2.2rem',
          textAlign: 'center',
          animation: 'narrativeFloatIn 0.4s ease-out forwards',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255, 34, 68, 0.15)',
            border: '2px solid var(--doom-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.2rem',
            boxShadow: '0 0 25px rgba(255, 34, 68, 0.5)',
            animation: 'timerFlash 1.5s ease-in-out infinite',
          }}
        >
          <IconAlert size={30} color="var(--doom-red)" />
        </div>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--doom-red)',
            letterSpacing: '0.2em',
            fontWeight: 'bold',
            marginBottom: '6px',
            textTransform: 'uppercase',
          }}
        >
          DOOMSDAY PROTOCOL ACTIVATED
        </p>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            color: '#fff',
            textShadow: '0 0 20px var(--doom-red)',
            marginBottom: '1rem',
          }}
        >
          SESSION COUNTDOWN EXPIRED
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            lineHeight: '1.6',
            color: 'var(--ink-dim)',
            marginBottom: '1.8rem',
          }}
        >
          The mission timer reached <strong>00:00</strong> before all chamber overrides were confirmed. Latveria-Net has engaged lockdown mode — answer submissions are sealed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {onViewLeaderboard && (
            <button
              type="button"
              className="btn btn--primary btn--lg btn--charge"
              onClick={onViewLeaderboard}
              style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <IconTrophy size={16} />
              <span>VIEW LIVE LEADERBOARD & SCORES</span>
            </button>
          )}

          {onRestart && (
            <button
              type="button"
              className="btn btn--danger btn--lg"
              onClick={onRestart}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              LEADERBOARD & RANKINGS
            </button>
          )}

          {onDismiss && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={onDismiss}
              style={{ width: '100%', justifyContent: 'center', color: 'var(--ink-dim)' }}
            >
              INSPECT LOCKED CHAMBERS & DOSSIER
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
