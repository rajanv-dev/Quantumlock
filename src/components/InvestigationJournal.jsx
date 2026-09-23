import React, { useState } from 'react';
import { LEVEL_DIALOGUES } from '../data/doomDialogue';

export function InvestigationJournal({ isOpen, onClose, currentStage, evidenceList = [], narrativeState, onFlagContradiction }) {
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'evidence' | 'dialogues' | 'contradictions'

  if (!isOpen) return null;

  const currentLevelKey = currentStage?.id ? `level_${currentStage.id}` : 'level_1';
  const levelDialogueData = LEVEL_DIALOGUES[currentLevelKey];
  const codeLines = Array.isArray(currentStage?.codeLines)
    ? currentStage.codeLines
    : (typeof currentStage?.codeLines === 'string' ? currentStage.codeLines.split('\n') : []);

  return (
    <div className="investigation-modal-backdrop" onClick={onClose}>
      <div className="investigation-journal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="journal-header">
          <div className="journal-header__title-group">
            <span className="journal-badge">CLASSIFIED // EYES ONLY</span>
            <h2 className="journal-title">INTELLIGENCE DOSSIER & INVESTIGATION JOURNAL</h2>
          </div>
          <button className="journal-close-btn" onClick={onClose}>
            ✕ CLOSE DOSSIER
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="journal-tabs">
          <button
            className={`journal-tab-btn ${activeTab === 'code' ? 'journal-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            CODE & LOGIC SNIPPET
          </button>
          <button
            className={`journal-tab-btn ${activeTab === 'evidence' ? 'journal-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('evidence')}
          >
            EVIDENCE REPOSITORY ({evidenceList.length})
          </button>
          <button
            className={`journal-tab-btn ${activeTab === 'dialogues' ? 'journal-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('dialogues')}
          >
            INTERCEPTED TRANSMISSIONS
          </button>
          <button
            className={`journal-tab-btn ${activeTab === 'contradictions' ? 'journal-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('contradictions')}
          >
            CONTRADICTION MATRIX
          </button>
        </div>

        {/* Tab Content */}
        <div className="journal-body">
          {activeTab === 'code' && (
            <div className="journal-section">
              <div className="journal-intel-card">
                <div className="journal-intel-card__header">
                  <span className="journal-intel-card__tag">CURRENT CHAMBER TELEMETRY</span>
                  <h4>{currentStage?.title || currentStage?.name || 'Classified Chamber'}</h4>
                </div>
                <div className="journal-intel-card__content">
                  <p style={{ color: 'var(--doom-green-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '12px' }}>
                    <strong>DIRECTIVE / OBJECTIVE:</strong> {currentStage?.question || 'Analyze incoming logic execution trace and decrypt the access key.'}
                  </p>

                  <div className="journal-evidence-box">
                    <span className="journal-box-label">ACTIVE CODE & LOGIC EXECUTION TRACE:</span>
                    {codeLines.length > 0 ? (
                      <div style={{
                        background: 'rgba(2, 8, 4, 0.95)',
                        border: '1px solid rgba(0, 255, 102, 0.3)',
                        borderRadius: '6px',
                        padding: '12px',
                        overflowX: 'auto'
                      }}>
                        {codeLines.map((line, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '12px', padding: '3px 0', fontFamily: 'var(--font-mono)', fontSize: '0.92rem' }}>
                            <span style={{ color: 'var(--ink-faint)', userSelect: 'none', width: '28px' }}>
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span style={{ color: '#00ff66', whiteSpace: 'pre' }}>
                              {line}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <pre className="journal-raw-data">
                        {currentStage?.data || JSON.stringify(currentStage?.investigationClues || {}, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="journal-section">
              <div className="journal-intel-card">
                <div className="journal-intel-card__header">
                  <span className="journal-intel-card__tag">CURRENT STAGE NODE</span>
                  <h4>{currentStage?.title || currentStage?.name || 'Unknown Sector'}</h4>
                </div>
                <div className="journal-intel-card__content">
                  <p><strong>Primary Objective:</strong> {currentStage?.question || currentStage?.clue || 'Analyze incoming network telemetry and decrypt access vectors.'}</p>
                  
                  {currentStage?.story && Array.isArray(currentStage.story) && (
                    <div style={{ marginTop: '12px', marginBottom: '12px', padding: '10px 14px', background: 'rgba(0,255,102,0.05)', borderRadius: '6px', borderLeft: '3px solid var(--doom-green)' }}>
                      <span className="journal-box-label">MISSION INTEL LOG:</span>
                      {currentStage.story.map((st, i) => (
                        <p key={i} style={{ fontSize: '0.86rem', lineHeight: '1.5', margin: '4px 0', color: 'var(--ink)' }}>
                          {st}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="journal-evidence-box">
                    <span className="journal-box-label">ACQUIRED EVIDENCE LOGS:</span>
                    {evidenceList.length === 0 ? (
                      <p style={{ color: 'var(--ink-faint)', fontSize: '0.82rem', fontStyle: 'italic', padding: '8px 0' }}>
                        No breach evidence acquired yet. Override system chambers to record evidence.
                      </p>
                    ) : (
                      evidenceList.map((ev, idx) => (
                        <div key={idx} style={{ padding: '8px 12px', background: 'rgba(0,255,102,0.08)', borderRadius: '4px', marginBottom: '8px', border: '1px solid rgba(0,255,102,0.2)' }}>
                          <div style={{ color: 'var(--doom-green-bright)', fontWeight: 'bold', fontSize: '0.8rem' }}>EVIDENCE #{String(idx + 1).padStart(2, '0')}: {ev.title}</div>
                          <div style={{ color: 'var(--ink)', fontSize: '0.78rem', marginTop: '2px' }}>{ev.note}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {currentStage?.investigationClues && (
                <div className="journal-clues-grid">
                  <div className="journal-clue-item">
                    <h5>Methodology Directive</h5>
                    <p>{currentStage.investigationClues.hint}</p>
                  </div>
                  <div className="journal-clue-item">
                    <h5>System Vulnerability Vector</h5>
                    <p>{currentStage.investigationClues.concept}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dialogues' && (
            <div className="journal-section">
              <div className="journal-log-list">
                <div className="journal-log-entry">
                  <div className="journal-log-entry__meta">
                    <span className="log-speaker">DOOM CORE</span>
                    <span className="log-timestamp">CYCLE ACTIVE</span>
                  </div>
                  <p className="log-text">
                    "{levelDialogueData?.intro?.text || 'All operations under surveillance.'}"
                  </p>
                </div>

                {narrativeState?.playerChoices?.length > 0 && (
                  <div className="journal-log-entry journal-log-entry--player">
                    <div className="journal-log-entry__meta">
                      <span className="log-speaker">OPERATIVE LOG</span>
                      <span className="log-timestamp">RECORDED</span>
                    </div>
                    <p className="log-text">
                      Choices Logged: {narrativeState.playerChoices.join(' → ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contradictions' && (
            <div className="journal-section">
              <div className="journal-contradiction-banner">
                <h4>TACTICAL DECEPTION DETECTOR</h4>
                <p>
                  DOOM will deliberately broadcast false telemetry to misdirect investigators. When you spot a statement that contradicts verified terminal logs, flag it to weaken his subroutines.
                </p>
              </div>

              {levelDialogueData?.lie ? (
                <div className="journal-contradiction-card">
                  <div className="contradiction-header">
                    <span className="contradiction-status">
                      {narrativeState?.contradictionsDetected?.includes(levelDialogueData.lie.contradictionKey)
                        ? '[CONTRADICTION EXPOSED]'
                        : '[SUSPICIOUS TELEMETRY DETECTED]'}
                    </span>
                  </div>
                  <p className="contradiction-statement">{levelDialogueData.lie.statement}</p>
                  <p className="contradiction-truth"><strong>Verified Reality:</strong> {levelDialogueData.lie.truth}</p>

                  {!narrativeState?.contradictionsDetected?.includes(levelDialogueData.lie.contradictionKey) && (
                    <button
                      className="btn btn--charge journal-flag-btn"
                      onClick={() => onFlagContradiction(levelDialogueData.lie.contradictionKey)}
                    >
                      FLAG AS CONTRADICTION / ANOMALY
                    </button>
                  )}
                </div>
              ) : (
                <div className="journal-empty-state">
                  <p>No active anomalies detected in this sector's broadcast stream.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="journal-footer">
          <span className="journal-status-indicator">
            STATUS: ACTIVE INVESTIGATION // DOOM THREAT LEVEL 89%
          </span>
          <button className="btn btn--charge" onClick={onClose}>
            RETURN TO TERMINAL
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvestigationJournal;
