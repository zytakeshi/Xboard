/**
 * XSS Prevention Utilities
 *
 * Wraps DOMPurify and provides safe DOM manipulation helpers.
 * NEVER use innerHTML for dynamic content without DOMPurify.
 */

import DOMPurify from 'dompurify';

// DOMPurify configuration: allow safe HTML from markdown rendering
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
    'a', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img', 'hr', 'span', 'div', 'sup', 'sub',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'alt', 'title',
    'class', 'id', 'width', 'height',
    'colspan', 'rowspan', 'align',
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  // Force all links to open in new tab
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

/**
 * Sanitize HTML string, removing any XSS vectors.
 * @param {string} html - Raw HTML string (e.g., from markdown rendering)
 * @returns {string} Sanitized HTML safe for innerHTML
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

/**
 * Escape raw text for safe display in HTML context.
 * Use this for user-typed text that shouldn't contain any HTML.
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

/**
 * Safely set inner HTML on an element using DOMPurify.
 * This is the ONLY approved way to set innerHTML in this codebase.
 * @param {HTMLElement} el
 * @param {string} html
 */
export function safeSetHtml(el, html) {
  if (!el) return;
  el.innerHTML = sanitizeHtml(html);

  // Force all links to open in new tab with noopener
  const links = el.querySelectorAll('a[href]');
  for (let i = 0; i < links.length; i++) {
    links[i].setAttribute('target', '_blank');
    links[i].setAttribute('rel', 'noopener noreferrer');
  }
}

/**
 * Create a text node (always safe, no XSS possible).
 * @param {string} text
 * @returns {Text}
 */
export function createTextNode(text) {
  return document.createTextNode(text || '');
}

/**
 * Validate file MIME type against allowed list.
 * @param {File} file
 * @param {string[]} allowedTypes
 * @returns {boolean}
 */
export function isAllowedFileType(file, allowedTypes) {
  if (!file || !file.type) return false;
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
}

/**
 * Validate file size.
 * @param {File} file
 * @param {number} maxSizeMB
 * @returns {boolean}
 */
export function isAllowedFileSize(file, maxSizeMB) {
  if (!file) return false;
  return file.size <= maxSizeMB * 1024 * 1024;
}
