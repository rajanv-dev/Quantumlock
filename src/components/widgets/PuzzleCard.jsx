import React, { useState, useEffect, useRef } from 'react';
import { IconLock, IconCheck, IconCross, IconAlert, IconLightbulb } from '../CyberIcons';

const DOOM_TAUNTS = [
  "Incorrect key. Verify calculations and retry.",
  "Access denied. Recalibrate input parameters.",
  "Authentication failed. Validation check mismatched.",
  "Transmission rejected. Recheck your methodology.",
];

export const PuzzleCard = ({ stage, hintsUsed, initialInput, isTimeExpired, onSubmitAnswer, onRequestHint }) => {
  const [answer, setAnswer] = useState(initialInput || '');
  const [feedback, setFeedback] = useState(stage?.isSolved ? { message: 'Protocol override confirmed.', isGranted: true } : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusActive, setFocusActive] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(stage?.attemptsRemaining ?? 2);
  const [isLocked, setIsLocked] = useState(stage?.isLocked ?? false);
  const [potentialPoints, setPotentialPoints] = useState(stage?.potentialPoints ?? (stage?.isLocked ? 0 : 20));
  const inputRef = useRef(null);

  // Clean reset whenever stage/room changes
  useEffect(() => {
    setAnswer(initialInput || '');
    const locked = Boolean(stage?.isLocked);
    setIsLocked(locked);
    const rem = stage?.isSolved ? 0 : (stage?.attemptsRemaining !== undefined ? stage.attemptsRemaining : 2);
    setAttemptsRemaining(rem);
    setPotentialPoints(stage?.potentialPoints !== undefined ? stage.potentialPoints : (locked ? 0 : 20));

    if (stage?.isSolved) {
      setFeedback({ message: 'Protocol override confirmed.', isGranted: true });
    } else if (locked) {
      setFeedback({ message: 'Chamber locked: 2 of 2 wrong attempts used.', isGranted: false });
    } else {
      setFeedback(null);
    }
    setIsSubmitting(false);
    setShaking(false);
    setFocusActive(false);
  }, [stage?.key, stage?.id, stage?.isSolved, stage?.attemptsRemaining, stage?.isLocked, stage?.potentialPoints, initialInput]);

  // Focus input when entering an unsolved & unlocked chamber (if time remains)
  useEffect(() => {
    if (!stage?.isSolved && !isTimeExpired && !isLocked && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [stage?.key, stage?.id, stage?.isSolved, isTimeExpired, isLocked]);

  // Reveal animation on mount
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isTimeExpired || !answer.trim() || isSubmitting || feedback?.isGranted || isLocked) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await onSubmitAnswer(stage.key, answer);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ message: res.successNote || 'Protocol override confirmed.', isGranted: true });
      setAttemptsRemaining(0);
      setIsLocked(false);
    } else {
      if (res.attemptsRemaining !== undefined) {
        setAttemptsRemaining(res.attemptsRemaining);
      }
      if (res.isLocked !== undefined) {
        setIsLocked(res.isLocked);
        if (res.isLocked) setPotentialPoints(0);
      }
      const taunt = DOOM_TAUNTS[Math.floor(Math.random() * DOOM_TAUNTS.length)];
      setFeedback({ message: res.message || taunt, isGranted: false });
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const used = hintsUsed[stage.key] || [];
  const totalPenalty = used.reduce((sum, idx) => sum + (stage.hints?.[idx]?.penalty || 0), 0);

  // Dynamic point calculation display based on hints & remaining attempts
  const hintDeduction = used.length >= 3 ? 20 : (used.length === 2 ? 8 : (used.length === 1 ? 3 : 0));
  const attemptPenalty = (2 - attemptsRemaining) * 2;
  const livePotential = isLocked ? 0 : Math.max(0, 20 - hintDeduction - attemptPenalty);

  return (
    <div
      className={`puzzle-card-cinematic ${revealed ? 'puzzle-card-cinematic--revealed' : ''} ${shaking ? 'puzzle-card-cinematic--shake' : ''} ${feedback?.isGranted ? 'puzzle-card-cinematic--success' : ''} ${isTimeExpired && !feedback?.isGranted ? 'puzzle-card-cinematic--expired' : ''}`}
    >
      {/* ─── TOP HEADER BAR ─── */}
      <div className="pc-header">
        <div className="pc-header__left">
          <div className={`pc-status-orb ${feedback?.isGranted ? 'pc-status-orb--granted' : (isTimeExpired || isLocked) ? 'pc-status-orb--denied' : feedback?.isGranted === false ? 'pc-status-orb--denied' : 'pc-status-orb--active'}`} />
          <span className="pc-header__label" style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: '700', color: '#E8F5EE', letterSpacing: '0.06em' }}>
            ● OVERRIDE CONSOLE
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#00FF9C', marginLeft: '8px', letterSpacing: '0.05em' }}>DOOM OS</span>
        </div>
        <div className="pc-header__right">
          <span className="pc-header__level" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#9BAFA5', letterSpacing: '0.03em' }}>
            LEVEL {String(stage.id).padStart(2, '0')} · SESSION {stage.id <= 15 ? 1 : 2}
          </span>
          {feedback?.isGranted ? (
            <span className="pc-status-tag pc-status-tag--breached" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              <IconCheck size={12} color="#00FF9C" /> BREACHED
            </span>
          ) : isLocked ? (
            <span className="pc-status-tag" style={{ background: 'rgba(255, 77, 90, 0.15)', color: '#FF4D5A', borderColor: '#FF4D5A', display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              <IconLock size={12} color="#FF4D5A" /> TERMINAL LOCKED
            </span>
          ) : isTimeExpired ? (
            <span className="pc-status-tag" style={{ background: 'rgba(255, 77, 90, 0.15)', color: '#FF4D5A', borderColor: '#FF4D5A', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              TIMED OUT
            </span>
          ) : (
            <span className="pc-status-tag pc-status-tag--locked" style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: '#00FF9C', borderColor: 'rgba(0, 255, 156, 0.4)' }}>
              STATUS: ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* ─── CHAMBER SCORING & CHANCES TRACKER BAR ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(0, 20, 14, 0.5)',
        borderBottom: '1px solid rgba(0, 255, 156, 0.2)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <span style={{ color: '#718078', fontSize: '0.7rem', display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase' }}>SCORE</span>
            <span style={{ color: isLocked ? '#FF4D5A' : '#00FF9C', fontWeight: '700', fontSize: '0.95rem' }}>
              {isLocked ? '0 / 20' : `${livePotential} / 20`}
            </span>
          </div>
          <div>
            <span style={{ color: '#718078', fontSize: '0.7rem', display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase' }}>PENALTY</span>
            <span style={{ color: (hintDeduction + attemptPenalty) > 0 ? '#FF4D5A' : '#9BAFA5', fontWeight: '600', fontSize: '0.95rem' }}>
              {(hintDeduction + attemptPenalty) > 0 ? `-${hintDeduction + attemptPenalty}` : '0'}
            </span>
          </div>
          <div>
            <span style={{ color: '#718078', fontSize: '0.7rem', display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase' }}>WRONG</span>
            <span style={{ color: (2 - attemptsRemaining) > 0 ? '#FF4D5A' : '#9BAFA5', fontWeight: '600', fontSize: '0.95rem' }}>
              {2 - attemptsRemaining}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div>
            <span style={{ color: '#718078', fontSize: '0.7rem', display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right' }}>ATTEMPTS</span>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: '700',
              fontSize: '0.82rem',
              display: 'inline-block',
              marginTop: '2px',
              background: isLocked ? 'rgba(255, 77, 90, 0.15)' : attemptsRemaining === 1 ? 'rgba(240, 180, 41, 0.15)' : 'rgba(0, 255, 156, 0.12)',
              color: isLocked ? '#FF4D5A' : attemptsRemaining === 1 ? '#F0B429' : '#00FF9C',
              border: `1px solid ${isLocked ? '#FF4D5A' : attemptsRemaining === 1 ? '#F0B429' : 'rgba(0,255,156,0.3)'}`
            }}>
              {isLocked ? '00 / 02 REMAINING' : feedback?.isGranted ? 'CLEARED' : `0${attemptsRemaining} / 02 REMAINING`}
            </span>
          </div>
        </div>
      </div>

      {/* ─── ANSWER FORM ─── */}
      <div className="pc-form-area">
        <form onSubmit={handleSubmit}>
          <label className={`pc-form-label ${focusActive ? 'pc-form-label--active' : ''}`} htmlFor="pc-answer-input" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem', color: '#00FF9C', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
            &gt; ENTER ACCESS KEY
          </label>

          <div className="pc-input-row" style={{ marginTop: '6px' }}>
            <div className="pc-input-wrap">
              <input
                id="pc-answer-input"
                ref={inputRef}
                type="text"
                autoComplete="off"
                spellCheck="false"
                placeholder={
                  isLocked
                    ? "Max attempts reached — terminal locked"
                    : isTimeExpired && !feedback?.isGranted
                      ? "Time expired — terminal locked"
                      : "Enter override key..."
                }
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onFocus={() => setFocusActive(true)}
                onBlur={() => setFocusActive(false)}
                disabled={feedback?.isGranted || isSubmitting || (isTimeExpired && !feedback?.isGranted) || isLocked}
                className={`pc-input ${focusActive ? 'pc-input--focused' : ''} ${(feedback?.isGranted === false || isLocked || (isTimeExpired && !feedback?.isGranted)) ? 'pc-input--error' : ''} ${feedback?.isGranted ? 'pc-input--success' : ''}`}
                style={{ letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}
              />
              {feedback?.isGranted && (
                <span className="pc-input-checkmark">
                  <IconCheck size={14} color="#00FF9C" />
                </span>
              )}
            </div>

            <button
              type="submit"
              className={`pc-submit-btn ${isSubmitting ? 'pc-submit-btn--loading' : ''} ${feedback?.isGranted ? 'pc-submit-btn--success' : ''}`}
              disabled={feedback?.isGranted || isSubmitting || !answer.trim() || (isTimeExpired && !feedback?.isGranted) || isLocked}
              id="btn-submit-answer"
              style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.88rem' }}
            >
              {isSubmitting ? (
                <span>TRANSMITTING...</span>
              ) : feedback?.isGranted ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><IconCheck size={13} /> BREACHED</span>
              ) : isLocked ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><IconLock size={13} /> LOCKED</span>
              ) : isTimeExpired ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><IconLock size={13} /> TIME EXPIRED</span>
              ) : (
                <>[ TRANSMIT OVERRIDE ]</>
              )}
            </button>
          </div>

          {/* ─── HINT + PENALTY ROW ─── */}
          <div className="pc-meta-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              className="pc-hint-btn"
              id="btn-request-hint"
              onClick={onRequestHint}
              disabled={feedback?.isGranted || isTimeExpired || isLocked}
              style={{
                background: 'rgba(240, 180, 41, 0.1)',
                border: '1px solid rgba(240, 180, 41, 0.4)',
                color: '#F0B429',
                borderRadius: '4px',
                padding: '6px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                fontWeight: '600',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: (feedback?.isGranted || isTimeExpired || isLocked) ? 'not-allowed' : 'pointer',
                opacity: (feedback?.isGranted || isTimeExpired || isLocked) ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <IconLightbulb size={14} color="#F0B429" />
              <span>[ ? REQUEST HINT ]</span>
            </button>
            {totalPenalty > 0 || hintDeduction > 0 ? (
              <span className="pc-penalty" style={{ color: '#FF4D5A', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <IconAlert size={14} color="#FF4D5A" /> Hint penalty: −{totalPenalty}s / −{hintDeduction} pts
              </span>
            ) : (
              <span style={{ color: '#718078', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                BASE: 20 PTS · HINT 1: −3 PTS · HINT 2: −5 PTS · WRONG: −2 PTS & 1 ATTEMPT
              </span>
            )}
          </div>

          {/* ─── LOCKED OUT BANNER ─── */}
          {isLocked && !feedback?.isGranted && (
            <div className="pc-feedback pc-feedback--error" style={{ marginTop: '14px', borderColor: '#FF4D5A' }} role="alert">
              <span className="pc-feedback__icon"><IconLock size={18} color="#FF4D5A" /></span>
              <span className="pc-feedback__msg">
                Max attempts reached (2 of 2 wrong attempts). Override terminal locked.
              </span>
            </div>
          )}

          {/* ─── TIME EXPIRED BANNER ─── */}
          {isTimeExpired && !feedback?.isGranted && !isLocked && (
            <div className="pc-feedback pc-feedback--error" style={{ marginTop: '14px', borderColor: '#FF4D5A' }} role="alert">
              <span className="pc-feedback__icon"><IconAlert size={18} color="#FF4D5A" /></span>
              <span className="pc-feedback__msg">
                Time expired. The override terminal is locked.
              </span>
            </div>
          )}

          {/* ─── FEEDBACK PANEL ─── */}
          {feedback && (!isTimeExpired || feedback.isGranted) && (
            <div className={`pc-feedback ${feedback.isGranted ? 'pc-feedback--success' : 'pc-feedback--error'}`} role="status">
              <span className="pc-feedback__icon">
                {feedback.isGranted ? <IconCheck size={18} color="#00FF9C" /> : <IconCross size={18} color="#FF4D5A" />}
              </span>
              <span className="pc-feedback__msg">{feedback.message}</span>
            </div>
          )}
        </form>
      </div>

      {/* ─── SUCCESS GLOW OVERLAY ─── */}
      {feedback?.isGranted && (
        <div className="pc-success-glow" />
      )}

      {/* ─── CORNER BRACKET DECORATIONS ─── */}
      <div className="pc-bracket pc-bracket--tl" />
      <div className="pc-bracket pc-bracket--tr" />
      <div className="pc-bracket pc-bracket--bl" />
      <div className="pc-bracket pc-bracket--br" />
    </div>
  );
};
