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
  const [wrongCount, setWrongCount] = useState(
    stage?.wrongCount !== undefined
      ? stage.wrongCount
      : (stage?.isSolved ? Math.max(0, (stage?.attemptsUsed || 1) - 1) : (stage?.attemptsUsed || 0))
  );
  const [potentialPoints, setPotentialPoints] = useState(stage?.potentialPoints ?? 20);
  const inputRef = useRef(null);

  // ── Effect 1: Full state reset when QUESTION CHANGES (key/id/solved status)
  // Only resets feedback, answer, submitting flags — NOT triggered by score changes
  useEffect(() => {
    setAnswer(initialInput || '');
    if (stage?.isSolved) {
      setFeedback({ message: 'Protocol override confirmed.', isGranted: true });
    } else {
      setFeedback(null);
    }
    setIsSubmitting(false);
    setShaking(false);
    setFocusActive(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.key, stage?.id, stage?.isSolved, initialInput]);

  // ── Effect 2: Silently update wrongCount & potentialPoints when server syncs score data
  // Does NOT touch feedback — this prevents wiping error messages after a wrong answer
  useEffect(() => {
    const incoming = stage?.wrongCount !== undefined
      ? stage.wrongCount
      : (stage?.isSolved ? Math.max(0, (stage?.attemptsUsed || 1) - 1) : (stage?.attemptsUsed || 0));
    // Only update if the value actually increased (never go backwards on live state)
    setWrongCount((prev) => (incoming > prev ? incoming : prev));

    const usedHintsCount = (hintsUsed?.[stage?.key] || []).length;
    const hDeduct = usedHintsCount >= 3 ? 20 : (usedHintsCount === 2 ? 8 : (usedHintsCount === 1 ? 3 : 0));
    const penWrongs = Math.max(0, incoming - 2);
    const calculatedPotential = usedHintsCount >= 3 ? 0 : Math.max(0, 20 - hDeduct - (penWrongs * 2));
    setPotentialPoints(stage?.potentialPoints !== undefined ? stage.potentialPoints : calculatedPotential);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.wrongCount, stage?.attemptsUsed, stage?.potentialPoints]);

  // ── Effect 3: Auto-focus input on question entry
  useEffect(() => {
    if (!stage?.isSolved && !isTimeExpired && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [stage?.key, stage?.id, stage?.isSolved, isTimeExpired]);

  // ── Effect 4: Reveal animation on mount
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isTimeExpired || !answer.trim() || isSubmitting || feedback?.isGranted) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await onSubmitAnswer(stage.key, answer);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ message: res.successNote || 'Protocol override confirmed.', isGranted: true });
    } else {
      const newWrongCount = res.wrongCount !== undefined ? res.wrongCount : (wrongCount + 1);
      setWrongCount(newWrongCount);
      const taunt = DOOM_TAUNTS[Math.floor(Math.random() * DOOM_TAUNTS.length)];
      setFeedback({ message: res.message || taunt, isGranted: false });
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const used = hintsUsed[stage.key] || [];
  const totalPenalty = used.reduce((sum, idx) => sum + (stage.hints?.[idx]?.penalty || 0), 0);

  // Dynamic point calculation display based on hints & wrong attempts beyond 2 free attempts
  const hintDeduction = used.length >= 3 ? 20 : (used.length === 2 ? 8 : (used.length === 1 ? 3 : 0));
  const penalizedWrongs = Math.max(0, wrongCount - 2);
  const wrongPenalty = penalizedWrongs * 2;
  const livePotential = used.length >= 3 ? 0 : Math.max(0, 20 - hintDeduction - wrongPenalty);

  return (
    <div
      className={`puzzle-card-cinematic ${revealed ? 'puzzle-card-cinematic--revealed' : ''} ${shaking ? 'puzzle-card-cinematic--shake' : ''} ${feedback?.isGranted ? 'puzzle-card-cinematic--success' : ''} ${isTimeExpired && !feedback?.isGranted ? 'puzzle-card-cinematic--expired' : ''}`}
    >
      {/* ─── TOP HEADER BAR ─── */}
      <div className="pc-header">
        <div className="pc-header__left">
          <div className={`pc-status-orb ${feedback?.isGranted ? 'pc-status-orb--granted' : isTimeExpired ? 'pc-status-orb--denied' : feedback?.isGranted === false ? 'pc-status-orb--denied' : 'pc-status-orb--active'}`} />
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
            <span style={{ color: livePotential > 0 ? '#00FF9C' : '#FF4D5A', fontWeight: '700', fontSize: '0.95rem' }}>
              {livePotential} / 20
            </span>
          </div>
          <div>
            <span style={{ color: '#718078', fontSize: '0.7rem', display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase' }}>PENALTY</span>
            <span style={{ color: (hintDeduction + wrongPenalty) > 0 ? '#FF4D5A' : '#9BAFA5', fontWeight: '600', fontSize: '0.95rem' }}>
              {(hintDeduction + wrongPenalty) > 0 ? `-${hintDeduction + wrongPenalty}` : '0'}
            </span>
          </div>
          <div>
            <span style={{ color: '#718078', fontSize: '0.7rem', display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase' }}>WRONG</span>
            <span style={{ color: wrongCount > 0 ? (wrongCount > 2 ? '#FF4D5A' : '#F0B429') : '#9BAFA5', fontWeight: '600', fontSize: '0.95rem' }}>
              {wrongCount}
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
              background: feedback?.isGranted
                ? 'rgba(0, 255, 156, 0.15)'
                : wrongCount > 2
                  ? 'rgba(255, 77, 90, 0.15)'
                  : wrongCount > 0
                    ? 'rgba(240, 180, 41, 0.15)'
                    : 'rgba(0, 255, 156, 0.12)',
              color: feedback?.isGranted
                ? '#00FF9C'
                : wrongCount > 2
                  ? '#FF4D5A'
                  : wrongCount > 0
                    ? '#F0B429'
                    : '#00FF9C',
              border: `1px solid ${
                feedback?.isGranted
                  ? 'rgba(0,255,156,0.4)'
                  : wrongCount > 2
                    ? '#FF4D5A'
                    : wrongCount > 0
                      ? '#F0B429'
                      : 'rgba(0,255,156,0.3)'
              }`
            }}>
              {feedback?.isGranted
                ? 'CLEARED'
                : wrongCount === 0
                  ? 'UNLIMITED (2 FREE)'
                  : wrongCount === 1
                    ? '1 WRONG (1 FREE LEFT)'
                    : wrongCount === 2
                      ? '2 WRONG (NEXT: −2 PTS)'
                      : `${wrongCount} WRONG (−${penalizedWrongs * 2} PTS)`}
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
                  isTimeExpired && !feedback?.isGranted
                    ? "Time expired — terminal locked"
                    : "Enter override key..."
                }
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onFocus={() => setFocusActive(true)}
                onBlur={() => setFocusActive(false)}
                disabled={feedback?.isGranted || isSubmitting || (isTimeExpired && !feedback?.isGranted)}
                className={`pc-input ${focusActive ? 'pc-input--focused' : ''} ${(feedback?.isGranted === false || (isTimeExpired && !feedback?.isGranted)) ? 'pc-input--error' : ''} ${feedback?.isGranted ? 'pc-input--success' : ''}`}
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
              disabled={feedback?.isGranted || isSubmitting || !answer.trim() || (isTimeExpired && !feedback?.isGranted)}
              id="btn-submit-answer"
              style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.88rem' }}
            >
              {isSubmitting ? (
                <span>TRANSMITTING...</span>
              ) : feedback?.isGranted ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><IconCheck size={13} /> BREACHED</span>
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
              disabled={feedback?.isGranted || isTimeExpired}
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
                cursor: (feedback?.isGranted || isTimeExpired) ? 'not-allowed' : 'pointer',
                opacity: (feedback?.isGranted || isTimeExpired) ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <IconLightbulb size={14} color="#F0B429" />
              <span>[ ? REQUEST HINT ]</span>
            </button>
            {totalPenalty > 0 || hintDeduction > 0 || wrongPenalty > 0 ? (
              <span className="pc-penalty" style={{ color: '#FF4D5A', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <IconAlert size={14} color="#FF4D5A" /> Penalty: {totalPenalty > 0 ? `−${totalPenalty}s ` : ''}{hintDeduction > 0 ? `−${hintDeduction} hint pts ` : ''}{wrongPenalty > 0 ? `−${wrongPenalty} wrong pts` : ''}
              </span>
            ) : (
              <span style={{ color: '#718078', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                BASE: 20 PTS · HINT 1: −3 PTS · HINT 2: −5 PTS · 2 FREE ATTEMPTS, THEN −2 PTS/WRONG
              </span>
            )}
          </div>

          {/* ─── TIME EXPIRED BANNER ─── */}
          {isTimeExpired && !feedback?.isGranted && (
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
