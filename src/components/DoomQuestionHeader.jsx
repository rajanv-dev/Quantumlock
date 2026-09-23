import React, { useState, useEffect } from 'react';
import { contentStore } from '../engine/contentStore';
import { IconCrown } from './CyberIcons';

const THREAT_LEVELS = ['Minimal', 'Low', 'Moderate', 'Elevated', 'High', 'Critical', 'Extreme', 'Maximum', 'Catastrophic', 'Doomsday'];
const THREAT_COLORS = [
  '#00FF9C', '#33ff88', '#88ff00', '#F0B429',
  '#ffaa00', '#ff7700', '#ff4400', '#FF4D5A',
  '#ff0066', '#ff0088'
];

export const DoomQuestionHeader = ({ currentLevel, currentPartId }) => {
  const [glitch, setGlitch] = useState(false);
  const [systemConfig, setSystemConfig] = useState(() => contentStore.getContent().systemConfig);

  useEffect(() => {
    const unsub = contentStore.subscribe((c) => {
      setSystemConfig(c.systemConfig);
    });
    return unsub;
  }, []);

  const doomQuotes = systemConfig.doomQuotes || [];
  const tickerMessages = systemConfig.tickerMessages || [];
  const levelIdx = (currentLevel.id - 1) % (doomQuotes.length || 1);
  const rawQuote = doomQuotes[levelIdx] || "Welcome to Level 1. Let's see if you can solve Doctor Doom's network probe.";
  // Clean quote formatting to sentence case dialogue
  const doomQuote = rawQuote.startsWith('"') ? rawQuote : `"${rawQuote.replace(/^["']|["']$/g, '')}"`;
  const tickerText = (tickerMessages[0] || "Latveria-Net Security Alert ∙ Doom Core Operational").replace(/[\u26A0\uFE0F]/g, '[Alert]');
  const threatLevel = THREAT_LEVELS[Math.min(currentLevel.id - 1, 9)];
  const threatColor = THREAT_COLORS[Math.min(currentLevel.id - 1, 9)];

  const rawRoomTitle = currentLevel.name.startsWith('ROOM')
    ? currentLevel.name.replace(/^ROOM\s*\d+\s*:\s*/i, '')
    : currentLevel.name;

  return (
    <div className="doom-question-header">
      {/* TICKER */}
      <div className="doom-question-header__ticker">
        <span className="doom-question-header__ticker-inner">
          {tickerText}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {tickerText}
        </span>
      </div>

      {/* MAIN HEADER */}
      <div style={{
        background: 'rgba(5, 11, 8, 0.72)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '10px 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        backdropFilter: 'blur(20px) saturate(130%)',
        WebkitBackdropFilter: 'blur(20px) saturate(130%)',
        flexWrap: 'wrap',
      }}>
        {/* LEFT: Doom Avatar + Level Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Animated doom orb */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, rgba(240,180,41,0.25) 0%, rgba(10,4,20,0.85) 70%)',
              border: '1px solid rgba(240,180,41,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconCrown size={18} color="#F0B429" />
            </div>
          </div>

          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#9BAFA5',
              letterSpacing: '0.03em',
              marginBottom: '2px',
            }}>
              Latveria-Net Security Gateway <span style={{ color: '#718078' }}>·</span> <span style={{ color: '#F0B429' }}>Doom Core Active</span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
              fontWeight: '700',
              color: '#E8F5EE',
              margin: '2px 0',
              lineHeight: '1.2',
              letterSpacing: 'normal',
            }}>
              Room {String(currentLevel.id).padStart(2, '0')}: {rawRoomTitle}
            </h1>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              color: '#9BAFA5',
              marginTop: '2px',
              fontStyle: 'italic',
            }}>
              {doomQuote}
            </div>
          </div>
        </div>

        {/* RIGHT: Threat Level + Level Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          {/* Threat level badge */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px',
          }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#718078', letterSpacing: '0.03em' }}>
              Threat
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: threatColor,
              letterSpacing: 'normal',
            }}>
              {threatLevel}
            </span>
          </div>

          {/* Threat level bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[...Array(15)].map((_, i) => {
              const sessionLvl = ((currentLevel.id - 1) % 15) + 1;
              return (
                <div key={i} style={{
                  width: '5px',
                  height: '3px',
                  borderRadius: '1px',
                  background: i < sessionLvl ? threatColor : 'rgba(255,255,255,0.08)',
                  transition: 'all 0.3s ease',
                }} />
              );
            }).reverse()}
          </div>

          {/* Level badge */}
          <div style={{
            background: 'rgba(5, 11, 8, 0.65)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px',
            padding: '4px 12px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#718078', letterSpacing: '0.03em' }}>
              Security
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#E8F5EE',
              lineHeight: '1.1',
            }}>
              {currentLevel.id} / 30
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
