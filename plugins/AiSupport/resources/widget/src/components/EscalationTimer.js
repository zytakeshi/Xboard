/**
 * EscalationTimer Component
 *
 * Displays escalation status: request button, waiting countdown, or "admin connected".
 */

import { t } from '../services/i18n.js';

const HUMAN_ICON = '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

export class EscalationTimer {
  /**
   * @param {Object} options
   * @param {Function} options.onEscalate - () => void
   * @param {Function} [options.onCancel] - () => void
   * @param {boolean} [options.enabled]
   */
  constructor(options) {
    this._onEscalate = options.onEscalate;
    this._onCancel = options.onCancel;
    this._enabled = options.enabled !== false;
    this._el = null;
    this._state = 'idle'; // idle | requesting | waiting | connected | ended
    this._timer = null;
    this._remainingSeconds = 0;
    this._timerDisplayEl = null;
    this._textEl = null;
    this._actionEl = null;
  }

  /**
   * Create and return the escalation bar DOM element.
   * @returns {HTMLElement}
   */
  render() {
    this._el = document.createElement('div');
    this._el.className = 'airpilot-escalation-bar airpilot-escalation-bar--hidden';

    this._textEl = document.createElement('span');
    this._textEl.className = 'airpilot-escalation-text';
    this._el.appendChild(this._textEl);

    this._timerDisplayEl = document.createElement('span');
    this._timerDisplayEl.className = 'airpilot-escalation-timer';
    this._el.appendChild(this._timerDisplayEl);

    this._actionEl = document.createElement('div');
    this._el.appendChild(this._actionEl);

    return this._el;
  }

  /**
   * Render the request button (shown in input area toolbar).
   * @returns {HTMLElement}
   */
  renderButton() {
    const btn = document.createElement('button');
    btn.className = 'airpilot-toolbar-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('title', t('escalation.request'));
    btn.innerHTML = HUMAN_ICON;
    btn.addEventListener('click', () => {
      if (this._state === 'idle' && this._onEscalate) {
        this.setState('requesting');
        this._onEscalate();
      }
    });
    this._requestBtn = btn;
    return btn;
  }

  /**
   * Set the escalation state.
   * @param {string} state - 'idle' | 'requesting' | 'waiting' | 'connected' | 'ended'
   * @param {Object} [data]
   * @param {number} [data.estimatedWaitSeconds]
   */
  setState(state, data) {
    this._state = state;
    if (!this._el) return;

    // Clear existing timer
    clearInterval(this._timer);
    this._timer = null;

    switch (state) {
      case 'idle':
        this._el.classList.add('airpilot-escalation-bar--hidden');
        if (this._requestBtn) this._requestBtn.disabled = false;
        break;

      case 'requesting':
        this._el.classList.add('airpilot-escalation-bar--hidden');
        if (this._requestBtn) this._requestBtn.disabled = true;
        break;

      case 'waiting':
        this._el.classList.remove('airpilot-escalation-bar--hidden');
        this._textEl.textContent = t('escalation.waiting');
        if (this._requestBtn) this._requestBtn.disabled = true;

        // Start countdown
        this._remainingSeconds = (data && data.estimatedWaitSeconds) || 300;
        this._updateTimerDisplay();
        this._timer = setInterval(() => {
          this._remainingSeconds = Math.max(0, this._remainingSeconds - 1);
          this._updateTimerDisplay();
        }, 1000);

        // Cancel button
        this._actionEl.innerHTML = '';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'airpilot-escalation-cancel';
        cancelBtn.textContent = t('escalation.cancel');
        cancelBtn.addEventListener('click', () => {
          if (this._onCancel) this._onCancel();
          this.setState('idle');
        });
        this._actionEl.appendChild(cancelBtn);
        break;

      case 'connected':
        this._el.classList.remove('airpilot-escalation-bar--hidden');
        this._textEl.textContent = t('escalation.connected');
        this._timerDisplayEl.textContent = '';
        this._actionEl.innerHTML = '';
        if (this._requestBtn) this._requestBtn.disabled = true;
        break;

      case 'ended':
        this._el.classList.remove('airpilot-escalation-bar--hidden');
        this._textEl.textContent = t('escalation.ended');
        this._timerDisplayEl.textContent = '';
        this._actionEl.innerHTML = '';
        if (this._requestBtn) this._requestBtn.disabled = false;
        // Auto-hide after 5s
        setTimeout(() => {
          if (this._state === 'ended') this.setState('idle');
        }, 5000);
        break;
    }
  }

  /**
   * Get the current state.
   * @returns {string}
   */
  getState() {
    return this._state;
  }

  /**
   * Get the root element.
   * @returns {HTMLElement}
   */
  getElement() {
    return this._el;
  }

  /**
   * Check if escalation feature is enabled.
   * @returns {boolean}
   */
  isEnabled() {
    return this._enabled;
  }

  /**
   * Clean up timers.
   */
  destroy() {
    clearInterval(this._timer);
    this._timer = null;
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  _updateTimerDisplay() {
    if (!this._timerDisplayEl) return;
    const mins = Math.floor(this._remainingSeconds / 60);
    const secs = this._remainingSeconds % 60;
    const display = `${mins}:${String(secs).padStart(2, '0')}`;
    this._timerDisplayEl.textContent = t('escalation.countdown', { time: display });
  }
}
