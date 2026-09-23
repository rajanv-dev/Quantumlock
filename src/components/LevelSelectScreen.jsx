import React from 'react';
import { IconCheck, IconLock, IconCross } from './CyberIcons';

export const LevelSelectScreen = ({
  isOpen,
  parts = [],
  currentLevelIndex = 0,
  unlockedLevelIndex = 0,
  solvedPuzzles = [],
  onSelectLevel,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay is-open" id="level-select-modal" style={{ zIndex: 100 }}>
      <div className="modal-content modal-content--lg" style={{ maxWidth: '920px', width: '90%' }}>
        <div className="modal-head" style={{ borderBottom: '1px solid var(--doom-green-dim)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--doom-green)' }}>CAMPAIGN MISSION SELECTOR</span>
            <h2 style={{ margin: '4px 0 0', color: 'var(--doom-text-bright)', letterSpacing: '2px' }}>
              SELECT LEVEL (2 SESSIONS · 14 CHAMBERS)
            </h2>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <IconCross size={13} />
            <span>CLOSE</span>
          </button>
        </div>

        <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '8px', margin: '20px 0' }}>
          {parts.map((part) => (
            <div key={part.id} style={{ marginBottom: '28px' }}>
              <div style={{
                background: 'rgba(0, 255, 100, 0.05)',
                borderLeft: '4px solid var(--doom-green)',
                padding: '10px 14px',
                marginBottom: '14px'
              }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--doom-green)', letterSpacing: '1px' }}>
                  {part.title}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9bb' }}>
                  {part.description}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '14px'
              }}>
                {part.levels.map((lvl, lvlIdx) => {
                  const globalIdx = lvlIdx;
                  const isDone = solvedPuzzles.includes(lvl.key);
                  const isUnlocked = lvlIdx === 0 || solvedPuzzles.includes(part.levels[lvlIdx - 1]?.key);
                  const isSelected = globalIdx === currentLevelIndex;

                  return (
                    <div
                      key={lvl.key}
                      onClick={() => isUnlocked && onSelectLevel(globalIdx)}
                      style={{
                        background: isSelected ? 'rgba(0, 255, 100, 0.12)' : 'rgba(10, 20, 15, 0.85)',
                        border: isSelected
                          ? '2px solid var(--doom-green)'
                          : isDone
                          ? '1px solid rgba(0, 255, 100, 0.5)'
                          : isUnlocked
                          ? '1px solid rgba(0, 255, 100, 0.25)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '14px',
                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        opacity: isUnlocked ? 1 : 0.45,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--doom-green)' }}>
                            LEVEL {lvl.id}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isDone ? 'rgba(0, 255, 100, 0.2)' : isUnlocked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.2)',
                            color: isDone ? 'var(--doom-green)' : isUnlocked ? '#aaa' : '#ff5555',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {isDone ? (
                              <><IconCheck size={11} color="var(--doom-green)" /> CLEARED</>
                            ) : isUnlocked ? (
                              'UNLOCKED'
                            ) : (
                              <><IconLock size={11} color="#ff5555" /> LOCKED</>
                            )}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#fff' }}>{lvl.name}</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: '#8a9b93', lineHeight: '1.3' }}>{lvl.subtitle}</p>
                      </div>

                      <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--doom-muted)' }}>COLLEGE STEM</span>
                        {isUnlocked && (
                          <button
                            className={`btn ${isSelected ? 'btn--primary' : 'btn--ghost'} btn--sm`}
                            style={{ padding: '3px 8px', fontSize: '10px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLevel(globalIdx);
                            }}
                          >
                            {isSelected ? 'ACTIVE' : 'ENTER'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn--ghost" onClick={onClose}>BACK TO MISSION</button>
        </div>
      </div>
    </div>
  );
};
