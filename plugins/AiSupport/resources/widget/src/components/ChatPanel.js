/**
 * ChatPanel Component
 *
 * Main chat panel: header, message list, escalation bar, survey, and input area.
 * Orchestrates all sub-components and manages chat state.
 */

import { t } from '../services/i18n.js';
import { MessageList } from './MessageList.js';
import { InputArea } from './InputArea.js';
import { EscalationTimer } from './EscalationTimer.js';
import { SatisfactionSurvey } from './SatisfactionSurvey.js';
import {
  sendMessage,
  getHistory,
  uploadAttachment,
  requestEscalation,
  submitRating,
} from '../services/api.js';
import { PollingManager } from '../services/polling.js';
import { saveConversationId, getConversationId } from '../services/storage.js';
import { isMobile, setupKeyboardHandling, lockBodyScroll } from '../utils/mobile.js';

const MINIMIZE_ICON = '<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>';
const CLOSE_ICON = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

export class ChatPanel {
  /**
   * @param {Object} options
   * @param {string} options.widgetName
   * @param {string} options.aiNickname
   * @param {boolean} options.enableAttachments
   * @param {boolean} options.enableEscalation
   * @param {string} [options.userId]
   * @param {Function} options.onClose
   * @param {Function} options.onMinimize
   * @param {Function} options.onNewMessage - (msg) => void, notify parent of new messages
   */
  constructor(options) {
    this._options = options;
    this._el = null;
    this._visible = false;
    this._conversationId = null;
    this._connectionStatus = 'connected';
    this._sending = false;
    this._serverMessageCount = 0;
    this._historySyncing = false;

    // Sub-components
    this._messageList = null;
    this._inputArea = null;
    this._escalation = null;
    this._survey = null;
    this._polling = new PollingManager();

    // Keyboard cleanup
    this._cleanupKeyboard = null;
  }

  /**
   * Create and return the panel DOM element.
   * @returns {HTMLElement}
   */
  render() {
    this._el = document.createElement('div');
    this._el.className = 'airpilot-panel airpilot-panel--hidden';
    this._el.setAttribute('role', 'dialog');
    this._el.setAttribute('aria-label', this._options.widgetName || t('widget.title'));

    // Header
    this._el.appendChild(this._renderHeader());

    // Message list
    this._messageList = new MessageList({
      aiNickname: this._options.aiNickname || 'AI',
    });
    this._el.appendChild(this._messageList.render());

    // Escalation bar
    this._escalation = new EscalationTimer({
      enabled: this._options.enableEscalation !== false,
      onEscalate: () => this._handleEscalate(),
      onCancel: () => {},
    });
    this._el.appendChild(this._escalation.render());

    // Satisfaction survey
    this._survey = new SatisfactionSurvey({
      onSubmit: (rating) => this._handleRating(rating),
      onSkip: () => {},
    });
    this._el.appendChild(this._survey.render());

    // Input area
    this._inputArea = new InputArea({
      onSend: (text) => this._handleSend(text),
      onAttach: (file) => this._handleAttach(file),
      enableAttachments: this._options.enableAttachments !== false,
      enableEmoji: true,
      escalationButton: this._escalation.isEnabled() ? this._escalation.renderButton() : null,
    });
    this._el.appendChild(this._inputArea.render());

    // Set up drag & drop on the panel
    this._inputArea.setupDragDrop(this._el);

    // Initialize polling
    this._polling.init({
      conversationId: this._conversationId,
      onUpdate: (data) => this._handlePollUpdate(data),
      onError: () => this._setConnectionStatus('disconnected'),
    });

    return this._el;
  }

  /**
   * Show the panel with opening animation.
   */
  show() {
    if (!this._el) return;
    this._visible = true;
    this._el.classList.remove('airpilot-panel--hidden');
    this._el.classList.remove('airpilot-panel--closing');
    this._el.classList.add('airpilot-panel--opening');

    // Mobile: lock body scroll
    if (isMobile()) {
      lockBodyScroll(true);
      this._cleanupKeyboard = setupKeyboardHandling(this._el, (isOpen) => {
        // When keyboard opens/closes on mobile, adjust
      });
    }

    // Load history if we have a conversation
    this._loadHistory();

    // Start polling
    this._polling.setIdle();

    // Focus input
    setTimeout(() => this._inputArea.focus(), 300);
  }

  /**
   * Hide the panel with closing animation.
   */
  hide() {
    if (!this._el) return;
    this._visible = false;
    this._el.classList.remove('airpilot-panel--opening');
    this._el.classList.add('airpilot-panel--closing');

    // After animation, fully hide
    setTimeout(() => {
      if (!this._visible && this._el) {
        this._el.classList.add('airpilot-panel--hidden');
        this._el.classList.remove('airpilot-panel--closing');
      }
    }, 200);

    // Mobile: unlock body scroll
    if (isMobile()) {
      lockBodyScroll(false);
    }
    if (this._cleanupKeyboard) {
      this._cleanupKeyboard();
      this._cleanupKeyboard = null;
    }

    // Stop polling
    this._polling.stop();
  }

  /**
   * Minimize (same as hide, but polling goes to background).
   */
  minimize() {
    this.hide();
    if (this._conversationId) {
      this._polling.setBackground();
    }
  }

  /**
   * Check if panel is visible.
   * @returns {boolean}
   */
  isVisible() {
    return this._visible;
  }

  /**
   * Set the conversation ID (e.g., from guest form).
   * @param {string} id
   */
  setConversationId(id) {
    this._conversationId = id;
    this._polling.setConversationId(id);
    if (this._options.userId) {
      saveConversationId(this._options.userId, id);
    }
  }

  /**
   * Get the root element.
   * @returns {HTMLElement}
   */
  getElement() {
    return this._el;
  }

  /**
   * Clean up resources.
   */
  destroy() {
    this._polling.destroy();
    this._escalation.destroy();
    if (this._cleanupKeyboard) this._cleanupKeyboard();
  }

  // ─── Internal: Rendering ────────────────────────────────────────────

  _renderHeader() {
    const header = document.createElement('div');
    header.className = 'airpilot-header';

    // Info
    const info = document.createElement('div');
    info.className = 'airpilot-header-info';

    const title = document.createElement('div');
    title.className = 'airpilot-header-title';
    title.textContent = this._options.widgetName || t('widget.title');
    info.appendChild(title);

    // Status
    this._statusEl = document.createElement('div');
    this._statusEl.className = 'airpilot-header-status';
    this._statusDot = document.createElement('span');
    this._statusDot.className = 'airpilot-status-dot airpilot-status-dot--connected';
    this._statusEl.appendChild(this._statusDot);
    this._statusText = document.createElement('span');
    this._statusText.textContent = t('widget.connected');
    this._statusEl.appendChild(this._statusText);
    info.appendChild(this._statusEl);

    header.appendChild(info);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'airpilot-header-actions';

    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'airpilot-header-btn';
    minimizeBtn.setAttribute('type', 'button');
    minimizeBtn.setAttribute('aria-label', t('widget.minimize'));
    minimizeBtn.innerHTML = MINIMIZE_ICON;
    minimizeBtn.addEventListener('click', () => {
      if (this._options.onMinimize) this._options.onMinimize();
    });
    actions.appendChild(minimizeBtn);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'airpilot-header-btn';
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', t('widget.close'));
    closeBtn.innerHTML = CLOSE_ICON;
    closeBtn.addEventListener('click', () => {
      if (this._options.onClose) this._options.onClose();
    });
    actions.appendChild(closeBtn);

    header.appendChild(actions);
    return header;
  }

  // ─── Internal: Actions ──────────────────────────────────────────────

  async _loadHistory() {
    // Restore conversation ID from storage
    if (!this._conversationId && this._options.userId) {
      this._conversationId = getConversationId(this._options.userId);
      if (this._conversationId) {
        this._polling.setConversationId(this._conversationId);
      }
    }

    try {
      this._setConnectionStatus('connecting');
      await this._refreshHistory();
      this._setConnectionStatus('connected');
    } catch (err) {
      if (err.status === 404) {
        // Conversation not found — fresh start
        this._conversationId = null;
      } else {
        this._setConnectionStatus('disconnected');
      }
    }
  }

  async _handleSend(text) {
    if (this._sending) return;
    this._sending = true;

    // Add user message to UI immediately
    const userMsg = {
      id: 'local_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    this._messageList.addMessage(userMsg);
    this._inputArea.clear();
    this._inputArea.setDisabled(true);

    // Show typing indicator
    this._messageList.setTyping(true);

    // Switch to active polling
    this._polling.setActive();

    try {
      const data = await sendMessage(text, this._conversationId);

      // Save conversation ID from response
      if (data.conversationId || data.conversation_id) {
        this.setConversationId(data.conversationId || data.conversation_id);
      }

      // Hide typing indicator
      this._messageList.setTyping(false);

      this._applyConversationStatus(data.status, data.status_label);

      try {
        await this._refreshHistory();
      } catch (historyErr) {
        if (typeof data.message === 'string' && data.message) {
          const aiMsg = {
            id: 'ai_' + Date.now(),
            conversationId: this._conversationId,
            role: 'ai',
            content: data.message,
            senderName: this._options.aiNickname,
            timestamp: new Date().toISOString(),
          };
          this._messageList.addMessage(aiMsg);
          if (this._options.onNewMessage) this._options.onNewMessage(aiMsg);
        }
      }

      this._setConnectionStatus('connected');
    } catch (err) {
      this._messageList.setTyping(false);

      // Add error system message
      this._messageList.addMessage({
        id: 'err_' + Date.now(),
        role: 'system',
        content: t('error.sendFailed'),
        timestamp: new Date().toISOString(),
      });

      if (err.status >= 500 || !err.status) {
        this._setConnectionStatus('disconnected');
      }
    } finally {
      this._sending = false;
      this._inputArea.setDisabled(false);
      this._inputArea.focus();
    }
  }

  async _handleAttach(file) {
    try {
      // Show uploading state
      this._messageList.addMessage({
        id: 'upload_' + Date.now(),
        role: 'system',
        content: t('attachment.uploading'),
        timestamp: new Date().toISOString(),
      });

      const result = await uploadAttachment(file, this._conversationId);

      // Add attachment message
      this._messageList.addMessage({
        id: 'att_' + Date.now(),
        role: 'user',
        content: '',
        timestamp: new Date().toISOString(),
        attachments: [{
          url: result.url,
          filename: result.filename || file.name,
          type: file.type,
        }],
      });
    } catch (err) {
      this._messageList.addMessage({
        id: 'err_' + Date.now(),
        role: 'system',
        content: t('error.uploadFailed'),
        timestamp: new Date().toISOString(),
      });
    }
  }

  async _handleEscalate() {
    if (!this._conversationId) return;

    try {
      const data = await requestEscalation(this._conversationId);
      this._escalation.setState('waiting', {
        estimatedWaitSeconds: data.estimated_wait || 300,
      });
    } catch (err) {
      this._escalation.setState('idle');
      this._messageList.addMessage({
        id: 'err_' + Date.now(),
        role: 'system',
        content: t('error.network'),
        timestamp: new Date().toISOString(),
      });
    }
  }

  async _handleRating(rating) {
    if (!this._conversationId) return;
    try {
      await submitRating(this._conversationId, rating);
    } catch (err) {
      // Non-critical, silently fail
    }
  }

  // ─── Internal: Polling ──────────────────────────────────────────────

  _handlePollUpdate(data) {
    this._setConnectionStatus('connected');

    this._messageList.setTyping(false);
    this._applyConversationStatus(data.status, data.status_label);

    if (typeof data.message_count === 'number' && data.message_count > this._serverMessageCount) {
      void this._refreshHistory();
    }
  }

  // ─── Internal: UI Helpers ───────────────────────────────────────────

  _setConnectionStatus(status) {
    this._connectionStatus = status;
    if (!this._statusDot || !this._statusText) return;

    this._statusDot.className = 'airpilot-status-dot airpilot-status-dot--' + status;

    switch (status) {
      case 'connected':
        this._statusText.textContent = t('widget.connected');
        break;
      case 'connecting':
        this._statusText.textContent = t('widget.connecting');
        break;
      case 'disconnected':
        this._statusText.textContent = t('widget.disconnected');
        break;
    }
  }

  async _refreshHistory() {
    if (this._historySyncing) return;

    this._historySyncing = true;
    try {
      const data = await getHistory(this._conversationId);
      const conversationId = data.conversationId || data.conversation_id || this._conversationId;
      if (conversationId) {
        this.setConversationId(conversationId);
      }

      const normalized = Array.isArray(data.messages)
        ? data.messages.map((msg) => this._normalizeMessage(msg, conversationId))
        : [];

      this._messageList.setMessages(normalized);
      this._serverMessageCount = normalized.length;
    } finally {
      this._historySyncing = false;
    }
  }

  _normalizeMessage(msg, conversationId) {
    const rawRole = (msg.role || 'assistant').toString();
    const role = rawRole === 'assistant' ? 'ai' : rawRole;
    const attachments = [];

    if (Array.isArray(msg.attachments)) {
      attachments.push(...msg.attachments);
    }
    if (msg.attachment_url) {
      attachments.push({
        url: msg.attachment_url,
        filename: msg.attachment_summary || 'Attachment',
        type: 'attachment',
      });
    }

    return {
      id: msg.id,
      conversationId: conversationId || this._conversationId,
      role,
      content: msg.content || msg.text || '',
      senderName: role === 'admin' ? t('escalation.connected') : this._options.aiNickname,
      timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      feedback: msg.feedback || null,
    };
  }

  _applyConversationStatus(status, statusLabel) {
    const resolvedLabel = statusLabel || {
      0: 'active',
      1: 'human_support',
      2: 'resolved',
      3: 'waiting_human',
    }[status] || 'active';

    if (resolvedLabel === 'waiting_human') {
      this._escalation.setState('waiting', { estimatedWaitSeconds: 300 });
      return;
    }

    if (resolvedLabel === 'human_support') {
      this._escalation.setState('connected');
      return;
    }

    if (resolvedLabel === 'resolved') {
      this._escalation.setState('ended');
      if (!this._survey.isVisible()) {
        this._survey.show();
      }
      return;
    }

    this._escalation.setState('idle');
  }
}
