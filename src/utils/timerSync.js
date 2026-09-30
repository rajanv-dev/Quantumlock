/**
 * Server-Authoritative Timer Synchronization Utility
 * Calculates exact countdown from server timestamps and client clock offset.
 * Supports per-participant timers and on-hold states.
 */

export class TimerSynchronizer {
  constructor() {
    this.clockOffset = 0; // serverTime - clientLocalTime
    this.sessionStartTime = null;
    this.sessionEndTime = null;
    this.durationMinutes = 60;
    this.timerPaused = false;
    this.timerPausedAt = null;
    this.participantStarted = false;
    this.timerOnHold = true;
    this.status = 'CLOSED';
    this.listeners = new Set();
  }

  /**
   * Synchronize authoritative server timing
   */
  syncServerState(eventState) {
    if (!eventState) return;

    const now = Date.now();
    if (eventState.server_time) {
      this.clockOffset = Number(eventState.server_time) - now;
    }

    this.status = eventState.status || 'CLOSED';
    this.durationMinutes = Number(eventState.session_duration_minutes) || 60;
    this.sessionStartTime = eventState.session_start_time || null;
    this.sessionEndTime = eventState.session_end_time || null;
    this.timerPaused = Boolean(eventState.timer_paused);
    this.timerPausedAt = eventState.timer_paused_at || null;
    this.participantStarted = Boolean(eventState.participant_started);
    this.timerOnHold = Boolean(eventState.timer_on_hold);

    this.notifyListeners();
  }

  /**
   * Get current server-synchronized time
   */
  getSynchronizedNow() {
    return Date.now() + this.clockOffset;
  }

  /**
   * Calculate exact remaining seconds
   */
  getRemainingSeconds() {
    const isSessionActive = this.status === 'SESSION_1_ACTIVE' || this.status === 'SESSION_2_ACTIVE';
    if (!isSessionActive) {
      return this.durationMinutes * 60;
    }

    // Timer is on hold until participant explicitly starts
    if (this.timerOnHold || !this.participantStarted || !this.sessionEndTime) {
      return this.durationMinutes * 60;
    }

    if (this.timerPaused && this.timerPausedAt) {
      const pausedEffectiveNow = this.timerPausedAt + this.clockOffset;
      const remainingMs = Math.max(0, this.sessionEndTime - pausedEffectiveNow);
      return Math.floor(remainingMs / 1000);
    }

    const currentServerTime = this.getSynchronizedNow();
    const remainingMs = Math.max(0, this.sessionEndTime - currentServerTime);
    return Math.floor(remainingMs / 1000);
  }

  /**
   * Format remaining seconds as MM:SS
   */
  getFormattedTime() {
    const totalSecs = this.getRemainingSeconds();
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  isExpired() {
    const isSessionActive = this.status === 'SESSION_1_ACTIVE' || this.status === 'SESSION_2_ACTIVE';
    if (!isSessionActive) return false;
    if (this.timerOnHold || !this.participantStarted) return false;
    return this.getRemainingSeconds() <= 0;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    for (const listener of this.listeners) {
      try { listener(this); } catch (e) {}
    }
  }
}

export const timerSynchronizer = new TimerSynchronizer();

