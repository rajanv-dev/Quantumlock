import React, { useState, useEffect } from 'react';
import { IconTrophy, IconClock, IconCross } from './CyberIcons';

export const LeaderboardModal = ({ isOpen, onClose }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data && data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn('[Leaderboard] Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchLeaderboard();
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return '00:00';
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  };

  return (
    <div className="leaderboard-modal-overlay" role="dialog" aria-modal="true" aria-label="Official Leaderboard">
      <div className="leaderboard-modal">
        {/* HEADER */}
        <div className="leaderboard-modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="leaderboard-modal__icon">
              <IconTrophy size={26} color="var(--doom-green-bright)" />
            </div>
            <div>
              <div className="leaderboard-modal__title">AIDEX'26 // OFFICIAL ESCAPE ROOM LEADERBOARD</div>
              <div className="leaderboard-modal__subtitle">
                Ranked by Total Score (Highest) → Total Server Completion Time (Lowest)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {lastUpdated && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--doom-green-bright)' }}>
                ● LIVE SYNC ({lastUpdated})
              </span>
            )}
            <button className="btn btn--danger btn--sm" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <IconCross size={13} />
              <span>CLOSE</span>
            </button>
          </div>
        </div>

        {/* TABLE BODY */}
        <div className="leaderboard-modal__body">
          {loading && leaderboard.length === 0 ? (
            <div className="leaderboard-modal__loading">
              <span className="waiting-card__spinner">▌</span> RETRIEVING LIVE SATELLITE TELEMETRY...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="leaderboard-modal__empty">
              NO PARTICIPANT RESULTS REGISTERED YET. THE BATTLE HAS JUST BEGUN.
            </div>
          ) : (
            <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>TEAM CALLSIGN</th>
                    <th>ROOMS SOLVED</th>
                    <th>HINTS USED</th>
                    <th>TOTAL POINTS</th>
                    <th>SESSION 1</th>
                    <th>SESSION 2</th>
                    <th>TOTAL TIME (TIE-BREAKER)</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => {
                    const isTop1 = row.rank === 1;
                    const isTop2 = row.rank === 2;
                    const isTop3 = row.rank === 3;

                    return (
                      <tr
                        key={row.participantId}
                        className={`leaderboard-row ${isTop1 ? 'leaderboard-row--gold' : isTop2 ? 'leaderboard-row--silver' : isTop3 ? 'leaderboard-row--bronze' : ''}`}
                      >
                        <td className="leaderboard-cell--rank" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isTop1 ? (
                            <><IconTrophy size={14} color="#ffd700" /> 01</>
                          ) : isTop2 ? (
                            <><IconTrophy size={14} color="#c0c0c0" /> 02</>
                          ) : isTop3 ? (
                            <><IconTrophy size={14} color="#cd7f32" /> 03</>
                          ) : (
                            `#${String(row.rank).padStart(2, '0')}`
                          )}
                        </td>
                        <td className="leaderboard-cell--team">
                          {row.teamName}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                          {row.solvedCount || row.totalScore} / 30
                        </td>
                        <td>
                          {row.hintsUsedCount > 0 ? (
                            <span style={{ color: 'var(--doom-red)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {row.hintsUsedCount} Hints (−{row.totalPenalty} pts)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--doom-green-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                              0 Hints
                            </span>
                          )}
                          {row.wrongCount > 0 && (
                            <div style={{ color: 'var(--doom-red)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                              {row.wrongCount} Wrong (−{row.wrongPenaltyPoints ?? (row.wrongCount * 2)} pts)
                            </div>
                          )}
                        </td>
                        <td className="leaderboard-cell--total-score" style={{ color: 'var(--doom-green-bright)', fontWeight: 'bold' }}>
                          {row.totalPoints !== undefined ? `${row.totalPoints} PTS` : `${row.totalScore * 20} PTS`}
                        </td>
                        <td>
                          <span className="leaderboard-tag">
                            {row.session1Points || 0} pts ({formatTime(row.session1Time)})
                          </span>
                        </td>
                        <td>
                          <span className="leaderboard-tag">
                            {row.session2Points || 0} pts ({formatTime(row.session2Time)})
                          </span>
                        </td>
                        <td className="leaderboard-cell--total-time" style={{ color: 'var(--doom-cyan)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IconClock size={13} color="var(--doom-cyan)" />
                          <span>{formatTime(row.totalTime)}</span>
                        </td>
                        <td>
                          <span className={`leaderboard-status-tag ${row.isComplete ? 'leaderboard-status-tag--done' : 'leaderboard-status-tag--progress'}`}>
                            {row.isComplete ? '● COMPLETED' : '● ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
