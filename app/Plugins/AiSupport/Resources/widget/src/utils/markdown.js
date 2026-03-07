/**
 * Markdown Rendering
 *
 * Uses marked.js for parsing and DOMPurify (via sanitizer.js) for XSS prevention.
 */

import { marked } from 'marked';
import { sanitizeHtml } from './sanitizer.js';

// Configure marked for safe, minimal rendering
marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
  async: false,
});

// Custom renderer to add CSS classes
const renderer = new marked.Renderer();

// Open links in new tab
renderer.link = function ({ href, title, tokens }) {
  const text = this.parser.parseInline(tokens);
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
};

// Add language class to code blocks
renderer.code = function ({ text, lang }) {
  const langClass = lang ? ` class="language-${lang}"` : '';
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<pre><code${langClass}>${escaped}</code></pre>`;
};

marked.use({ renderer });

/**
 * Render markdown string to sanitized HTML.
 * @param {string} md - Raw markdown text
 * @returns {string} Sanitized HTML
 */
export function renderMarkdown(md) {
  if (!md || typeof md !== 'string') return '';

  try {
    const html = marked.parse(md);
    return sanitizeHtml(html);
  } catch (err) {
    // Fallback: escape and display as plain text
    console.warn('[AirPilot] Markdown parse error:', err);
    return sanitizeHtml(md.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  }
}

/**
 * Render inline markdown (no block-level elements).
 * Useful for single-line previews.
 * @param {string} md
 * @returns {string}
 */
export function renderInlineMarkdown(md) {
  if (!md || typeof md !== 'string') return '';

  try {
    const html = marked.parseInline(md);
    return sanitizeHtml(html);
  } catch (err) {
    return sanitizeHtml(md);
  }
}
