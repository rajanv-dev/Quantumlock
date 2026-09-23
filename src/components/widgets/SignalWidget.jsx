import React, { useState, useEffect } from 'react';

const WAVEFORM_BARS = 52;

export const SignalWidget = ({ stage }) => {
  const [frequency, setFrequency] = useState(417.22);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [signalStrength, setSignalStrength] = useState(34);

  useEffect(() => {
    if (scanning) {
      let t = 0;
      const interval = setInterval(() => {
        t += 2;
        setFrequency(417.22 + Math.sin(t * 0.1) * 15);
        setSignalStrength(34 + Math.floor(Math.random() * 20));
        if (t >= 60) {
          clearInterval(interval);
          setScanning(false);
          setScanComplete(true);
          setFrequency(417.22);
          setSignalStrength(88);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [scanning]);

  const tables = [
    {
      id: 'normalized',
      label: 'SCHEMA A: ORIGINAL NORMALIZED DATABASE (STORED ONCE)',
      type: 'Linked Tables (HERO_ID Primary Key)',
      captured: 'HERO [103: Tony] ── WEAPON [103: Armor] ── LOCATION [103: Laboratory]',
      meta: 'Information stored in 3 connected tables. Single location edit updates all retrievals automatically.',
      status: 'CONSISTENT (0 REDUNDANCY)',
    },
    {
      id: 'corrupted',
      label: "SCHEMA B: DOOM'S UNNORMALIZED COPY (DUPLICATED RECORDS)",
      type: 'Flat Duplicated File',
      captured: 'Rec 1: Tony|Armor|Workshop  |  Rec 2: Tony|Armor|Laboratory  |  Rec 3: Tony|Armor|Workshop',
      meta: 'Same fact copied across multiple rows. Editing Rec 2 left Rec 1 & 3 unchanged → DATA CONSISTENCY ERROR.',
      status: 'CONFLICT DETECTED',
    },
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(10,4,20,0.98), rgba(2,5,3,0.98))',
      border: '1px solid rgba(168,85,247,0.35)',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 0 30px rgba(168,85,247,0.1)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(168,85,247,0.15), rgba(0,0,0,0.5))',
        borderBottom: '1px solid rgba(168,85,247,0.2)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: 'var(--doom-purple)',
            boxShadow: '0 0 10px var(--doom-purple)',
            animation: 'pulseGlow 1.5s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
            color: 'var(--doom-purple)', letterSpacing: '0.1em', fontWeight: 'bold',
          }}>
            DATABASE SCHEMA ANALYZER — REDUNDANCY INSPECTOR
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
          color: scanComplete ? 'var(--doom-green)' : 'var(--doom-amber)',
        }}>
          {scanComplete ? '● SCHEMAS COMPARED' : scanning ? '◌ COMPARING...' : '◌ READY'}
        </span>
      </div>

      {/* Waveform / Visualiser Bar */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '48px', marginBottom: '8px' }}>
          {[...Array(WAVEFORM_BARS)].map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: scanComplete ? `${30 + Math.sin(i * 0.4) * 22}%` : scanning ? '60%' : '15%',
              background: scanComplete ? 'var(--doom-purple)' : scanning ? 'var(--doom-amber)' : 'rgba(168,85,247,0.4)',
              borderRadius: '2px 2px 0 0',
              transition: scanning ? 'height 0.1s ease' : 'all 0.5s ease',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setScanning(true); setScanComplete(false); }}
            disabled={scanning}
            style={{
              background: scanning ? 'rgba(255,170,0,0.1)' : 'rgba(168,85,247,0.15)',
              border: `1px solid ${scanning ? 'var(--doom-amber)' : 'rgba(168,85,247,0.5)'}`,
              color: scanning ? 'var(--doom-amber)' : 'var(--doom-purple)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              padding: '6px 14px',
              borderRadius: '3px',
              cursor: scanning ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {scanning ? 'RUNNING SCHEMA DIFFERENCE...' : 'COMPARE DATABASE SCHEMAS'}
          </button>
        </div>
      </div>

      {/* Table Item Cards */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tables.map((tbl) => (
          <div key={tbl.id} style={{
            background: 'rgba(0,0,0,0.45)',
            border: `1px solid ${tbl.id === 'corrupted' ? 'var(--doom-red)' : 'rgba(168,85,247,0.4)'}`,
            borderRadius: '6px',
            padding: '10px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                color: tbl.id === 'corrupted' ? 'var(--doom-red)' : 'var(--doom-purple)', fontWeight: 'bold',
              }}>
                {tbl.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                color: tbl.id === 'corrupted' ? 'var(--doom-red)' : 'var(--doom-green)',
                fontWeight: 'bold',
              }}>
                {tbl.status}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink)', marginBottom: '4px', wordBreak: 'break-all' }}>
              {tbl.captured}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-dim)', lineHeight: '1.4' }}>
              {tbl.meta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
