import React, { useState } from 'react';

export const NetworkMapWidget = ({ networkPath, onUpdatePath, onLockPath }) => {
  const [selectedRule, setSelectedRule] = useState(5);

  const rules = [
    { id: 1, energy: 'HIGH', intruders: 'FEW', reactor: 'STABLE', action: 'STANDBY', match: false },
    { id: 2, energy: 'HIGH', intruders: 'MANY', reactor: 'STABLE', action: 'DEFEND', match: false },
    { id: 3, energy: 'LOW', intruders: 'FEW', reactor: 'STABLE', action: 'RECHARGE', match: false },
    { id: 4, energy: 'LOW', intruders: 'MANY', reactor: 'STABLE', action: 'EMERGENCY', match: false },
    { id: 5, energy: 'HIGH', intruders: 'MANY', reactor: 'UNSTABLE', action: 'EMERGENCY', match: true },
    { id: 6, energy: 'LOW', intruders: 'FEW', reactor: 'UNSTABLE', action: 'EMERGENCY', match: false },
  ];

  const currentSystemState = { energy: 'HIGH', intruders: 'MANY', reactor: 'UNSTABLE' };

  return (
    <div className="network-wrap" style={{
      background: 'linear-gradient(180deg, #08140f, #030806)',
      border: '1px solid var(--doom-green-dim)',
      borderRadius: '6px',
      padding: '1.4rem',
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.7)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, color: 'var(--doom-green)', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
          🧠 DOOMSDAY DECISION RULE ENGINE (ROOM 5)
        </h4>
        <span style={{ fontSize: '11px', color: 'var(--doom-green-bright)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
          CURRENT STATE: HIGH | MANY | UNSTABLE
        </span>
      </div>

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {rules.map((rule) => {
          const isSelected = selectedRule === rule.id;
          const isMatch = rule.match;

          return (
            <div
              key={rule.id}
              onClick={() => setSelectedRule(rule.id)}
              style={{
                background: isMatch ? 'rgba(255, 59, 78, 0.15)' : isSelected ? 'rgba(53, 224, 138, 0.12)' : 'rgba(0, 0, 0, 0.4)',
                border: isMatch ? '1px solid var(--doom-red)' : isSelected ? '1px solid var(--doom-green)' : '1px solid var(--metal-line)',
                borderRadius: '5px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: isMatch ? 'var(--doom-red)' : 'var(--doom-green)' }}>
                <strong>RULE 0{rule.id}:</strong> {rule.energy} ENERGY ∙ {rule.intruders} INTRUDERS ∙ {rule.reactor} REACTOR
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: isMatch ? '#fff' : 'var(--ink-dim)', fontWeight: 'bold' }}>
                  → {rule.action}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                  padding: '2px 6px', borderRadius: '3px',
                  background: isMatch ? 'var(--doom-red)' : 'rgba(255,255,255,0.05)',
                  color: isMatch ? '#fff' : 'var(--ink-faint)', fontWeight: 'bold'
                }}>
                  {isMatch ? '[MATCH FOUND]' : '[NO MATCH]'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspection readout */}
      <div className="net-inspector" style={{ background: '#020805', border: '1px solid var(--metal-line)', color: 'var(--ink-dim)', borderRadius: '4px', padding: '10px 14px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
        <strong style={{ color: 'var(--doom-green)' }}>SYSTEM RULE EVALUATION READOUT:</strong>
        {selectedRule === 5 ? (
          <span style={{ color: 'var(--doom-red)', fontWeight: 'bold' }}>
             Rule 05 matches all 3 conditions (HIGH ENERGY, MANY INTRUDERS, UNSTABLE REACTOR). System Response Action: EMERGENCY.
          </span>
        ) : (
          <span>
             Rule 0{selectedRule} evaluated against current situation. Condition mismatch detected. Look for the rule matching all 3 parameters.
          </span>
        )}
      </div>
    </div>
  );
};
