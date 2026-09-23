import React, { useEffect, useState, useRef } from 'react';
import { SoundManager } from '../utils/soundManager';
import { IconCheck } from './CyberIcons';

export const TransitionOverlay = ({
  isActive,
  transitionData = {},
  soundOn = true,
  onFinish
}) => {
  const [phase, setPhase] = useState('breach'); // 'breach' | 'warp' | 'reveal' | 'exit'
  const [progress, setProgress] = useState(0);
  const [displayedIntel, setDisplayedIntel] = useState('');
  const [canSkip, setCanSkip] = useState(false);

  const {
    fromRoom = 'CHAMBER CLEARED',
    toRoom = 'NEXT PROTOCOL',
    toSubtitle = 'Classified Protocol',
    toCategory = 'Investigation',
    toLevelNumber = 1,
    storyTeaser = 'Decrypting incoming logic vectors and telemetry...',
    isSessionComplete = false
  } = transitionData;

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const soundOnRef = useRef(soundOn);
  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const handlesRef = useRef([]);

  const clearAllHandles = () => {
    handlesRef.current.forEach((h) => {
      clearTimeout(h);
      clearInterval(h);
    });
    handlesRef.current = [];
  };

  const handleComplete = () => {
    clearAllHandles();
    setPhase('exit');
    SoundManager.playSynth('engage', soundOnRef.current);
    const exitTimer = setTimeout(() => {
      if (onFinishRef.current) onFinishRef.current();
    }, 280);
    handlesRef.current.push(exitTimer);
  };

  useEffect(() => {
    if (!isActive) {
      clearAllHandles();
      setPhase('breach');
      setProgress(0);
      setCanSkip(false);
      return;
    }

    clearAllHandles();
    setPhase('breach');
    setProgress(0);
    setDisplayedIntel('');
    setCanSkip(false);

    SoundManager.playSynth('breach', soundOnRef.current);

    const totalDuration = 2400; // 2.4s total cinematic sequence

    // 1. Progress ticker (0 to 100%)
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(pct);
      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
      }
    }, 30);
    handlesRef.current.push(progressInterval);

    // 2. Allow skip after 700ms cooldown (prevents accidental skip from answer submission Enter key)
    const skipCooldown = setTimeout(() => {
      setCanSkip(true);
    }, 700);
    handlesRef.current.push(skipCooldown);

    // 3. Phase: Warp at 450ms
    const warpTimer = setTimeout(() => {
      setPhase('warp');
      SoundManager.playSynth('warp', soundOnRef.current);
    }, 450);
    handlesRef.current.push(warpTimer);

    // 4. Phase: Reveal at 850ms with fast typewriter
    const revealTimer = setTimeout(() => {
      setPhase('reveal');
      SoundManager.playSynth('chime', soundOnRef.current);

      let charIdx = 0;
      const cleanTeaser = String(storyTeaser || 'Decrypting incoming logic vectors...').trim();
      const typeInterval = setInterval(() => {
        charIdx += 3;
        setDisplayedIntel(cleanTeaser.slice(0, charIdx));
        if (charIdx >= cleanTeaser.length) {
          clearInterval(typeInterval);
        }
      }, 16);
      handlesRef.current.push(typeInterval);
    }, 850);
    handlesRef.current.push(revealTimer);

    // 5. Phase: Complete & Auto-exit at 2400ms
    const completeTimer = setTimeout(() => {
      handleComplete();
    }, totalDuration);
    handlesRef.current.push(completeTimer);

    return () => {
      clearAllHandles();
    };
  }, [isActive, toRoom]);

  // Keyboard shortcut listener (guarded by canSkip cooldown)
  useEffect(() => {
    if (!isActive || !canSkip) return;

    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, canSkip]);

  if (!isActive) return null;

  return (
    <div
      className={`cinematic-transition-overlay ${phase === 'exit' ? 'cinematic-transition--exit' : 'cinematic-transition--active'}`}
      onClick={() => { if (canSkip) handleComplete(); }}
    >
      {/* Visualizer backdrops */}
      <div className="cinematic-backdrop-stars" />
      <div className="cinematic-grid-tunnel" />
      <div className="cinematic-lens-flare" />

      {/* Main Holo Card */}
      <div className="cinematic-card" onClick={(e) => e.stopPropagation()}>
        {/* TOP STATUS RIBBON */}
        <div className="cinematic-ribbon">
          <div className="cinematic-ribbon-left">
            <span className="cinematic-live-beacon" />
            <span className="cinematic-beacon-text">
              {isSessionComplete ? 'MISSION CLIMAX // ACCESS SECURED' : 'SECURITY OVERRIDE CONFIRMED // WARP ACTIVE'}
            </span>
          </div>
          <div className="cinematic-ribbon-right">
            <span>LATVERIA-NET GATEWAY ∙ DOOM-OS</span>
          </div>
        </div>

        {/* MAIN HOLOGRAM CORE */}
        <div className="cinematic-body">
          {/* Previous Room Cleared Tag */}
          <div className="cinematic-cleared-tag">
            <IconCheck size={14} color="var(--doom-green)" className="cinematic-cleared-icon" />
            <span>CLEARED: {fromRoom.toUpperCase()}</span>
          </div>

          {/* Incoming Chamber Heading */}
          <div className="cinematic-heading-group">
            <div className="cinematic-eyebrow">
              <span className="cinematic-eyebrow-accent">
                {isSessionComplete ? 'FINAL EVALUATION' : `ENTER CHAMBER ${String(toLevelNumber).padStart(2, '0')} / 30`}
              </span>
              <span className="cinematic-eyebrow-cat">[{toCategory.toUpperCase()}]</span>
            </div>

            <h1 className="cinematic-room-title">
              {toRoom}
            </h1>

            <div className="cinematic-room-sub">
              ▸ PROTOCOL: {toSubtitle}
            </div>
          </div>

          {/* Threat Meter & Status Visualizer */}
          <div className="cinematic-telemetry-strip">
            <div className="cinematic-meter-block">
              <span className="cinematic-meter-label">SECURITY TIER:</span>
              <div className="cinematic-meter-bars">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`cinematic-meter-bar ${i <= (toLevelNumber % 8) ? 'cinematic-meter-bar--lit' : ''}`}
                  />
                ))}
              </div>
            </div>

            <div className="cinematic-meter-block">
              <span className="cinematic-meter-label">ENCRYPTION:</span>
              <span className="cinematic-telemetry-val">LOGIC TRACE DECRYPTED</span>
            </div>
          </div>

          {/* Typewriter Intel Briefing */}
          <div className="cinematic-intel-box">
            <div className="cinematic-intel-header">
              <span className="cinematic-intel-dot" />
              <span>INCOMING MISSION BRIEFING:</span>
            </div>
            <p className="cinematic-intel-text">
              {displayedIntel || 'Decrypting incoming logic vectors and telemetry...'}
              <span className="cinematic-cursor">█</span>
            </p>
          </div>
        </div>

        {/* FOOTER CONTROLS & PROGRESS */}
        <div className="cinematic-footer">
          <div className="cinematic-progress-bar-wrap">
            <div className="cinematic-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="cinematic-actions">
            <span className="cinematic-auto-text">
              WARPING TO OBJECTIVE... {Math.round(progress)}%
            </span>

            {canSkip ? (
              <button
                type="button"
                className="cinematic-engage-btn"
                onClick={handleComplete}
                title="Press Space, Enter or click to engage immediately"
              >
                <span>ENGAGE CHAMBER</span>
                <kbd>SPACE / ENTER</kbd>
                <span className="cinematic-arrow">▶</span>
              </button>
            ) : (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--doom-green)' }}>
                ● INITIALIZING SECTOR...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransitionOverlay;
