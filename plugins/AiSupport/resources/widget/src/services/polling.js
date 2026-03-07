/**
 * Adaptive Polling Manager
 *
 * Adjusts polling frequency based on user activity:
 * - active (1s):      User just sent a message, waiting for response
 * - idle (3s):        Chat is open but no recent user action
 * - background (7s):  Chat is minimized
 * - inactive (0):     Widget closed, no polling
 */

import { getStatus } from './api.js';

const INTERVALS = {
  active: 1000,
  idle: 3000,
  background: 7000,
  inactive: 0,
};

// After sending, stay in "active" mode for this long, then drop to "idle"
const ACTIVE_DURATION_MS = 30000;

export class PollingManager {
  constructor() {
    this._state = 'inactive';
    this._timer = null;
    this._conversationId = null;
    this._onUpdate = null;
    this._onError = null;
    this._abortController = null;
    this._activeTimeout = null;
    this._polling = false;
    this._lastPollTime = 0;
  }

  /**
   * Initialize polling with callbacks.
   * @param {Object} options
   * @param {string} options.conversationId
   * @param {Function} options.onUpdate - (data) => void
   * @param {Function} [options.onError] - (error) => void
   */
  init(options) {
    this._conversationId = options.conversationId;
    this._onUpdate = options.onUpdate;
    this._onError = options.onError || (() => {});
  }

  /**
   * Update the conversation ID (e.g., after first message).
   * @param {string} id
   */
  setConversationId(id) {
    this._conversationId = id;
  }

  /**
   * Switch to active polling (user just sent a message).
   */
  setActive() {
    this._setState('active');

    // Auto-downgrade to idle after ACTIVE_DURATION_MS
    clearTimeout(this._activeTimeout);
    this._activeTimeout = setTimeout(() => {
      if (this._state === 'active') {
        this._setState('idle');
      }
    }, ACTIVE_DURATION_MS);
  }

  /**
   * Switch to idle polling (chat open, no recent action).
   */
  setIdle() {
    clearTimeout(this._activeTimeout);
    this._setState('idle');
  }

  /**
   * Switch to background polling (chat minimized).
   */
  setBackground() {
    clearTimeout(this._activeTimeout);
    this._setState('background');
  }

  /**
   * Stop all polling (widget closed).
   */
  stop() {
    clearTimeout(this._activeTimeout);
    this._setState('inactive');
  }

  /**
   * Get the current polling state.
   * @returns {string}
   */
  getState() {
    return this._state;
  }

  /**
   * Force an immediate poll (e.g., when opening the panel).
   */
  async pollNow() {
    await this._poll();
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  _setState(state) {
    if (this._state === state) return;
    this._state = state;
    this._restartTimer();
  }

  _restartTimer() {
    clearInterval(this._timer);
    this._timer = null;

    // Cancel any in-flight request
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }

    const interval = INTERVALS[this._state];
    if (interval > 0 && this._conversationId) {
      // Do an immediate poll, then set interval
      this._poll();
      this._timer = setInterval(() => this._poll(), interval);
    }
  }

  async _poll() {
    if (this._polling) return;
    if (!this._conversationId) return;

    this._polling = true;
    this._abortController = new AbortController();

    try {
      const data = await getStatus(this._conversationId, {
        signal: this._abortController.signal,
      });
      this._lastPollTime = Date.now();
      if (this._onUpdate) this._onUpdate(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        if (this._onError) this._onError(err);
      }
    } finally {
      this._polling = false;
      this._abortController = null;
    }
  }

  /**
   * Clean up all timers and abort controllers.
   */
  destroy() {
    this.stop();
    if (this._abortController) {
      this._abortController.abort();
    }
  }
}
