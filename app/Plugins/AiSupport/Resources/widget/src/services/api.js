/**
 * API Service
 *
 * HTTP client for communicating with the Xboard AiSupport plugin endpoints.
 * Handles auth tokens, CSRF, and error handling.
 */

let baseUrl = '/api/v1/user/ai-support';
let authToken = null;
let guestSession = null;
let csrfToken = null;

/**
 * Configure the API service.
 * @param {Object} config
 * @param {string} config.apiBaseUrl
 * @param {string} [config.authToken]
 * @param {Object} [config.guestSession] - { name, email, sessionId }
 */
export function configureApi(config) {
  if (config.apiBaseUrl) baseUrl = config.apiBaseUrl.replace(/\/$/, '');
  if (config.authToken) authToken = config.authToken;
  if (config.guestSession) guestSession = config.guestSession;

  // Try to detect CSRF token from Xboard's meta tag
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (csrfMeta) {
    csrfToken = csrfMeta.getAttribute('content');
  }
}

/**
 * Update auth token (for session refresh).
 * @param {string} token
 */
export function setAuthToken(token) {
  authToken = token;
}

/**
 * Update guest session.
 * @param {Object} session
 */
export function setGuestSession(session) {
  guestSession = session;
}

/**
 * Build headers for requests.
 * @returns {Object}
 */
function buildHeaders(isFormData) {
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  headers['Accept'] = 'application/json';

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (csrfToken) {
    headers['X-CSRF-TOKEN'] = csrfToken;
  }

  // Include guest session info in custom header
  if (!authToken && guestSession) {
    headers['X-Guest-Session'] = JSON.stringify(guestSession);
  }

  return headers;
}

/**
 * Generic request handler with error handling.
 * @param {string} method
 * @param {string} path
 * @param {Object} [options]
 * @returns {Promise<Object>}
 */
async function request(method, path, options) {
  const url = `${baseUrl}${path}`;
  const fetchOptions = {
    method,
    headers: buildHeaders(options?.formData),
    credentials: 'same-origin',
  };

  if (options?.body && !options?.formData) {
    fetchOptions.body = JSON.stringify(options.body);
  } else if (options?.formData) {
    fetchOptions.body = options.formData;
  }

  if (options?.signal) {
    fetchOptions.signal = options.signal;
  }

  const resp = await fetch(url, fetchOptions);

  if (!resp.ok) {
    let errorBody;
    try {
      errorBody = await resp.json();
    } catch (e) {
      errorBody = null;
    }
    const error = new Error(errorBody?.error || errorBody?.message || `HTTP ${resp.status}`);
    error.status = resp.status;
    error.body = errorBody;
    throw error;
  }

  return resp.json();
}

// ─── Public API Methods ──────────────────────────────────────────────────

/**
 * Send a chat message.
 * @param {string} message
 * @param {string} [conversationId]
 * @param {Object} [options]
 * @returns {Promise<{ message: Object, conversationId: string }>}
 */
export function sendMessage(message, conversationId, options) {
  return request('POST', '/chat', {
    body: {
      message,
      conversation_id: conversationId || undefined,
      ...((guestSession && !authToken) ? { guest: guestSession } : {}),
    },
    signal: options?.signal,
  });
}

/**
 * Get conversation history.
 * @param {string} [conversationId]
 * @param {Object} [options]
 * @returns {Promise<{ messages: Object[], conversationId: string }>}
 */
export function getHistory(conversationId, options) {
  const query = conversationId ? `?conversation_id=${encodeURIComponent(conversationId)}` : '';
  return request('GET', `/history${query}`, { signal: options?.signal });
}

/**
 * Check attachment eligibility.
 *
 * The current AirPilot widget contract only supports attachment metadata
 * pre-flight; this panel does not provide binary upload storage yet.
 * @param {File} file
 * @param {string} [conversationId]
 * @param {Function} [onProgress] - (percent: number) => void
 * @returns {Promise<never>}
 */
export async function uploadAttachment(file, conversationId, onProgress) {
  if (onProgress) onProgress(0);

  if (!conversationId) {
    const error = new Error('conversation_id required');
    error.status = 422;
    throw error;
  }

  const preflight = await request('POST', '/attachment', {
    body: {
      conversation_id: conversationId,
      filename: file.name,
      content_type: file.type || 'application/octet-stream',
      file_size: file.size,
    },
  });

  if (onProgress) onProgress(100);

  if (!preflight.allowed) {
    const error = new Error(preflight.message || 'Attachment rejected');
    error.status = 422;
    error.body = preflight;
    throw error;
  }

  const unsupported = new Error('Attachment uploads are not available in this panel yet');
  unsupported.status = 501;
  unsupported.body = preflight;
  throw unsupported;
}

/**
 * Submit feedback on a conversation (helpful / not helpful).
 * @param {string} conversationId
 * @param {string} feedback - optional text feedback
 * @param {boolean} isHelpful
 * @returns {Promise<Object>}
 */
export function submitFeedback(conversationId, feedback, isHelpful) {
  return request('POST', '/feedback', {
    body: { conversation_id: conversationId, feedback, is_helpful: isHelpful },
  });
}

/**
 * Request human escalation.
 * @param {string} conversationId
 * @returns {Promise<Object>}
 */
export function requestEscalation(conversationId) {
  return request('POST', '/escalate', {
    body: { conversation_id: conversationId },
  });
}

/**
 * Submit satisfaction rating.
 * @param {string} conversationId
 * @param {number} rating - 1-5
 * @param {string} [comment]
 * @returns {Promise<Object>}
 */
export function submitRating(conversationId, rating, comment) {
  return request('POST', '/rating', {
    body: { conversation_id: conversationId, rating, comment },
  });
}

/**
 * Poll conversation status.
 * @param {string} conversationId
 * @param {Object} [options]
 * @returns {Promise<{ status: string, newMessages: Object[], escalation: Object }>}
 */
export function getStatus(conversationId, options) {
  const query = conversationId ? `?conversation_id=${encodeURIComponent(conversationId)}` : '';
  return request('GET', `/status${query}`, { signal: options?.signal });
}
