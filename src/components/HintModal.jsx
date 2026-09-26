import React, { useEffect } from 'react';
import { IconAlert, IconCheck, IconCross } from './CyberIcons';

export const HintModal = ({ isOpen, stage, hintsUsed = {}, onRevealHint, onClose }) => {
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !stage) return null;

  const used = hintsUsed[stage.key] || [];
  const hints = stage.hints || [];
  const totalPenalty = used.reduce((sum, idx) => sum + (hints[idx]?.penalty || 0), 0);

  return (
    <div
      className="hint-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Intelligence Hints"
    >
      <div
        className="hint-modal-box"
        style={{
          background: 'linear-gradient(180deg, #07150d 0%, #030805 100%)',
          border: '1px solid rgba(0, 255, 102, 0.4)',
          borderRadius: '10px',
          boxShadow: '0 0 50px rgba(0, 255, 102, 0.2), 0 25px 60px rgba(0,0,0,0.8)',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'narrativeFloatIn 0.3s ease-out forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(0, 255, 102, 0.15), rgba(0, 229, 255, 0.05), transparent)',
            borderBottom: '1px solid rgba(0, 255, 102, 0.25)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--doom-green)',
                boxShadow: '0 0 10px var(--doom-green)',
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--doom-green)',
                  letterSpacing: '0.15em',
                  fontWeight: 'bold',
                  display: 'block',
                }}
              >
                TACTICAL INTELLIGENCE DOSSIER // DECRYPTION HINTS
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: 'var(--ink)',
                  letterSpacing: '0.05em',
                }}
              >
                {stage.name}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onClose}
            style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <IconCross size={13} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconAlert size={14} color="var(--doom-amber)" />
              <span>Revealing classified intel reduces <strong>individual timer countdown</strong> and <strong>chamber score</strong> (Base: 20 pts).</span>
            </p>
            {totalPenalty > 0 && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--doom-red)',
                  fontWeight: 'bold',
                }}
              >
                TOTAL PENALTY: −{totalPenalty}s timer / −{used.length >= 3 ? 20 : (used.length === 2 ? 8 : (used.length === 1 ? 3 : 0))} pts
              </span>
            )}
          </div>

          {/* Hint items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {hints.map((h, idx) => {
              const alreadyRevealed = used.includes(idx);
              const tierNames = [
                'HINT 1 · GUIDANCE INTEL (−3 PTS)',
                'HINT 2 · SYSTEM ANALYSIS (−5 PTS)',
                'HINT 3 · DIRECT OVERRIDE CIPHER (EXACT ANSWER ∙ 0 PTS TOTAL)'
              ];
              const tierName = tierNames[idx] || `HINT ${idx + 1}`;
              const penaltyLabel = idx === 2
                ? `−${h.penalty || 20}s timer / 0 PTS EARNED`
                : `−${h.penalty || 20}s timer / −${idx === 0 ? 3 : 5} pts`;

              return (
                <div
                  key={idx}
                  style={{
                    background: alreadyRevealed
                      ? 'linear-gradient(135deg, rgba(0, 255, 102, 0.08) 0%, rgba(0, 20, 10, 0.6) 100%)'
                      : (idx === 2 ? 'rgba(40, 10, 15, 0.4)' : 'rgba(0, 0, 0, 0.4)'),
                    border: alreadyRevealed
                      ? '1px solid rgba(0, 255, 102, 0.4)'
                      : (idx === 2 ? '1px solid rgba(255, 34, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)'),
                    borderRadius: '6px',
                    padding: '14px 16px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 'bold',
                          color: alreadyRevealed
                            ? 'var(--doom-green-bright)'
                            : (idx === 2 ? 'var(--doom-red, #ff3355)' : 'var(--ink-dim)'),
                          letterSpacing: '0.1em',
                        }}
                      >
                        {tierName}
                      </span>
                      {alreadyRevealed && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: 'rgba(0, 255, 102, 0.15)',
                            color: 'var(--doom-green-bright)',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <IconCheck size={11} color="var(--doom-green-bright)" /> DECRYPTED
                        </span>
                      )}
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        color: idx === 2 ? 'var(--doom-red, #ff3355)' : 'var(--doom-amber)',
                        fontWeight: 'bold',
                      }}
                    >
                      PENALTY: {penaltyLabel}
                    </span>
                  </div>

                  {idx === 2 && !alreadyRevealed && (
                    <div style={{
                      marginBottom: '8px',
                      padding: '6px 10px',
                      background: 'rgba(255, 34, 68, 0.12)',
                      border: '1px solid rgba(255, 34, 68, 0.3)',
                      borderRadius: '4px',
                      color: '#ff8899',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <IconAlert size={14} color="#ff3355" />
                      <span>CRITICAL: Revealing Hint 3 gives the exact answer. Using 3 hints awards ZERO (0) points for this chamber!</span>
                    </div>
                  )}

                  {alreadyRevealed ? (
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.98rem',
                        lineHeight: '1.5',
                        color: 'var(--ink)',
                        background: 'rgba(0, 0, 0, 0.5)',
                        borderLeft: idx === 2 ? '3px solid var(--doom-red)' : '3px solid var(--doom-green)',
                        padding: '10px 14px',
                        borderRadius: '0 4px 4px 0',
                        marginTop: '6px',
                      }}
                    >
                      {h.text}
                      {idx === 2 && (
                        <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#ff6677', fontFamily: 'var(--font-mono)' }}>
                          [OVERRIDE CIPHER DECRYPTED — 0 POINTS EARNED FOR THIS CHAMBER]
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
                        {idx === 2 ? 'Reveals direct answer. Chamber score becomes 0.' : 'Encrypted intel packet. Applies timer & point deduction.'}
                      </span>
                      <button
                        type="button"
                        className={`btn ${idx === 2 ? 'btn--danger' : 'btn--primary'} btn--sm btn--charge`}
                        onClick={() => {
                          onRevealHint(stage.key, idx, h.penalty);
                        }}
                        style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }}
                      >
                        DECRYPT ({penaltyLabel})
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            RETURN TO MISSION
          </button>
        </div>
      </div>
    </div>
  );
};
