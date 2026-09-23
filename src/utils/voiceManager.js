/**
 * voiceManager.js — Native Web Speech API Voice Synthesizer
 * AIDEX '26 — Technical Escape Room Mission Control Operator
 */

class VoiceManager {
  constructor() {
    this.enabled = localStorage.getItem('AIDEX_VOICE_ENABLED') === 'true';
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
    this.listeners = new Set();
    this.preferredVoice = null;

    if (this.synth) {
      this.initVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  initVoice() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;
      // Prefer calm, clear English voice (e.g. Google UK English Male, Microsoft George, Samantha, or any en-US/en-GB)
      this.preferredVoice = voices.find(v => 
        (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Daniel')))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    } catch (e) {
      console.warn('Voice initialization warning:', e);
    }
  }

  isSupported() {
    return Boolean(this.synth);
  }

  isEnabled() {
    return this.enabled && this.isSupported();
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
    localStorage.setItem('AIDEX_VOICE_ENABLED', this.enabled ? 'true' : 'false');
    if (!this.enabled) {
      this.stop();
    }
    this.notify();
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.enabled));
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // Ignore error on cancel
      }
    }
  }

  speak(text, { priority = 'normal', rate = 0.95, pitch = 0.9 } = {}) {
    if (!this.isEnabled()) return;
    if (!text || typeof text !== 'string') return;

    // Deduplicate rapid repeat calls within 2.5 seconds unless priority is high
    const now = Date.now();
    if (priority !== 'high' && text === this.lastSpokenText && now - this.lastSpokenTime < 2500) {
      return;
    }
    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    try {
      if (priority === 'high') {
        this.synth.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }
      utterance.rate = rate; // slightly measured, controlled delivery
      utterance.pitch = pitch; // slightly deeper, calm tone
      utterance.volume = 0.85;

      utterance.onerror = (err) => {
        // Fallback silently without throwing or interrupting UI
        console.warn('Voice utterance notice:', err);
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Voice synthesis exception ignored:', err);
    }
  }

  // Pre-configured mission control calls
  speakWelcome() {
    this.speak("Welcome to AIDEX 26. Your mission is ready. Authenticate to begin.", { priority: 'normal', rate: 0.92, pitch: 0.9 });
  }

  speakAccessGranted() {
    this.speak("Access granted. Your mission begins now.", { priority: 'high', rate: 0.95, pitch: 0.9 });
  }

  speakRoomUnlocked(roomName) {
    const text = roomName 
      ? `New room unlocked: ${roomName}. Proceed to your next challenge.`
      : "New room unlocked. Proceed to your next challenge.";
    this.speak(text, { priority: 'high', rate: 0.95, pitch: 0.92 });
  }

  speakCorrect() {
    this.speak("Correct answer. Protocol verified.", { priority: 'high', rate: 1.0, pitch: 0.95 });
  }

  speakIncorrect() {
    this.speak("Incorrect answer. Transmission rejected.", { priority: 'high', rate: 0.95, pitch: 0.85 });
  }

  speakTimeWarning() {
    this.speak("Warning. Time is running out. Accelerate mission completion.", { priority: 'high', rate: 1.0, pitch: 0.9 });
  }

  speakMissionCompleted() {
    this.speak("Mission completed. All security chambers cleared. Well done agents.", { priority: 'high', rate: 0.9, pitch: 0.95 });
  }
}

export const voiceManager = new VoiceManager();
