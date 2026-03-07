/**
 * MessageItem Component
 *
 * Renders a single message (user, AI, admin, or system).
 * AI messages are rendered as markdown via DOMPurify.
 * User messages are escaped plain text.
 */

import { renderMarkdown } from '../utils/markdown.js';
import { escapeHtml, safeSetHtml } from '../utils/sanitizer.js';
import { t } from '../services/i18n.js';
import { submitFeedback } from '../services/api.js';

const COPY_ICON = '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
const THUMB_UP = '<svg viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>';
const THUMB_DOWN = '<svg viewBox="0 0 24 24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>';

export class MessageItem {
  /**
   * @param {Object} message
   * @param {string} message.id
   * @param {string} message.role - 'user' | 'ai' | 'admin' | 'system'
   * @param {string} message.content
   * @param {string} [message.senderName]
   * @param {string} [message.timestamp]
   * @param {Object[]} [message.attachments]
   * @param {string} [message.feedback] - 'helpful' | 'not_helpful' | null
   * @param {Object} options
   * @param {string} options.aiNickname
   * @param {boolean} [options.animate]
   */
  constructor(message, options) {
    this._msg = message;
    this._options = options || {};
    this._el = null;
    this._feedbackState = message.feedback || null;
  }

  /**
   * Create and return the message DOM element.
   * @returns {HTMLElement}
   */
  render() {
    const role = this._msg.role || 'ai';
    this._el = document.createElement('div');
    this._el.className = `airpilot-msg airpilot-msg--${role}`;
    this._el.setAttribute('data-msg-id', this._msg.id || '');

    if (this._options.animate) {
      this._el.classList.add('airpilot-msg--entering');
    }

    // System messages are simple
    if (role === 'system') {
      const bubble = document.createElement('div');
      bubble.className = 'airpilot-msg-bubble';
      bubble.textContent = this._msg.content || '';
      this._el.appendChild(bubble);
      return this._el;
    }

    // Sender name for AI/admin
    if (role === 'ai' || role === 'admin') {
      const sender = document.createElement('div');
      sender.className = 'airpilot-msg-sender';
      sender.textContent = this._msg.senderName ||
        (role === 'admin' ? t('escalation.connected') : (this._options.aiNickname || 'AI'));
      this._el.appendChild(sender);
    }

    // Message bubble
    const bubble = document.createElement('div');
    bubble.className = 'airpilot-msg-bubble';

    // Content
    const content = document.createElement('div');
    content.className = 'airpilot-msg-content';

    if (role === 'user') {
      // User messages: plain text, escaped
      content.textContent = this._msg.content || '';
    } else {
      // AI/admin messages: render markdown, sanitize
      safeSetHtml(content, renderMarkdown(this._msg.content || ''));
    }

    bubble.appendChild(content);

    // Attachments
    if (this._msg.attachments && this._msg.attachments.length > 0) {
      for (const att of this._msg.attachments) {
        bubble.appendChild(this._renderAttachment(att));
      }
    }

    this._el.appendChild(bubble);

    // Timestamp
    if (this._msg.timestamp) {
      const time = document.createElement('div');
      time.className = 'airpilot-msg-time';
      time.textContent = this._formatTime(this._msg.timestamp);
      this._el.appendChild(time);
    }

    // Actions (copy, feedback) — only for AI/admin messages
    if (role === 'ai' || role === 'admin') {
      this._el.appendChild(this._renderActions());
    }

    return this._el;
  }

  /**
   * Get the root element.
   * @returns {HTMLElement}
   */
  getElement() {
    return this._el;
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  _renderAttachment(att) {
    const isImage = att.type && att.type.startsWith('image/');

    if (isImage && att.url) {
      const img = document.createElement('img');
      img.className = 'airpilot-msg-image';
      img.src = att.url;
      img.alt = att.filename || 'Image';
      img.loading = 'lazy';
      return img;
    }

    // File attachment
    const fileEl = document.createElement('div');
    fileEl.className = 'airpilot-msg-file';

    const icon = document.createElement('span');
    icon.innerHTML = '<svg class="airpilot-msg-file-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>';
    fileEl.appendChild(icon);

    const name = document.createElement('span');
    name.className = 'airpilot-msg-file-name';
    name.textContent = att.filename || 'File';
    fileEl.appendChild(name);

    if (att.url) {
      fileEl.style.cursor = 'pointer';
      fileEl.addEventListener('click', () => {
        window.open(att.url, '_blank', 'noopener,noreferrer');
      });
    }

    return fileEl;
  }

  _renderActions() {
    const actions = document.createElement('div');
    actions.className = 'airpilot-msg-actions';

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'airpilot-msg-action-btn';
    copyBtn.setAttribute('type', 'button');
    copyBtn.innerHTML = `${COPY_ICON} <span>${t('message.copy')}</span>`;
    copyBtn.addEventListener('click', () => this._copyContent(copyBtn));
    actions.appendChild(copyBtn);

    // Helpful button
    const helpfulBtn = document.createElement('button');
    helpfulBtn.className = 'airpilot-msg-action-btn' +
      (this._feedbackState === 'helpful' ? ' airpilot-msg-action-btn--active' : '');
    helpfulBtn.setAttribute('type', 'button');
    helpfulBtn.innerHTML = `${THUMB_UP} <span>${t('message.helpful')}</span>`;
    helpfulBtn.addEventListener('click', () => this._sendFeedback(true, helpfulBtn, notHelpfulBtn));
    actions.appendChild(helpfulBtn);

    // Not helpful button
    const notHelpfulBtn = document.createElement('button');
    notHelpfulBtn.className = 'airpilot-msg-action-btn' +
      (this._feedbackState === 'not_helpful' ? ' airpilot-msg-action-btn--active' : '');
    notHelpfulBtn.setAttribute('type', 'button');
    notHelpfulBtn.innerHTML = `${THUMB_DOWN} <span>${t('message.notHelpful')}</span>`;
    notHelpfulBtn.addEventListener('click', () => this._sendFeedback(false, helpfulBtn, notHelpfulBtn));
    actions.appendChild(notHelpfulBtn);

    return actions;
  }

  async _copyContent(btn) {
    try {
      await navigator.clipboard.writeText(this._msg.content || '');
      const span = btn.querySelector('span');
      if (span) {
        const orig = span.textContent;
        span.textContent = t('message.copied');
        setTimeout(() => { span.textContent = orig; }, 1500);
      }
    } catch (e) {
      // Clipboard API not available — fallback
      const textarea = document.createElement('textarea');
      textarea.value = this._msg.content || '';
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); } catch (e2) { /* noop */ }
      document.body.removeChild(textarea);
    }
  }

  async _sendFeedback(helpful, helpfulBtn, notHelpfulBtn) {
    if (!this._msg.conversationId && !this._msg.conversation_id) return;

    try {
      await submitFeedback(
        this._msg.conversationId || this._msg.conversation_id,
        helpful ? 'Helpful' : 'Not helpful',
        helpful,
      );
      this._feedbackState = helpful ? 'helpful' : 'not_helpful';

      helpfulBtn.classList.toggle('airpilot-msg-action-btn--active', helpful);
      notHelpfulBtn.classList.toggle('airpilot-msg-action-btn--active', !helpful);
    } catch (e) {
      // Silently fail — feedback is non-critical
    }
  }

  _formatTime(ts) {
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }
}
