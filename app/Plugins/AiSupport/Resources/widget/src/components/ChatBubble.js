/**
 * ChatBubble Component
 *
 * Floating button in the bottom-right corner that opens/closes the chat panel.
 * Shows unread message badge and pulse animation for new messages.
 */

import { t } from '../services/i18n.js';

// SVG icons
const CHAT_ICON = `<svg viewBox="0 0 24 24" class="airpilot-bubble-icon"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>`;

const CLOSE_ICON = `<svg viewBox="0 0 24 24" class="airpilot-bubble-close"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;

export class ChatBubble {
  /**
   * @param {Object} options
   * @param {Function} options.onToggle - Called when bubble is clicked
   */
  constructor(options) {
    this._onToggle = options.onToggle;
    this._unreadCount = 0;
    this._isOpen = false;
    this._el = null;
    this._badgeEl = null;
  }

  /**
   * Create and return the bubble DOM element.
   * @returns {HTMLElement}
   */
  render() {
    this._el = document.createElement('button');
    this._el.className = 'airpilot-bubble';
    this._el.setAttribute('aria-label', t('widget.title'));
    this._el.setAttribute('type', 'button');
    this._updateIcon();

    // Badge
    this._badgeEl = document.createElement('span');
    this._badgeEl.className = 'airpilot-badge';
    this._badgeEl.setAttribute('data-count', '0');
    this._badgeEl.textContent = '0';
    this._el.appendChild(this._badgeEl);

    // Click handler
    this._el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this._onToggle) this._onToggle();
    });

    return this._el;
  }

  /**
   * Update the open/closed visual state of the bubble.
   * @param {boolean} isOpen
   */
  setOpen(isOpen) {
    this._isOpen = isOpen;
    this._updateIcon();

    if (isOpen) {
      // Clear unread when opening
      this.setUnreadCount(0);
    }
  }

  /**
   * Set the unread message count on the badge.
   * @param {number} count
   */
  setUnreadCount(count) {
    this._unreadCount = count;
    if (this._badgeEl) {
      const display = count > 99 ? '99+' : String(count);
      this._badgeEl.textContent = display;
      this._badgeEl.setAttribute('data-count', String(count));
    }
  }

  /**
   * Trigger the pulse animation (e.g., when new message arrives while minimized).
   */
  pulse() {
    if (!this._el) return;
    this._el.classList.remove('airpilot-bubble--pulse');
    // Force reflow to restart animation
    void this._el.offsetWidth;
    this._el.classList.add('airpilot-bubble--pulse');
  }

  /**
   * Get the root element.
   * @returns {HTMLElement}
   */
  getElement() {
    return this._el;
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  _updateIcon() {
    if (!this._el) return;
    // Preserve the badge element reference
    const badge = this._badgeEl;

    // Clear and re-render icon
    const iconSpan = this._el.querySelector('.airpilot-bubble-icon-wrap') ||
      document.createElement('span');
    iconSpan.className = 'airpilot-bubble-icon-wrap';
    iconSpan.innerHTML = this._isOpen ? CLOSE_ICON : CHAT_ICON;

    // Ensure icon wrapper is first child, badge is second
    if (!this._el.contains(iconSpan)) {
      this._el.insertBefore(iconSpan, this._el.firstChild);
    }
    if (badge && !this._el.contains(badge)) {
      this._el.appendChild(badge);
    }

    this._el.setAttribute('aria-label', this._isOpen ? t('widget.close') : t('widget.title'));
  }
}
