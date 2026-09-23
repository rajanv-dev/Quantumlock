import React, { useState, useEffect } from 'react';
import { voiceManager } from '../utils/voiceManager';
import { DOOM_EMOTIONS } from '../data/doomDialogue';
import { IconVolume, IconVolumeMute, IconChevronRight } from './CyberIcons';

const EMOTION_COLORS = {
  [DOOM_EMOTIONS.IDLE]:        { border: 'var(--doom-green)',   glow: 'rgba(0,255,102,0.3)',    avatar: '#00ff66' },
  [DOOM_EMOTIONS.SPEAKING]:    { border: 'var(--doom-green)',   glow: 'rgba(0,255,102,0.3)',    avatar: '#00ff66' },
  [DOOM_EMOTIONS.CALCULATING]: { border: 'var(--doom-cyan)',    glow: 'rgba(0,229,255,0.35)',   avatar: '#00e5ff' },
  [DOOM_EMOTIONS.AMUSED]:      { border: 'var(--doom-purple)',  glow: 'rgba(168,85,247,0.35)',  avatar: '#a855f7' },
  [DOOM_EMOTIONS.THREATENING]: { border: 'var(--doom-amber)',   glow: 'rgba(255,170,0,0.4)',    avatar: '#ffaa00' },
  [DOOM_EMOTIONS.ENRAGED]:     { border: 'var(--doom-red)',     glow: 'rgba(255,34,68,0.5)',    avatar: '#ff2244' },
  [DOOM_EMOTIONS.DECEPTIVE]:   { border: 'var(--doom-purple)',  glow: 'rgba(168,85,247,0.3)',   avatar: '#c084fc' },
  [DOOM_EMOTIONS.GLITCHING]:   { border: 'var(--doom-red)',     glow: 'rgba(255,34,68,0.6)',    avatar: '#ff6680' },
};

const DEFAULT_COLOR = { border: 'var(--doom-green)', glow: 'rgba(0,255,102,0.25)', avatar: '#00ff66' };

export function DoomDialogueOverlay({ dialogue, onChoice, onDismiss }) {
  const [displayedText, setDisplayedText]   = useState('');
  const [isTyping, setIsTyping]             = useState(false);
  const [isMuted, setIsMuted]               = useState(voiceManager.isMuted);
  const [glitch, setGlitch]                 = useState(false);

  // Subscribe to mute state changes
  useEffect(() => {
    const unsub = voiceManager.subscribe((event, data) => {
      if (event === 'muteChange') setIsMuted(data);
    });
    return unsub;
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!dialogue?.text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let i = 0;
    const full = dialogue.text;
    setDisplayedText('');

    const interval = setInterval(() => {
      i++;
      setDisplayedText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [dialogue?.id, dialogue?.text]);

  // Glitch flash on enraged/glitching
  useEffect(() => {
    if (!dialogue) return;
    const em = dialogue.emotion;
    if (em === DOOM_EMOTIONS.ENRAGED || em === DOOM_EMOTIONS.GLITCHING) {
      const t = setInterval(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 80);
      }, 1800);
      return () => clearInterval(t);
    }
  }, [dialogue?.emotion]);

  if (!dialogue) return null;

  const emotion = dialogue.emotion || DOOM_EMOTIONS.IDLE;
  const speaker = dialogue.speaker || 'DOOM';
  const colors  = EMOTION_COLORS[emotion] || DEFAULT_COLOR;
  const hasChoices = dialogue.choices && dialogue.choices.length > 0;

  return (
    <div className="ddov-wrapper">
      <div
        className={`ddov-card ${glitch ? 'ddov-card--glitch' : ''}`}
        style={{ '--ddov-border': colors.border, '--ddov-glow': colors.glow }}
      >
        {/* ── TOP STRIP ── */}
        <div className="ddov-header">
          {/* Avatar + speaker */}
          <div className="ddov-speaker-block">
            <div className="ddov-avatar" style={{ '--avatar-color': colors.avatar }}>
              <div className="ddov-avatar__ring" />
              <span className="ddov-avatar__eye">👁</span>
            </div>
            <div className="ddov-speaker-info">
              <span className="ddov-speaker-name">{speaker}</span>
              <span className="ddov-speaker-tag" style={{ color: colors.border }}>
                ◆ {emotion.toUpperCase()} ◆
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="ddov-controls">
            <button
              className={`ddov-ctrl ${isMuted ? 'ddov-ctrl--amber' : ''}`}
              onClick={() => voiceManager.toggleMute ? voiceManager.toggleMute() : voiceManager.toggle()}
              title={isMuted ? 'Unmute' : 'Mute'}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isMuted ? <IconVolumeMute size={13} /> : <IconVolume size={13} />}
            </button>
            <button
              className="ddov-ctrl"
              onClick={() => voiceManager.speak(dialogue.text, { emotion })}
              title="Replay"
              style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}
            >
              REPLAY
            </button>
          </div>
        </div>

        {/* ── DIALOGUE TEXT ── */}
        <div className="ddov-body">
          <p className="ddov-text">
            "{displayedText}{isTyping && <span className="ddov-cursor">█</span>}"
          </p>
        </div>

        {/* ── CHOICES (if any) ── */}
        {hasChoices && !isTyping && (
          <div className="ddov-choices">
            <div className="ddov-choices__label">TRANSMIT RESPONSE:</div>
            <div className="ddov-choices__grid">
              {dialogue.choices.map((c) => (
                <button
                  key={c.id}
                  className="ddov-choice-btn"
                  onClick={() => onChoice(c)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <IconChevronRight size={13} color="var(--doom-green)" />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── DEFAULT CONTINUE / DISMISS ── */}
        {!isTyping && (
          <div className="ddov-footer">
            {hasChoices && (
              <span className="ddov-footer__hint">Choose a response above — or dismiss to continue silently</span>
            )}
            <button
              className="ddov-continue-btn"
              onClick={onDismiss}
            >
              {hasChoices ? 'SKIP / DISMISS ✕' : 'ACKNOWLEDGED // CONTINUE ▶'}
            </button>
          </div>
        )}

        {/* Decorative scan line */}
        <div className="ddov-scanline" />
      </div>
    </div>
  );
}

export default DoomDialogueOverlay;
