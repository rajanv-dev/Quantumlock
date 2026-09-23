import React from 'react';
import { IconCrown, IconTrophy, IconCross } from './CyberIcons';

export const CongratulationsModal = ({
  isOpen,
  sessionNumber = 1,
  teamName = '',
  stats = {},
  onClose,
  onLogout,
  onViewLeaderboard
}) => {
  if (!isOpen) return null;

  const formatTime = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return '00:00';
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  };

  const isFinalSession = sessionNumber === 2;
  const sSolved = sessionNumber === 1 ? (stats.s1SolvedCount ?? stats.session1Score ?? 15) : (stats.s2SolvedCount ?? stats.session2Score ?? 15);
  const sTotal = 15;
  const timeTaken = sessionNumber === 1 ? (stats.session1Time || stats.duration || 0) : (stats.session2Time || stats.duration || 0);

  return (
    <div
      className="modal-backdrop is-open"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 5, 2, 0.92)',
        backdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'backdropFadeIn 0.3s ease-out'
      }}
    >
      <div
        className="congratulations-card"
        style={{
          background: 'linear-gradient(180deg, #07190e 0%, #030a06 100%)',
          border: '2px solid var(--doom-green, #00ff66)',
          borderRadius: '16px',
          padding: '2.5rem',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 0 60px rgba(0, 255, 102, 0.3), 0 20px 50px rgba(0,0,0,0.9)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* TOP GLOW ORB & CONFETTI ACCENT */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(0,255,102,0.4) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(0, 255, 102, 0.15)',
            border: '2px solid var(--doom-green, #00ff66)',
            boxShadow: '0 0 30px rgba(0, 255, 102, 0.5)',
            marginBottom: '1.2rem',
            animation: 'trophyBounce 1.2s ease infinite alternate'
          }}
        >
          {isFinalSession ? (
            <IconCrown size={36} color="var(--doom-green)" />
          ) : (
            <IconTrophy size={36} color="var(--doom-green)" />
          )}
        </div>

        <div style={{
          display: 'inline-block',
          background: 'rgba(0, 255, 102, 0.12)',
          border: '1px solid rgba(0, 255, 102, 0.4)',
          borderRadius: '20px',
          padding: '4px 14px',
          fontSize: '0.72rem',
          color: 'var(--doom-green, #00ff66)',
          letterSpacing: '0.15em',
          fontWeight: 'bold',
          marginBottom: '0.8rem'
        }}>
          BATTLEWORLD PROTOCOL CLEARED
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-headline, sans-serif)',
            fontSize: '2.2rem',
            fontWeight: 900,
            color: '#ffffff',
            textShadow: '0 0 25px rgba(0, 255, 102, 0.7)',
            margin: '0 0 0.5rem 0',
            letterSpacing: '0.04em'
          }}
        >
          CONGRATULATIONS!
        </h1>

        <p
          style={{
            color: 'var(--doom-green, #00ff66)',
            fontSize: '1.1rem',
            fontWeight: 700,
            marginBottom: '0.4rem',
            letterSpacing: '0.05em'
          }}
        >
          {teamName ? `OPERATIVE TEAM [${teamName}]` : 'OPERATIVE TEAM'}
        </p>

        <p
          style={{
            color: '#a0b3a8',
            fontSize: '0.92rem',
            lineHeight: '1.5',
            marginBottom: '1.8rem'
          }}
        >
          {isFinalSession
            ? 'You have successfully breached all 30 Chambers across both sessions! Standby for final rankings and award ceremony.'
            : 'Session 1 (Chambers 01–15) has been completed and secured in the database! Take a breather before Session 2 begins.'}
        </p>

        {/* STATS RECAP BOX */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            background: 'rgba(0, 20, 10, 0.6)',
            border: '1px solid rgba(0, 255, 102, 0.25)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.8rem'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#7e9e8a', letterSpacing: '0.1em' }}>
              CHAMBERS SOLVED
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--doom-green, #00ff66)' }}>
              {sSolved} / {sTotal}
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#7e9e8a', letterSpacing: '0.1em' }}>
              SESSION TIME
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--doom-cyan, #00e5ff)' }}>
              {formatTime(timeTaken)}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS (LOG OUT & LEADERBOARD) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {onLogout && (
            <button
              id="congrats-logout-btn"
              onClick={onLogout}
              className="btn btn--primary"
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '1rem',
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                background: 'linear-gradient(135deg, #ff2244 0%, #aa0022 100%)',
                borderColor: '#ff4466',
                boxShadow: '0 0 25px rgba(255, 34, 68, 0.4)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <IconCross size={16} />
              <span>LOG OUT OF SESSION</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            {onViewLeaderboard && (
              <button
                onClick={onViewLeaderboard}
                className="btn btn--ghost"
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '0.85rem',
                  borderColor: 'rgba(0, 229, 255, 0.4)',
                  color: 'var(--doom-cyan, #00e5ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <IconTrophy size={15} />
                <span>VIEW LEADERBOARD</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="btn btn--ghost"
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '0.85rem',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff'
                }}
              >
                CLOSE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
