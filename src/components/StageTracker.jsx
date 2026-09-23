import React from 'react';
import { IconCheck, IconLock } from './CyberIcons';

export const StageTracker = ({
  currentPartId = 1,
  levels = [],
  currentLevelIndex = 0,
  solvedPuzzles = [],
  onSelectLevel,
  onOpenLevelSelect,
}) => {
  return (
    <nav className="stage-tracker" id="stage-tracker" aria-label="Mission levels">
      <button
        onClick={onOpenLevelSelect}
        className="btn btn--ghost btn--sm"
        style={{
          border: '1px solid rgba(212, 175, 55, 0.35)',
          color: '#F0B429',
          background: 'rgba(212, 175, 55, 0.08)',
          fontSize: '11px',
          letterSpacing: '0.03em',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          flexShrink: 0,
          borderRadius: '4px',
          textTransform: 'none'
        }}
        title="Open Level Selection"
      >
        <span>Session {currentPartId} ({currentPartId === 1 ? '01–15' : '16–30'})</span>
        <span style={{ fontSize: '9px', opacity: 0.7 }}>▼</span>
      </button>

      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center' }}>
        {levels.map((lvl, idx) => {
          const isDone = solvedPuzzles.includes(lvl.key);
          const isCurrent = idx === currentLevelIndex;
          const isUnlocked = idx === 0 || solvedPuzzles.includes(levels[idx - 1]?.key);

          let pillClass = 'stage-pill';
          if (isDone) pillClass += ' is-done';
          if (isCurrent) pillClass += ' is-current';
          if (!isUnlocked && !isDone) pillClass += ' is-locked';

          return (
            <button
              key={lvl.key || idx}
              type="button"
              className={pillClass}
              disabled={!isUnlocked}
              onClick={() => isUnlocked && onSelectLevel && onSelectLevel(idx)}
              title={
                isDone
                  ? `Level ${lvl.id} Cleared: ${lvl.name}`
                  : isUnlocked
                    ? `Go to Level ${lvl.id}: ${lvl.name}`
                    : `Level ${lvl.id} is Locked — Solve Level ${lvl.id - 1} first`
              }
            >
              <span>{String(lvl.id).padStart(2, '0')}</span>
              {isDone && <IconCheck size={10} color="#00FF9C" />}
              {!isUnlocked && !isDone && <IconLock size={10} color="#718078" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
