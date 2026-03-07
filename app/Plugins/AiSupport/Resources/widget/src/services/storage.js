/**
 * Storage Service
 *
 * Manages localStorage for guest sessions and widget state.
 * All keys are prefixed with 'airpilot_' to avoid conflicts.
 */

const PREFIX = 'airpilot_';

/**
 * Get a value from localStorage.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function getItem(key, defaultValue) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return defaultValue !== undefined ? defaultValue : null;
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue !== undefined ? defaultValue : null;
  }
}

/**
 * Set a value in localStorage.
 * @param {string} key
 * @param {*} value
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    // Storage full or private browsing — silently fail
  }
}

/**
 * Remove a value from localStorage.
 * @param {string} key
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (e) {
    // noop
  }
}

/**
 * Get guest session data.
 * @returns {{ name: string, email: string, sessionId: string } | null}
 */
export function getGuestSession() {
  return getItem('guest_session', null);
}

/**
 * Save guest session data.
 * @param {{ name: string, email: string, sessionId: string }} session
 */
export function saveGuestSession(session) {
  setItem('guest_session', session);
}

/**
 * Clear guest session.
 */
export function clearGuestSession() {
  removeItem('guest_session');
}

/**
 * Get conversation ID for the current user/guest.
 * @param {string} userId
 * @returns {string | null}
 */
export function getConversationId(userId) {
  return getItem(`conv_${userId || 'guest'}`, null);
}

/**
 * Save conversation ID.
 * @param {string} userId
 * @param {string} conversationId
 */
export function saveConversationId(userId, conversationId) {
  setItem(`conv_${userId || 'guest'}`, conversationId);
}

/**
 * Get widget open/closed state.
 * @returns {boolean}
 */
export function getWidgetOpen() {
  return getItem('widget_open', false);
}

/**
 * Save widget open/closed state.
 * @param {boolean} open
 */
export function saveWidgetOpen(open) {
  setItem('widget_open', open);
}

/**
 * Generate a simple unique ID for guest sessions.
 * @returns {string}
 */
export function generateSessionId() {
  return 'gs_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8);
}
