/**
 * MessageList Component
 *
 * Scrollable container for chat messages with auto-scroll,
 * date separators, and typing indicator.
 */

import { MessageItem } from './MessageItem.js';
import { t } from '../services/i18n.js';
import { scrollToBottom, isNearBottom } from '../utils/mobile.js';

export class MessageList {
  /**
   * @param {Object} options
   * @param {string} options.aiNickname
   */
  constructor(options) {
    this._options = options || {};
    this._el = null;
    this._messages = [];
    this._typingEl = null;
    this._isTyping = false;
    this._shouldAutoScroll = true;
    this._emptyEl = null;
  }

  /**
   * Create and return the message list DOM element.
   * @returns {HTMLElement}
   */
  render() {
    this._el = document.createElement('div');
    this._el.className = 'airpilot-messages';
    this._el.setAttribute('role', 'log');
    this._el.setAttribute('aria-live', 'polite');

    // Track scroll position for auto-scroll
    this._el.addEventListener('scroll', () => {
      this._shouldAutoScroll = isNearBottom(this._el, 80);
    });

    // Show empty state initially
    this._showEmptyState();

    return this._el;
  }

  /**
   * Set all messages (e.g., from history load).
   * @param {Object[]} messages
   */
  setMessages(messages) {
    if (!this._el) return;
    this._messages = messages || [];
    this._el.innerHTML = '';

    if (this._messages.length === 0) {
      this._showEmptyState();
      return;
    }

    let lastDate = null;
    for (const msg of this._messages) {
      // Date separator
      const msgDate = this._getDateString(msg.timestamp);
      if (msgDate && msgDate !== lastDate) {
        this._el.appendChild(this._createDateSeparator(msgDate));
        lastDate = msgDate;
      }

      const item = new MessageItem(msg, {
        aiNickname: this._options.aiNickname,
        animate: false,
      });
      this._el.appendChild(item.render());
    }

    // Re-attach typing indicator if needed
    if (this._isTyping) {
      this._el.appendChild(this._getTypingIndicator());
    }

    // Scroll to bottom
    scrollToBottom(this._el, false);
  }

  /**
   * Add a single new message (with animation).
   * @param {Object} msg
   */
  addMessage(msg) {
    if (!this._el) return;

    // Remove empty state if present
    if (this._emptyEl && this._el.contains(this._emptyEl)) {
      this._el.removeChild(this._emptyEl);
      this._emptyEl = null;
    }

    this._messages.push(msg);

    // Date separator
    const lastMsg = this._messages.length > 1 ? this._messages[this._messages.length - 2] : null;
    const prevDate = lastMsg ? this._getDateString(lastMsg.timestamp) : null;
    const msgDate = this._getDateString(msg.timestamp);

    if (msgDate && msgDate !== prevDate) {
      this._el.appendChild(this._createDateSeparator(msgDate));
    }

    // Remove typing indicator before adding message
    if (this._typingEl && this._el.contains(this._typingEl)) {
      this._el.removeChild(this._typingEl);
    }

    const item = new MessageItem(msg, {
      aiNickname: this._options.aiNickname,
      animate: true,
    });
    this._el.appendChild(item.render());

    // Re-attach typing indicator if still active
    if (this._isTyping) {
      this._el.appendChild(this._getTypingIndicator());
    }

    // Auto-scroll if user was near bottom
    if (this._shouldAutoScroll) {
      scrollToBottom(this._el, true);
    }
  }

  /**
   * Show or hide the typing indicator.
   * @param {boolean} show
   * @param {string} [label] - Custom label (e.g., "Admin is typing...")
   */
  setTyping(show, label) {
    this._isTyping = show;
    const indicator = this._getTypingIndicator();

    if (show) {
      const textEl = indicator.querySelector('.airpilot-typing-text');
      if (textEl) textEl.textContent = label || t('widget.typing');

      if (!this._el.contains(indicator)) {
        this._el.appendChild(indicator);
      }

      if (this._shouldAutoScroll) {
        scrollToBottom(this._el, true);
      }
    } else {
      if (this._el.contains(indicator)) {
        this._el.removeChild(indicator);
      }
    }
  }

  /**
   * Scroll to the bottom of the message list.
   * @param {boolean} smooth
   */
  scrollToBottom(smooth) {
    scrollToBottom(this._el, smooth !== false);
  }

  /**
   * Get the root element.
   * @returns {HTMLElement}
   */
  getElement() {
    return this._el;
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  _showEmptyState() {
    if (this._emptyEl) return;

    this._emptyEl = document.createElement('div');
    this._emptyEl.className = 'airpilot-empty';
    this._emptyEl.innerHTML = '';

    const icon = document.createElement('div');
    icon.className = 'airpilot-empty-icon';
    icon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>';
    this._emptyEl.appendChild(icon);

    const title = document.createElement('div');
    title.className = 'airpilot-empty-title';
    title.textContent = t('widget.title');
    this._emptyEl.appendChild(title);

    const text = document.createElement('div');
    text.className = 'airpilot-empty-text';
    text.textContent = t('widget.subtitle');
    this._emptyEl.appendChild(text);

    this._el.appendChild(this._emptyEl);
  }

  _getTypingIndicator() {
    if (!this._typingEl) {
      this._typingEl = document.createElement('div');
      this._typingEl.className = 'airpilot-typing';

      const dots = document.createElement('div');
      dots.className = 'airpilot-typing-dots';
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'airpilot-typing-dot';
        dots.appendChild(dot);
      }
      this._typingEl.appendChild(dots);

      const text = document.createElement('span');
      text.className = 'airpilot-typing-text';
      text.textContent = t('widget.typing');
      this._typingEl.appendChild(text);
    }
    return this._typingEl;
  }

  _createDateSeparator(dateStr) {
    const sep = document.createElement('div');
    sep.className = 'airpilot-date-sep';
    const span = document.createElement('span');
    span.textContent = dateStr;
    sep.appendChild(span);
    return sep;
  }

  _getDateString(ts) {
    if (!ts) return null;
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return null;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 86400000);
      const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (msgDay.getTime() === today.getTime()) return t('message.today');
      if (msgDay.getTime() === yesterday.getTime()) return t('message.yesterday');

      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return null;
    }
  }
}
