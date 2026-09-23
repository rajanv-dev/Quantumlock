import React, { useState, useEffect } from 'react';
import { voiceManager } from '../utils/voiceManager';

export function DoomCinematicEvent({ eventData, onComplete }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!eventData || !eventData.lines || eventData.lines.length === 0) return;

    const line = eventData.lines[currentLineIndex];
    if (!line) return;

    setIsTyping(true);
    let index = 0;
    setDisplayedText('');

    // Speak line
    voiceManager.speak(line, { emotion: eventData.emotion || 'threatening' });

    const interval = setInterval(() => {
      index++;
      setDisplayedText(line.slice(0, index));
      if (index >= line.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 22);

    return () => clearInterval(interval);
  }, [currentLineIndex, eventData]);

  if (!eventData) return null;

  const lines = eventData.lines || [];
  const hasMore = currentLineIndex < lines.length - 1;

  const handleNext = () => {
    if (hasMore) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="doom-cinematic-backdrop">
      <div className="doom-cinematic-scanlines"></div>
      <div className="doom-cinematic-container">
        {/* Top Glitch Title */}
        <div className="doom-cinematic-header">
          <div className="doom-cinematic-badge">CRITICAL PROTOCOL INTERRUPT</div>
          <h1 className="doom-cinematic-title">{eventData.title}</h1>
        </div>

        {/* Big Holographic Eye / Avatar */}
        <div className="doom-cinematic-visualizer">
          <div className="doom-cinematic-eye">
            <div className="doom-eye-outer-ring"></div>
            <div className="doom-eye-inner-pulse"></div>
            <span className="doom-eye-glyph">👁</span>
          </div>
          <div className="doom-cinematic-speaker-tag">
            {eventData.speaker || 'DOOM'}: TRANSMITTING
          </div>
        </div>

        {/* Subtitle Dialogue Box */}
        <div className="doom-cinematic-dialogue-box">
          <p className="doom-cinematic-text">
            {displayedText}
            {isTyping && <span className="typing-cursor">█</span>}
          </p>
        </div>

        {/* Action Controls */}
        <div className="doom-cinematic-actions">
          <div className="doom-cinematic-progress">
            TRANSMISSION {currentLineIndex + 1} OF {lines.length}
          </div>
          <button
            className="btn btn--charge doom-cinematic-next-btn"
            onClick={handleNext}
          >
            {hasMore ? 'PROCEED TO NEXT SEQUENCE →' : 'ENGAGE OBJECTIVE // DISMISS'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoomCinematicEvent;
