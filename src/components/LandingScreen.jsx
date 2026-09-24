import React, { useState, useEffect, useRef } from 'react';
import './LandingScreen.css';
import loginBackground from '../../assets/images/loginppage.png';
import {
  IconLock,
  IconTerminal,
  IconVolume,
  IconVolumeMute,
  IconAlert,
  IconCheck,
  IconTrophy,
  IconShield
} from './CyberIcons';

export const LandingScreen = ({
  isActive,
  onEnterProtocol,
  onLoginTeam,
  soundOn,
  onToggleSound,
}) => {
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'login'
  const [teamCallsign, setTeamCallsign] = useState('');
  const [teamPasscode, setTeamPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Cinematic opening sequence stages: 0 to 5
  // Cinematic opening sequence stages: default 5 for immediate high-impact render
  const [introStage, setIntroStage] = useState(5);

  // Live Leaderboard data for preview section
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Sector hover state
  const [hoveredSector, setHoveredSector] = useState(null);

  // Trigger cinematic opening timeline
  useEffect(() => {
    if (!isActive) return;

    const t1 = setTimeout(() => setIntroStage(1), 300);
    const t2 = setTimeout(() => setIntroStage(2), 600);
    const t3 = setTimeout(() => setIntroStage(3), 1200);
    const t4 = setTimeout(() => setIntroStage(4), 1800);
    const t5 = setTimeout(() => setIntroStage(5), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isActive]);

  // Fetch live leaderboard for scroll section
  useEffect(() => {
    if (!isActive) return;
    const fetchTopScores = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data && data.leaderboard) {
          setLeaderboardData(data.leaderboard.slice(0, 5));
        }
      } catch (err) {
        console.warn('Leaderboard preview fetch failed:', err);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchTopScores();
  }, [isActive]);

  if (!isActive) return null;

  // Handle Team Login Submit & Cinematic Transition
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!teamCallsign.trim()) {
      setErrorMessage('Please enter your team name.');
      return;
    }
    if (!teamPasscode.trim()) {
      setErrorMessage('Please enter your team password.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const loginFn = onLoginTeam || onEnterProtocol;
    const result = await loginFn(teamCallsign.trim(), teamPasscode.trim());

    if (result && !result.success) {
      setErrorMessage(result.message || 'Authentication failed. Please check team name and password.');
      setIsSubmitting(false);
    } else if (result && result.success) {
      // Trigger cinematic breach transition
      setIsTransitioning(true);
    } else {
      setIsSubmitting(false);
    }
  };

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('input-team-name')?.focus();
  };

  const sectors = [
    { id: '01', title: 'SECTOR 01', subtitle: 'CPU Scheduling Pipeline', category: 'Operating Systems', status: 'CLASSIFIED' },
    { id: '02', title: 'SECTOR 02', subtitle: 'Relational Schema Normalization', category: 'Databases', status: 'CLASSIFIED' },
    { id: '03', title: 'SECTOR 03', subtitle: 'Weighted Traversal Matrix', category: 'Algorithms', status: 'CLASSIFIED' },
    { id: '04', title: 'SECTOR 04', subtitle: 'Sequential Data Containers', category: 'Data Structures', status: 'CLASSIFIED' },
    { id: '05', title: 'SECTOR 05', subtitle: 'Rule Engine Decision Matrix', category: 'Logic & AI', status: 'CLASSIFIED' },
    { id: '06', title: 'SECTOR 06', subtitle: 'Dynamic Ordered Containers', category: 'Data Structures', status: 'CLASSIFIED' },
    { id: '07', title: 'SECTOR 07', subtitle: 'Concurrency Locking Protocols', category: 'Operating Systems', status: 'CLASSIFIED' },
    { id: '08', title: 'SECTOR 08', subtitle: 'Deterministic Finite Automata', category: 'Theory of Computation', status: 'CLASSIFIED' },
    { id: '09', title: 'SECTOR 09', subtitle: 'Bitwise Cryptographic Masking', category: 'Computer Systems', status: 'CLASSIFIED' },
    { id: '10', title: 'SECTOR 10', subtitle: 'Asymptotic Complexity Audit', category: 'Algorithms', status: 'CORE FINALE' }
  ];

  return (
    <div className="landing-root">
      {/* PERSISTENT FIXED SITE BACKGROUND */}
      <div
        className="site-background"
        style={{
          backgroundImage: `url(${loginBackground})`
        }}
      />

      <div className="app-content">
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 1. CINEMATIC FULL VIEWPORT HERO SECTION (100vw × 100vh)             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <section className="hero-viewport" id="hero-section">

        {/* Top Header / Brand Bar */}
        <header className={`hero-header ${introStage >= 4 ? 'hero-header--visible' : ''}`}>
          <div className="hero-header-left">
            <div className="hero-brand__emblem">
              <IconTerminal size={18} color="var(--cyber-neon)" />
            </div>
            <div className="hero-brand__text-group">
              <span className="hero-brand__title">AIDEX '26</span>
              <span className="hero-brand__sub">TECHNICAL ESCAPE ROOM</span>
            </div>
          </div>

          <div className="hero-header-center">
            <div className="hero-brand__node-pill">
              <span className="hero-brand__pulse-dot" />
              <span className="hero-brand__node-label">GATEWAY // ONLINE</span>
            </div>
          </div>

          <div className="hero-header-right">
            <button
              id="btn-sound-toggle-hero"
              type="button"
              className="hero-header-btn hero-header-btn--sound"
              aria-pressed={soundOn}
              title="Toggle ambient audio"
              onClick={onToggleSound}
            >
              <span className="hero-header-btn__icon">
                {soundOn ? <IconVolume size={14} color="var(--cyber-neon)" /> : <IconVolumeMute size={14} />}
              </span>
              <span className="hero-header-btn__label">{soundOn ? 'SOUND ON' : 'SOUND OFF'}</span>
            </button>
          </div>
        </header>

        {/* Central Hero Content */}
        <div className="hero-content-container">
          {/* Incident / Mission Status Tag */}
          <div className={`hero-incident-chip ${introStage >= 3 ? 'hero-incident-chip--visible' : ''}`}>
            <span className="hero-incident-chip__dot" />
            <span>CLASSIFIED MISSION</span>
          </div>

          {/* Main Titles */}
          <h1 className={`hero-main-title ${introStage >= 4 ? 'hero-main-title--visible' : ''}`}>
            AIDEX '26
          </h1>

          <div className={`hero-subtitle ${introStage >= 4 ? 'hero-subtitle--visible' : ''}`}>
            TECHNICAL ESCAPE ROOM
          </div>

          <p className={`hero-tagline ${introStage >= 5 ? 'hero-tagline--visible' : ''}`}>
            "FIVE ROOMS. FIVE CHALLENGES. ONE WAY OUT."
          </p>

          <div className={`hero-down-arrow ${introStage >= 5 ? 'hero-down-arrow--visible' : ''}`}>↓</div>

          {/* Operative Login Form - Access Required */}
          <div className={`hero-form-card ${introStage >= 5 ? 'hero-form-card--visible' : ''}`}>
            {/* Corner Bracket Accents */}
            <div className="pc-bracket pc-bracket--tl" />
            <div className="pc-bracket pc-bracket--tr" />
            <div className="pc-bracket pc-bracket--bl" />
            <div className="pc-bracket pc-bracket--br" />

            {/* Header: Access Required */}
            <div className="hero-card-header">
              <div className="hero-card-header__title-row">
                <div className="hero-card-header__left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconLock size={18} color="var(--cyber-neon)" />
                  <span className="hero-card-header__title">ACCESS TERMINAL</span>
                </div>
                <span className="hero-card-header__badge">CLASSIFIED MISSION ACCESS</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div className="hero-form-grid">
                <div className="hero-input-group">
                  <label className="hero-input-label" htmlFor="input-team-name">
                    <span className="hero-input-label__prefix">▸ CALLSIGN:</span>
                    <span>TEAM NAME</span>
                  </label>
                  <div className="hero-input-wrap">
                    <input
                      type="text"
                      id="input-team-name"
                      placeholder="ENTER TEAM NAME..."
                      value={teamCallsign}
                      onChange={(e) => {
                        setTeamCallsign(e.target.value);
                        setErrorMessage('');
                      }}
                      className="hero-input"
                      disabled={isSubmitting}
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className="hero-input-group">
                  <label className="hero-input-label" htmlFor="input-team-passcode">
                    <span className="hero-input-label__prefix">▸ ACCESS KEY:</span>
                    <span>PASSWORD</span>
                  </label>
                  <div className="hero-input-wrap">
                    <input
                      type="password"
                      id="input-team-passcode"
                      placeholder="ENTER TEAM PASSWORD..."
                      value={teamPasscode}
                      onChange={(e) => {
                        setTeamPasscode(e.target.value);
                        setErrorMessage('');
                      }}
                      className="hero-input"
                      disabled={isSubmitting}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="hero-error-banner" role="alert">
                    <span className="hero-error-banner__icon">
                      <IconAlert size={16} color="var(--cyber-red)" />
                    </span>
                    <span className="hero-error-banner__text">{errorMessage}</span>
                  </div>
                )}

                <div className="hero-actions-row">
                  <button
                    type="submit"
                    id="btn-enter-protocol"
                    className="btn-enter-protocol"
                    disabled={isSubmitting}
                  >
                    <span className="btn-enter-protocol__text">
                      {isSubmitting
                        ? 'AUTHENTICATING CLEARANCE...'
                        : 'ACCESS MISSION'}
                    </span>
                    <span className="btn-enter-protocol__arrow">→</span>
                  </button>
                </div>
              </div>

              {/* Security Metadata Footer */}
              <div className="hero-card-footer">
                <span>AUTH GATEWAY // SECURE TLS-AES256</span>
                <span className="hero-card-footer__ready">OPERATIVE READY</span>
              </div>
            </form>
          </div>

          {/* Scroll / Mission Briefing Indicator directly below terminal */}
          <div className={`hero-scroll-hint ${introStage >= 5 ? 'hero-scroll-hint--visible' : ''}`} onClick={() => {
            document.getElementById('incident-section')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <span className="hero-scroll-hint__text">CLASSIFIED MISSION BRIEFING</span>
            <span className="hero-scroll-hint__arrow">↓</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. CLASSIFIED INCIDENT REPORT SECTION                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="landing-section landing-section--incident" id="incident-section">
        <div className="landing-container">
          <div className="incident-dossier-card">
            <div className="incident-dossier-card__header">
              <div className="incident-dossier-card__stamp">CLASSIFIED // TOP SECRET</div>
              <div className="incident-dossier-card__meta">
                <span>SYSTEM: LATVERIA-NET</span>
                <span>INCIDENT ID: DOOM-26</span>
                <span>STATUS: ACTIVE BREACH</span>
                <span>THREAT LEVEL: OMEGA</span>
              </div>
            </div>

            <div className="incident-dossier-card__body">
              <div className="incident-terminal-line incident-terminal-line--lead">
                <span className="terminal-prefix">&gt;</span>
                <span className="terminal-text">Something has breached the system.</span>
              </div>
              <div className="incident-terminal-line">
                <span className="terminal-prefix">&gt;</span>
                <span className="terminal-text">Ten encrypted chambers stand between the operative and system recovery.</span>
              </div>
              <div className="incident-terminal-line">
                <span className="terminal-prefix">&gt;</span>
                <span className="terminal-text">Every sector contains an authoritative computer science trial.</span>
              </div>
              <div className="incident-terminal-line">
                <span className="terminal-prefix">&gt;</span>
                <span className="terminal-text">Failure closes the access corridor permanently.</span>
              </div>
              <div className="incident-terminal-line incident-terminal-line--highlight">
                <span className="terminal-prefix">&gt;</span>
                <span className="terminal-text">Find the breach. Break the protocol. Unmask the anomaly.</span>
                <span className="terminal-cursor">█</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. THE PROTOCOL & TWO-SESSION COMPETITION RULES                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="landing-section landing-section--protocol">
        <div className="landing-container">
          <div className="section-head">
            <span className="section-eyebrow">OPERATIONAL BLUEPRINT</span>
            <h2 className="section-title">THE TWO-SESSION BATTLEWORLD PROTOCOL</h2>
            <p className="section-desc">
              A synchronized, admin-governed competition architecture engineered for 50+ concurrent operatives.
            </p>
          </div>

          <div className="protocol-grid">
            <div className="protocol-card">
              <div className="protocol-card__badge">SESSION 01</div>
              <h3 className="protocol-card__title">AVENGERS TOWER CORE</h3>
              <div className="protocol-card__chambers">CHAMBERS 01 — 05</div>
              <p className="protocol-card__text">
                Operatives breach the perimeter. Unlocks only when the Game Master authorizes the signal. Individual countdown timers begin immediately.
              </p>
              <ul className="protocol-card__list">
                <li><IconCheck size={13} color="var(--cyber-neon)" style={{ marginRight: '6px' }} /> Round-robin scheduling & dispatch audits</li>
                <li><IconCheck size={13} color="var(--cyber-neon)" style={{ marginRight: '6px' }} /> Relational schema normalization</li>
                <li><IconCheck size={13} color="var(--cyber-neon)" style={{ marginRight: '6px' }} /> Dijkstra weighted reactor traversal</li>
                <li><IconCheck size={13} color="var(--cyber-neon)" style={{ marginRight: '6px' }} /> Stack & queue sequential container parsing</li>
              </ul>
            </div>

            <div className="protocol-card protocol-card--s2">
              <div className="protocol-card__badge protocol-card__badge--s2">SESSION 02</div>
              <h3 className="protocol-card__title">INNER SANCTUM PROTOCOLS</h3>
              <div className="protocol-card__chambers">CHAMBERS 06 — 10</div>
              <p className="protocol-card__text">
                Locked behind Doctor Doom's secondary barrier until authorized. Remaining 5 assigned questions reveal dynamically.
              </p>
              <ul className="protocol-card__list">
                <li><IconCheck size={13} color="var(--cyber-neon)" style={{ marginRight: '6px' }} /> Coffman deadlock circular-wait mitigation</li>
                <li><IconCheck size={13} color="var(--cyber-neon)" style={{ marginRight: '6px' }} /> Deterministic finite automata decoding</li>
                <li><IconCheck size={13} color="var(--cyber-neon)" style={{ marginRight: '6px' }} /> Bitwise masking & permission registers</li>
                <li><IconCheck size={13} color="var(--cyber-neon)" style={{ marginRight: '6px' }} /> Asymptotic complexity performance audit</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. SECTORS / CHAMBERS SHOWCASE                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="landing-section landing-section--sectors">
        <div className="landing-container">
          <div className="section-head">
            <span className="section-eyebrow">SURVEILLANCE TELEMETRY</span>
            <h2 className="section-title">10 CLASSIFIED SYSTEM SECTORS</h2>
            <p className="section-desc">
              Hover over any sector to initiate optical telemetry scan. Questions are uniquely randomized per team from our server vault.
            </p>
          </div>

          <div className="sectors-grid">
            {sectors.map((sec) => {
              const isHovered = hoveredSector === sec.id;
              return (
                <div
                  key={sec.id}
                  className={`sector-card ${isHovered ? 'sector-card--active' : ''}`}
                  onMouseEnter={() => setHoveredSector(sec.id)}
                  onMouseLeave={() => setHoveredSector(null)}
                >
                  <div className="sector-card__scan-beam" />
                  <div className="sector-card__top">
                    <span className="sector-card__id">SECTOR {sec.id}</span>
                    <span className="sector-card__status">{sec.status}</span>
                  </div>
                  <h4 className="sector-card__title">{sec.title}</h4>
                  <div className="sector-card__sub">{sec.subtitle}</div>
                  <div className="sector-card__footer">
                    <span className="sector-card__cat">{sec.category}</span>
                    <span className="sector-card__lock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IconLock size={12} color={isHovered ? 'var(--cyber-neon)' : 'var(--cyber-muted)'} />
                      <span>{isHovered ? 'ACCESS RESTRICTED' : 'ENCRYPTED'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. LIVE LEADERBOARD PREVIEW SECTION                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="landing-section landing-section--leaderboard">
        <div className="landing-container">
          <div className="section-head">
            <span className="section-eyebrow">SATELLITE TELEMETRY</span>
            <h2 className="section-title">ACTIVE SATELLITE LEADERBOARD</h2>
            <p className="section-desc">
              Real-time authoritative ranking based on Total Score (Highest) → Total Server Time (Lowest).
            </p>
          </div>

          <div className="landing-leaderboard-card">
            {loadingLeaderboard ? (
              <div className="landing-leaderboard-empty">
                <span className="waiting-card__spinner">▌</span> RETRIEVING TELEMETRY DATA...
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="landing-leaderboard-empty">
                NO REGISTERED OPERATIVE SCORES YET. THE BATTLEWORLD PROTOCOL STANDS READY.
              </div>
            ) : (
              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>RANK</th>
                      <th>TEAM CALLSIGN</th>
                      <th>SESSION 1</th>
                      <th>SESSION 2</th>
                      <th>TOTAL SCORE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((row) => (
                      <tr key={row.participantId} className="leaderboard-row">
                        <td className="leaderboard-cell--rank" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {row.rank === 1 ? (
                            <><IconTrophy size={14} color="#ffd700" /> #01</>
                          ) : row.rank === 2 ? (
                            <><IconTrophy size={14} color="#c0c0c0" /> #02</>
                          ) : row.rank === 3 ? (
                            <><IconTrophy size={14} color="#cd7f32" /> #03</>
                          ) : (
                            `#${String(row.rank).padStart(2, '0')}`
                          )}
                        </td>
                        <td className="leaderboard-cell--team">{row.teamName}</td>
                        <td>{row.session1Score} / 15</td>
                        <td>{row.session2Score} / 15</td>
                        <td className="leaderboard-cell--total-score">{row.totalScore} / 30</td>
                        <td>
                          <span className={`leaderboard-status-tag ${row.isComplete ? 'leaderboard-status-tag--done' : 'leaderboard-status-tag--progress'}`}>
                            {row.isComplete ? '● COMPLETE' : '● IN PROGRESS'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 6. FINAL TERMINAL CALL TO ACTION SECTION                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="landing-section landing-section--cta">
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <div className="final-cta-card">
            <span className="final-cta-card__glyph">
              <IconShield size={36} color="var(--cyber-neon)" />
            </span>
            <h2 className="final-cta-card__title">READY TO BREACH BATTLEWORLD?</h2>
            <p className="final-cta-card__desc">
              Your randomized 10-chamber protocol awaits. Enter your operative callsign and prepare for intrusion.
            </p>
            <button className="btn-enter-protocol btn-enter-protocol--lg" onClick={scrollToHero}>
              <span className="btn-enter-protocol__text">INITIATE PROTOCOL CLEARANCE</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CINEMATIC BREACH TRANSITION OVERLAY                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isTransitioning && (
        <div className="cinematic-breach-transition">
          <div className="cinematic-breach-transition__scanline" />
          <div className="cinematic-breach-transition__content">
            <div className="cinematic-breach-transition__spinner">
              <IconTerminal size={24} color="var(--cyber-neon)" />
            </div>
            <div className="cinematic-breach-transition__title">ACCESSING DOOM PROTOCOL...</div>
            <div className="cinematic-breach-transition__sub">SYNCHRONIZING SERVER TIME & RANDOMIZING SECTORS</div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
