/**
 * InputArea Component
 *
 * Text input with send button, emoji picker toggle, file attachment,
 * and escalation button. Handles drag & drop file uploads.
 */

import { t } from '../services/i18n.js';
import { isAllowedFileType, isAllowedFileSize } from '../utils/sanitizer.js';
import { EmojiPicker } from './EmojiPicker.js';

const SEND_ICON = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
const EMOJI_ICON = '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>';
const ATTACH_ICON = '<svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>';

const ALLOWED_FILE_TYPES = ['image/*', 'application/pdf', 'text/plain', 'application/zip'];
const MAX_FILE_SIZE_MB = 10;

export class InputArea {
  /**
   * @param {Object} options
   * @param {Function} options.onSend - (text: string) => void
   * @param {Function} options.onAttach - (file: File) => void
   * @param {boolean} [options.enableAttachments]
   * @param {boolean} [options.enableEmoji]
   * @param {HTMLElement} [options.escalationButton]
   */
  constructor(options) {
    this._onSend = options.onSend;
    this._onAttach = options.onAttach;
    this._enableAttachments = options.enableAttachments !== false;
    this._enableEmoji = options.enableEmoji !== false;
    this._escalationButton = options.escalationButton;
    this._el = null;
    this._textarea = null;
    this._sendBtn = null;
    this._fileInput = null;
    this._emojiPicker = null;
    this._uploadPreviewEl = null;
    this._pendingFile = null;
    this._disabled = false;
  }

  /**
   * Create and return the input area DOM element.
   * @returns {HTMLElement}
   */
  render() {
    this._el = document.createElement('div');
    this._el.className = 'airpilot-input-area';
    this._el.style.position = 'relative';

    // Emoji picker (positioned above toolbar)
    if (this._enableEmoji) {
      this._emojiPicker = new EmojiPicker({
        onSelect: (emoji) => this._insertEmoji(emoji),
        onClose: () => this._emojiPicker.toggle(false),
      });
      this._el.appendChild(this._emojiPicker.render());
    }

    // Upload preview area
    this._uploadPreviewEl = document.createElement('div');
    this._uploadPreviewEl.style.display = 'none';
    this._el.appendChild(this._uploadPreviewEl);

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'airpilot-input-toolbar';

    if (this._enableEmoji) {
      const emojiBtn = document.createElement('button');
      emojiBtn.className = 'airpilot-toolbar-btn';
      emojiBtn.setAttribute('type', 'button');
      emojiBtn.setAttribute('title', 'Emoji');
      emojiBtn.innerHTML = EMOJI_ICON;
      emojiBtn.addEventListener('click', () => {
        this._emojiPicker.toggle();
        emojiBtn.classList.toggle('airpilot-toolbar-btn--active', this._emojiPicker.isVisible());
      });
      toolbar.appendChild(emojiBtn);
    }

    if (this._enableAttachments) {
      const attachBtn = document.createElement('button');
      attachBtn.className = 'airpilot-toolbar-btn';
      attachBtn.setAttribute('type', 'button');
      attachBtn.setAttribute('title', t('attachment.upload'));
      attachBtn.innerHTML = ATTACH_ICON;
      attachBtn.addEventListener('click', () => this._openFilePicker());
      toolbar.appendChild(attachBtn);

      // Hidden file input
      this._fileInput = document.createElement('input');
      this._fileInput.type = 'file';
      this._fileInput.style.display = 'none';
      this._fileInput.accept = 'image/*,.pdf,.txt,.zip';
      this._fileInput.addEventListener('change', (e) => this._handleFileSelect(e));
      this._el.appendChild(this._fileInput);
    }

    // Escalation button (from EscalationTimer component)
    if (this._escalationButton) {
      toolbar.appendChild(this._escalationButton);
    }

    this._el.appendChild(toolbar);

    // Input row (textarea + send button)
    const row = document.createElement('div');
    row.className = 'airpilot-input-row';

    this._textarea = document.createElement('textarea');
    this._textarea.className = 'airpilot-textarea';
    this._textarea.setAttribute('placeholder', t('widget.inputPlaceholder'));
    this._textarea.setAttribute('rows', '1');
    this._textarea.addEventListener('input', () => this._autoResize());
    this._textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._handleSend();
      }
    });
    row.appendChild(this._textarea);

    this._sendBtn = document.createElement('button');
    this._sendBtn.className = 'airpilot-send-btn';
    this._sendBtn.setAttribute('type', 'button');
    this._sendBtn.setAttribute('aria-label', t('widget.send'));
    this._sendBtn.innerHTML = SEND_ICON;
    this._sendBtn.addEventListener('click', () => this._handleSend());
    row.appendChild(this._sendBtn);

    this._el.appendChild(row);

    return this._el;
  }

  /**
   * Set disabled state (e.g., while sending).
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this._disabled = disabled;
    if (this._textarea) this._textarea.disabled = disabled;
    if (this._sendBtn) this._sendBtn.disabled = disabled;
  }

  /**
   * Focus the text input.
   */
  focus() {
    if (this._textarea) this._textarea.focus();
  }

  /**
   * Clear the text input.
   */
  clear() {
    if (this._textarea) {
      this._textarea.value = '';
      this._autoResize();
    }
    this._clearFilePreview();
  }

  /**
   * Set up drag & drop on the given container element.
   * @param {HTMLElement} container
   */
  setupDragDrop(container) {
    if (!container || !this._enableAttachments) return;

    let dragCounter = 0;

    // Create drop zone overlay
    const dropzone = document.createElement('div');
    dropzone.className = 'airpilot-dropzone';
    const dropText = document.createElement('span');
    dropText.className = 'airpilot-dropzone-text';
    dropText.textContent = t('attachment.dragDrop');
    dropzone.appendChild(dropText);
    container.appendChild(dropzone);

    container.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      dropzone.classList.add('airpilot-dropzone--active');
    });

    container.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        dropzone.classList.remove('airpilot-dropzone--active');
      }
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      dropzone.classList.remove('airpilot-dropzone--active');

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this._processFile(files[0]);
      }
    });
  }

  /**
   * Get the root element.
   * @returns {HTMLElement}
   */
  getElement() {
    return this._el;
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  _handleSend() {
    if (this._disabled) return;
    const text = (this._textarea?.value || '').trim();

    // Send file attachment first if pending
    if (this._pendingFile) {
      if (this._onAttach) this._onAttach(this._pendingFile);
      this._pendingFile = null;
      this._clearFilePreview();
    }

    if (!text) return;

    if (this._onSend) this._onSend(text);

    // Close emoji picker
    if (this._emojiPicker && this._emojiPicker.isVisible()) {
      this._emojiPicker.toggle(false);
    }
  }

  _autoResize() {
    if (!this._textarea) return;
    this._textarea.style.height = 'auto';
    this._textarea.style.height = Math.min(this._textarea.scrollHeight, 120) + 'px';
  }

  _insertEmoji(emoji) {
    if (!this._textarea) return;
    const start = this._textarea.selectionStart;
    const end = this._textarea.selectionEnd;
    const val = this._textarea.value;
    this._textarea.value = val.substring(0, start) + emoji + val.substring(end);
    this._textarea.selectionStart = this._textarea.selectionEnd = start + emoji.length;
    this._textarea.focus();
    this._autoResize();
  }

  _openFilePicker() {
    if (this._fileInput) this._fileInput.click();
  }

  _handleFileSelect(e) {
    const file = e.target?.files?.[0];
    if (file) this._processFile(file);
    // Reset input so same file can be selected again
    if (this._fileInput) this._fileInput.value = '';
  }

  _processFile(file) {
    // Validate type
    if (!isAllowedFileType(file, ALLOWED_FILE_TYPES)) {
      this._showFileError(t('attachment.invalidType'));
      return;
    }

    // Validate size
    if (!isAllowedFileSize(file, MAX_FILE_SIZE_MB)) {
      this._showFileError(t('attachment.tooLarge', { max: MAX_FILE_SIZE_MB }));
      return;
    }

    this._pendingFile = file;
    this._showFilePreview(file);
  }

  _showFilePreview(file) {
    if (!this._uploadPreviewEl) return;
    this._uploadPreviewEl.innerHTML = '';
    this._uploadPreviewEl.style.display = '';
    this._uploadPreviewEl.className = 'airpilot-upload-preview';

    // Image preview
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.addEventListener('load', () => URL.revokeObjectURL(img.src));
      this._uploadPreviewEl.appendChild(img);
    }

    const name = document.createElement('span');
    name.className = 'airpilot-upload-preview-name';
    name.textContent = file.name;
    this._uploadPreviewEl.appendChild(name);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'airpilot-upload-preview-remove';
    removeBtn.setAttribute('type', 'button');
    removeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    removeBtn.addEventListener('click', () => this._clearFilePreview());
    this._uploadPreviewEl.appendChild(removeBtn);
  }

  _clearFilePreview() {
    this._pendingFile = null;
    if (this._uploadPreviewEl) {
      this._uploadPreviewEl.innerHTML = '';
      this._uploadPreviewEl.style.display = 'none';
    }
  }

  _showFileError(message) {
    // Brief toast-style error — cleared after 3s
    if (!this._uploadPreviewEl) return;
    this._uploadPreviewEl.innerHTML = '';
    this._uploadPreviewEl.style.display = '';
    this._uploadPreviewEl.className = 'airpilot-upload-preview';

    const errSpan = document.createElement('span');
    errSpan.style.color = 'var(--airpilot-error)';
    errSpan.style.fontSize = '13px';
    errSpan.textContent = message;
    this._uploadPreviewEl.appendChild(errSpan);

    setTimeout(() => this._clearFilePreview(), 3000);
  }
}
