import React from 'react';
import { IconLock, IconShield, IconCrown, IconTrophy, IconCross } from './CyberIcons';

export const WaitingRoom = ({
  eventState,
  teamName,
  sessionStats = {},
  onOpenLeaderboard,
  onLogout,
}) => {
  const status = eventState?.status || 'CLOSED';

  const formatTime = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return '00:00';
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  };

  const s1Score = sessionStats.session1Score || 0;
  const s1Time = sessionStats.session1Time || 0;
  const s2Score = sessionStats.session2Score || 0;
  const s2Time = sessionStats.session2Time || 0;
  const totalScore = (sessionStats.totalScore !== undefined) ? sessionStats.totalScore : (s1Score + s2Score);
  const totalTime = (sessionStats.totalTime !== undefined) ? sessionStats.totalTime : (s1Time + s2Time);

  return (
    <div className="waiting-room-screen">
      <div className="waiting-room-container">
        {/* TOP GLOWING BADGE */}
        <div className="waiting-room__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="waiting-room__badge">
            <span className="waiting-room__pulse-dot" />
            <span>AIDEX'26 // BATTLEWORLD PROTOCOL GATE</span>
          </div>
          {onLogout && (
            <button
              className="btn btn--ghost btn--xs"
              style={{ borderColor: 'rgba(255, 34, 68, 0.4)', color: 'var(--doom-red, #ff2244)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              title="Sign out of operative session"
              onClick={onLogout}
            >
              <IconCross size={11} />
              <span>LOGOUT</span>
            </button>
          )}
        </div>

        {/* TEAM CALLSIGN BANNER */}
        <div className="waiting-room__team-card">
          <span className="waiting-room__team-label">OPERATIVE CALLSIGN:</span>
          <span className="waiting-room__team-name">{teamName || 'REBEL OPERATIVE'}</span>
        </div>

        {/* MAIN GATE CONTENT BASED ON EVENT STATE */}
        {status === 'CLOSED' && (
          <div className="waiting-card">
            <div className="waiting-card__icon-orb">
              <span className="waiting-card__icon">
                <IconLock size={32} color="var(--doom-green)" />
              </span>
            </div>

            <h1 className="waiting-card__title">
              BATTLEWORLD IS LOCKED
            </h1>

            <p className="waiting-card__subtitle">
              Waiting for the Game Master to initiate the Compound Breach...
            </p>

            <div className="waiting-card__terminal">
              <div className="waiting-card__terminal-line">
                <span style={{ color: 'var(--doom-green)' }}>[00:00:01]</span> LATVERIA-NET GATEWAY STANDBY
              </div>
              <div className="waiting-card__terminal-line">
                <span style={{ color: 'var(--doom-green)' }}>[00:00:02]</span> AUTHENTICATED TEAM: {teamName || 'UNKNOWN'}
              </div>
              <div className="waiting-card__terminal-line">
                <span style={{ color: 'var(--doom-amber)' }}>[00:00:03]</span> STATUS: SESSION 1 ACCESS LOCKED (15 CHAMBERS)
              </div>
              <div className="waiting-card__terminal-line" style={{ color: 'var(--ink-faint)' }}>
                <span>[00:00:04]</span> Awaiting Game Master authorization command...
              </div>
            </div>

            <div className="waiting-card__footer">
              <span className="waiting-card__spinner">▌</span>
              <span>LIVE UPLINK ACTIVE — YOUR MISSION WILL BEGIN AUTOMATICALLY</span>
            </div>
          </div>
        )}

        {(status === 'SESSION_1_LOCKED' || status === 'WAITING_FOR_SESSION_2' || (status === 'SESSION_1_ACTIVE' && sessionStats.session1Completed)) && (
          <div className="waiting-card">
            <div className="waiting-card__icon-orb" style={{ borderColor: 'var(--doom-green)' }}>
              <span className="waiting-card__icon">
                <IconShield size={32} color="var(--doom-green)" />
              </span>
            </div>

            <h1 className="waiting-card__title" style={{ color: 'var(--doom-green)' }}>
              CONGRATULATIONS! SESSION 1 SECURED
            </h1>

            <p className="waiting-card__subtitle">
              Chambers 01–15 completed & audited. Scores and points are stored in database. Intermission active. Awaiting Game Master authorization for Session 2.
            </p>

            {/* PERFORMANCE RECAP */}
            <div className="waiting-card__stats-grid">
              <div className="waiting-stat-box">
                <span className="waiting-stat-box__label">SESSION 1 SCORE</span>
                <span className="waiting-stat-box__value">{s1Score} / 15</span>
              </div>

              <div className="waiting-stat-box">
                <span className="waiting-stat-box__label">SESSION 1 TIME</span>
                <span className="waiting-stat-box__value">{formatTime(s1Time)}</span>
              </div>

              <div className="waiting-stat-box" style={{ borderColor: 'var(--doom-purple)' }}>
                <span className="waiting-stat-box__label">SESSION 2 STATUS</span>
                <span className="waiting-stat-box__value" style={{ color: 'var(--doom-purple)', fontSize: '1.2rem' }}>
                  STANDBY
                </span>
              </div>
            </div>

            <div className="waiting-card__terminal" style={{ marginTop: '1.2rem' }}>
              <div className="waiting-card__terminal-line">
                <span style={{ color: 'var(--doom-cyan)' }}>[SESSION 1]</span> Verified on server & MongoDB. Score: {s1Score}/15 in {formatTime(s1Time)}.
              </div>
              <div className="waiting-card__terminal-line">
                <span style={{ color: 'var(--doom-purple)' }}>[SESSION 2]</span> Chambers 16–30 (Inner Sanctum) will unlock automatically when Game Master transmits the signal.
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn--primary btn--md" onClick={onOpenLeaderboard} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconTrophy size={15} />
                <span>VIEW LIVE LEADERBOARD</span>
              </button>
              {onLogout && (
                <button
                  className="btn btn--ghost btn--md"
                  style={{ borderColor: 'rgba(255, 34, 68, 0.5)', color: 'var(--doom-red, #ff2244)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={onLogout}
                >
                  <IconCross size={13} />
                  <span>LOG OUT</span>
                </button>
              )}
            </div>

            <div className="waiting-card__footer" style={{ marginTop: '1rem' }}>
              <span className="waiting-card__spinner" style={{ color: 'var(--doom-cyan)' }}>▌</span>
              <span>LIVE UPLINK ACTIVE — SESSION 2 WILL COMMENCE AUTOMATICALLY</span>
            </div>
          </div>
        )}

        {(status === 'SESSION_2_LOCKED' || (status === 'SESSION_2_ACTIVE' && sessionStats.session2Completed)) && (
          <div className="waiting-card">
            <div className="waiting-card__icon-orb" style={{ borderColor: 'var(--doom-green)' }}>
              <span className="waiting-card__icon">
                <IconCrown size={32} color="var(--doom-green)" />
              </span>
            </div>

            <h1 className="waiting-card__title" style={{ color: 'var(--doom-green)' }}>
              CONGRATULATIONS! SESSION 2 COMPLETED
            </h1>

            <p className="waiting-card__subtitle">
              All 30 Chambers audited. You have cleared the compound breach! Standby for final rankings and award ceremony.
            </p>

            <div className="waiting-card__stats-grid">
              <div className="waiting-stat-box">
                <span className="waiting-stat-box__label">TOTAL SCORE</span>
                <span className="waiting-stat-box__value">{totalScore} / 30</span>
              </div>
              <div className="waiting-stat-box">
                <span className="waiting-stat-box__label">TOTAL TIME</span>
                <span className="waiting-stat-box__value">{formatTime(totalTime)}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn--primary btn--lg" onClick={onOpenLeaderboard} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconTrophy size={16} />
                <span>VIEW FINAL LEADERBOARD</span>
              </button>
              {onLogout && (
                <button
                  className="btn btn--ghost btn--lg"
                  style={{ borderColor: 'rgba(255, 34, 68, 0.5)', color: 'var(--doom-red, #ff2244)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={onLogout}
                >
                  <IconCross size={14} />
                  <span>LOG OUT</span>
                </button>
              )}
            </div>
          </div>
        )}

        {status === 'EVENT_FINISHED' && (
          <div className="waiting-card">
            <div className="waiting-card__icon-orb" style={{ borderColor: 'var(--doom-green-bright)' }}>
              <span className="waiting-card__icon">
                <IconCrown size={32} color="var(--doom-green-bright)" />
              </span>
            </div>

            <h1 className="waiting-card__title" style={{ color: 'var(--doom-green-bright)' }}>
              CONGRATULATIONS! MISSION COMPLETE
            </h1>

            <p className="waiting-card__subtitle">
              The Doomsday Protocol has terminated. Both sessions (30 Chambers) are fully finished!
            </p>

            <div className="waiting-card__stats-grid">
              <div className="waiting-stat-box">
                <span className="waiting-stat-box__label">TOTAL SCORE</span>
                <span className="waiting-stat-box__value">{totalScore} / 30</span>
              </div>
              <div className="waiting-stat-box">
                <span className="waiting-stat-box__label">TOTAL TIME</span>
                <span className="waiting-stat-box__value">{formatTime(totalTime)}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn--primary btn--lg" onClick={onOpenLeaderboard} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconTrophy size={16} />
                <span>VIEW FINAL COMPETITION LEADERBOARD</span>
              </button>
              {onLogout && (
                <button
                  className="btn btn--ghost btn--lg"
                  style={{ borderColor: 'rgba(255, 34, 68, 0.5)', color: 'var(--doom-red, #ff2244)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={onLogout}
                >
                  <IconCross size={14} />
                  <span>LOG OUT</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
