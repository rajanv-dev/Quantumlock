import React, { useState, useEffect, useMemo } from 'react';
import { IconTrophy, IconClock, IconCross, IconCheck, IconZap } from './CyberIcons';
import './LeaderboardModal.css';

export const LeaderboardModal = ({ isOpen, onClose, currentTeamName }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
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

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const formatTime = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return '00:00';
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  };

  // Top 3 Podium
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Filtered leaderboard
  const filteredList = useMemo(() => {
    return leaderboard.filter((row) => {
      const matchesSearch = !searchQuery.trim() ||
        (row.teamName && row.teamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (row.participantId && row.participantId.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterTab === 'ACTIVE') return !row.isComplete;
      if (filterTab === 'COMPLETED') return row.isComplete;
      if (filterTab === 'SOLVED') return (row.solvedCount || row.totalScore || 0) > 0;
      return true;
    });
  }, [leaderboard, searchQuery, filterTab]);

  if (!isOpen) return null;

  return (
    <div className="lb-overlay" role="dialog" aria-modal="true" aria-label="Official Leaderboard" onClick={onClose}>
      <div className="lb-modal" onClick={(e) => e.stopPropagation()}>
        {/* Cyberpunk corner brackets */}
        <div className="lb-corner lb-corner--tl" />
        <div className="lb-corner lb-corner--tr" />
        <div className="lb-corner lb-corner--bl" />
        <div className="lb-corner lb-corner--br" />

        {/* ─── HEADER ─── */}
        <div className="lb-header">
          <div className="lb-title-group">
            <div className="lb-trophy-orb">
              <IconTrophy size={24} color="#00FF9C" />
            </div>
            <div>
              <div className="lb-title">
                AIDEX'26 // ESCAPE ROOM LEADERBOARD
              </div>
              <div className="lb-subtitle">
                Ranked by Total Points (Highest) · Tie-Breaker: Server Completion Time (Lowest)
              </div>
            </div>
          </div>

          <div className="lb-header-actions">
            {lastUpdated && (
              <div className="lb-live-badge">
                <span className="lb-live-dot" />
                <span>LIVE SYNC · {lastUpdated}</span>
              </div>
            )}
            <button
              type="button"
              className="lb-btn-refresh"
              onClick={fetchLeaderboard}
              title="Refresh telemetry"
            >
              <IconZap size={13} />
              <span>REFRESH</span>
            </button>
            <button
              type="button"
              className="lb-btn-close"
              onClick={onClose}
            >
              <IconCross size={13} />
              <span>CLOSE</span>
            </button>
          </div>
        </div>

        {/* ─── TOP 3 SPOTLIGHT PODIUM ─── */}
        {leaderboard.length > 0 && (
          <div className="lb-podium-strip">
            {/* 🥇 #1 Gold */}
            <div className="lb-podium-card lb-podium-card--gold">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="lb-podium-rank-icon">🥇</span>
                <div>
                  <div className="lb-podium-team">{top1?.teamName || 'STANDBY'}</div>
                  <div className="lb-podium-meta">
                    {top1 ? `${top1.solvedCount || top1.totalScore || 0} / 30 Rooms · ${formatTime(top1.totalTime)}` : 'Awaiting result'}
                  </div>
                </div>
              </div>
              <div className="lb-podium-points">
                {top1?.totalPoints !== undefined ? `${top1.totalPoints} PTS` : '0 PTS'}
              </div>
            </div>

            {/* 🥈 #2 Silver */}
            <div className="lb-podium-card lb-podium-card--silver">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="lb-podium-rank-icon">🥈</span>
                <div>
                  <div className="lb-podium-team">{top2?.teamName || 'STANDBY'}</div>
                  <div className="lb-podium-meta">
                    {top2 ? `${top2.solvedCount || top2.totalScore || 0} / 30 Rooms · ${formatTime(top2.totalTime)}` : 'Awaiting result'}
                  </div>
                </div>
              </div>
              <div className="lb-podium-points">
                {top2?.totalPoints !== undefined ? `${top2.totalPoints} PTS` : '0 PTS'}
              </div>
            </div>

            {/* 🥉 #3 Bronze */}
            <div className="lb-podium-card lb-podium-card--bronze">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="lb-podium-rank-icon">🥉</span>
                <div>
                  <div className="lb-podium-team">{top3?.teamName || 'STANDBY'}</div>
                  <div className="lb-podium-meta">
                    {top3 ? `${top3.solvedCount || top3.totalScore || 0} / 30 Rooms · ${formatTime(top3.totalTime)}` : 'Awaiting result'}
                  </div>
                </div>
              </div>
              <div className="lb-podium-points">
                {top3?.totalPoints !== undefined ? `${top3.totalPoints} PTS` : '0 PTS'}
              </div>
            </div>
          </div>
        )}

        {/* ─── SEARCH & FILTER CONTROLS BAR ─── */}
        <div className="lb-controls">
          <div className="lb-search-box">
            <span className="lb-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search team callsign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="lb-search-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ALL', 'SOLVED', 'ACTIVE', 'COMPLETED'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    background: filterTab === tab ? 'rgba(0, 255, 156, 0.2)' : 'rgba(0, 25, 18, 0.4)',
                    color: filterTab === tab ? '#00FF9C' : '#719A85',
                    border: `1px solid ${filterTab === tab ? '#00FF9C' : 'rgba(0, 255, 156, 0.2)'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="lb-stats-pills">
              <span className="lb-stat-pill">
                TOTAL SQUADS: <strong>{leaderboard.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ─── TABLE CONTENT ─── */}
        <div className="lb-table-container">
          {loading && leaderboard.length === 0 ? (
            <div className="lb-state-msg">
              <span style={{ fontSize: '1.5rem', animation: 'spin 1s infinite linear' }}>⚙️</span>
              <span>SYNCHRONIZING SATELLITE TELEMETRY...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="lb-state-msg">
              <span>NO PARTICIPANT RESULTS MATCH CURRENT FILTER</span>
            </div>
          ) : (
            <table className="lb-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>RANK</th>
                  <th>TEAM CALLSIGN</th>
                  <th>ROOMS SOLVED</th>
                  <th>TOTAL POINTS</th>
                  <th>PENALTIES</th>
                  <th>SESSION 1</th>
                  <th>SESSION 2</th>
                  <th>TOTAL TIME (TIE-BREAKER)</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((row) => {
                  const isTop1 = row.rank === 1;
                  const isTop2 = row.rank === 2;
                  const isTop3 = row.rank === 3;
                  const isCurrentTeam = currentTeamName && (
                    row.teamName?.toLowerCase() === currentTeamName.toLowerCase() ||
                    row.participantId?.toLowerCase() === currentTeamName.toLowerCase()
                  );

                  const rowClass = isCurrentTeam
                    ? 'lb-row--current-user'
                    : isTop1
                      ? 'lb-row--gold'
                      : isTop2
                        ? 'lb-row--silver'
                        : isTop3
                          ? 'lb-row--bronze'
                          : '';

                  const solvedRooms = row.solvedCount || row.totalScore || 0;
                  const progressPct = Math.min(100, Math.round((solvedRooms / 30) * 100));

                  return (
                    <tr key={row.participantId} className={rowClass}>
                      {/* RANK */}
                      <td>
                        <span className={`lb-rank-badge ${
                          isTop1 ? 'lb-rank-badge--gold' : isTop2 ? 'lb-rank-badge--silver' : isTop3 ? 'lb-rank-badge--bronze' : 'lb-rank-badge--default'
                        }`}>
                          {isTop1 ? (
                            <>🥇 01</>
                          ) : isTop2 ? (
                            <>🥈 02</>
                          ) : isTop3 ? (
                            <>🥉 03</>
                          ) : (
                            `#${String(row.rank).padStart(2, '0')}`
                          )}
                        </span>
                      </td>

                      {/* TEAM CALLSIGN */}
                      <td>
                        <div className="lb-team-name">
                          <span>{row.teamName}</span>
                          {isCurrentTeam && <span className="lb-you-tag">YOU</span>}
                        </div>
                      </td>

                      {/* ROOMS SOLVED */}
                      <td>
                        <div className="lb-rooms-progress">
                          <span style={{ fontWeight: '700', color: solvedRooms > 0 ? '#E2EFE7' : '#719A85' }}>
                            {solvedRooms} <span style={{ color: '#719A85', fontWeight: '400' }}>/ 30</span>
                          </span>
                          <div className="lb-progress-bar-bg" title={`${progressPct}% solved`}>
                            <div className="lb-progress-bar-fill" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* TOTAL POINTS */}
                      <td>
                        <span className="lb-points-cell">
                          {row.totalPoints !== undefined ? `${row.totalPoints} PTS` : `${solvedRooms * 20} PTS`}
                        </span>
                      </td>

                      {/* PENALTIES */}
                      <td>
                        <div className="lb-penalty-pill">
                          {row.hintsUsedCount > 0 && (
                            <span className="lb-penalty-tag lb-penalty-tag--hint">
                              {row.hintsUsedCount} Hint{row.hintsUsedCount > 1 ? 's' : ''} (−{row.totalPenalty} pts)
                            </span>
                          )}
                          {row.wrongCount > 0 && (
                            <span className="lb-penalty-tag" style={{
                              color: (row.wrongPenaltyPoints || 0) > 0 ? '#FF4D5A' : '#F0B429',
                              background: (row.wrongPenaltyPoints || 0) > 0 ? 'rgba(255, 77, 90, 0.1)' : 'rgba(240, 180, 41, 0.1)',
                              border: `1px solid ${(row.wrongPenaltyPoints || 0) > 0 ? 'rgba(255, 77, 90, 0.3)' : 'rgba(240, 180, 41, 0.3)'}`
                            }}>
                              {row.wrongCount} Wrong ({ (row.wrongPenaltyPoints || 0) > 0 ? `−${row.wrongPenaltyPoints} pts` : '0 pts penalty' })
                            </span>
                          )}
                          {!row.hintsUsedCount && !row.wrongCount && (
                            <span className="lb-penalty-tag--clean">0 Penalties</span>
                          )}
                        </div>
                      </td>

                      {/* SESSION 1 */}
                      <td>
                        <span className="lb-session-pill">
                          <strong style={{ color: '#00FF9C' }}>{row.session1Points || 0} pts</strong>
                          <span>({formatTime(row.session1Time)})</span>
                        </span>
                      </td>

                      {/* SESSION 2 */}
                      <td>
                        <span className="lb-session-pill">
                          <strong style={{ color: '#00FF9C' }}>{row.session2Points || 0} pts</strong>
                          <span>({formatTime(row.session2Time)})</span>
                        </span>
                      </td>

                      {/* TOTAL TIME */}
                      <td>
                        <span className="lb-time-pill">
                          <IconClock size={12} color="#00F0FF" />
                          <span>{formatTime(row.totalTime)}</span>
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span className={`lb-status-pill ${row.isComplete ? 'lb-status-pill--done' : 'lb-status-pill--active'}`}>
                          {row.isComplete ? (
                            <><IconCheck size={11} /> COMPLETED</>
                          ) : (
                            <>● ACTIVE</>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
