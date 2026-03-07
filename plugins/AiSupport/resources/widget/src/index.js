/**
 * AirPilot Chat Widget — Entry Point
 *
 * Self-contained chat widget for embedding in Xboard user panels.
 * Initializes from window.AirPilot.init(config).
 *
 * Usage:
 *   <script src="/plugins/ai-support/widget/airpilot-widget.js"></script>
 *   <script>
 *     AirPilot.init({
 *       apiBaseUrl: '/api/v1/user/ai-support',
 *       authToken: '...',
 *       locale: 'zh-CN',
 *       theme: 'auto',
 *     });
 *   </script>
 */

// Import styles as text (esbuild text loader)
import baseCSS from './styles/base.css';
import darkCSS from './styles/dark.css';
import animationsCSS from './styles/animations.css';

// Services
import { initI18n, detectLocale, t } from './services/i18n.js';
import { configureApi, setGuestSession } from './services/api.js';
import {
  getGuestSession,
  saveGuestSession,
  generateSessionId,
  getWidgetOpen,
  saveWidgetOpen,
} from './services/storage.js';

// Components
import { ChatBubble } from './components/ChatBubble.js';
import { ChatPanel } from './components/ChatPanel.js';

// ─── State ───────────────────────────────────────────────────────────────

let initialized = false;
let rootEl = null;
let bubble = null;
let panel = null;
let guestFormEl = null;
let isOpen = false;
let config = {};
let unreadCount = 0;

// ─── CSS Injection ───────────────────────────────────────────────────────

function injectStyles() {
  const style = document.createElement('style');
  style.setAttribute('data-airpilot', 'true');
  style.textContent = baseCSS + '\n' + darkCSS + '\n' + animationsCSS;
  document.head.appendChild(style);
}

// ─── Theme Detection ─────────────────────────────────────────────────────

function detectTheme(preference) {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';

  // Auto-detect from Xboard
  const xboardTheme = document.documentElement.getAttribute('data-theme') ||
    document.body.getAttribute('data-theme');
  if (xboardTheme === 'dark') return 'dark';

  const hasDarkClass = document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark');
  if (hasDarkClass) return 'dark';

  // System preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

// ─── Guest Form ──────────────────────────────────────────────────────────

function renderGuestForm(onSubmit) {
  const form = document.createElement('div');
  form.className = 'airpilot-guest-form';

  const title = document.createElement('div');
  title.className = 'airpilot-guest-title';
  title.textContent = t('guest.title');
  form.appendChild(title);

  // Name field
  const nameField = document.createElement('div');
  nameField.className = 'airpilot-guest-field';
  const nameLabel = document.createElement('label');
  nameLabel.className = 'airpilot-guest-label';
  nameLabel.textContent = t('guest.name');
  nameField.appendChild(nameLabel);
  const nameInput = document.createElement('input');
  nameInput.className = 'airpilot-guest-input';
  nameInput.type = 'text';
  nameInput.placeholder = t('guest.name');
  nameField.appendChild(nameInput);
  const nameError = document.createElement('div');
  nameError.className = 'airpilot-guest-error';
  nameField.appendChild(nameError);
  form.appendChild(nameField);

  // Email field
  const emailField = document.createElement('div');
  emailField.className = 'airpilot-guest-field';
  const emailLabel = document.createElement('label');
  emailLabel.className = 'airpilot-guest-label';
  emailLabel.textContent = t('guest.email');
  emailField.appendChild(emailLabel);
  const emailInput = document.createElement('input');
  emailInput.className = 'airpilot-guest-input';
  emailInput.type = 'email';
  emailInput.placeholder = t('guest.email');
  emailField.appendChild(emailInput);
  const emailError = document.createElement('div');
  emailError.className = 'airpilot-guest-error';
  emailField.appendChild(emailError);
  form.appendChild(emailField);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.className = 'airpilot-guest-submit';
  submitBtn.type = 'button';
  submitBtn.textContent = t('guest.start');
  submitBtn.addEventListener('click', () => {
    let valid = true;
    nameError.textContent = '';
    emailError.textContent = '';
    nameInput.classList.remove('airpilot-guest-input--error');
    emailInput.classList.remove('airpilot-guest-input--error');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name) {
      nameError.textContent = t('guest.nameRequired');
      nameInput.classList.add('airpilot-guest-input--error');
      valid = false;
    }

    if (!email) {
      emailError.textContent = t('guest.emailRequired');
      emailInput.classList.add('airpilot-guest-input--error');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = t('guest.emailInvalid');
      emailInput.classList.add('airpilot-guest-input--error');
      valid = false;
    }

    if (valid) {
      onSubmit({ name, email, sessionId: generateSessionId() });
    }
  });
  form.appendChild(submitBtn);

  return form;
}

// ─── Main Init ───────────────────────────────────────────────────────────

function init(userConfig) {
  if (initialized) {
    console.warn('[AirPilot] Widget already initialized');
    return;
  }

  config = Object.assign({
    apiBaseUrl: '/api/v1/user/ai-support',
    authToken: null,
    userId: null,
    locale: null,
    theme: 'auto',
    widgetName: 'AI Support',
    aiNickname: 'AI',
    position: 'bottom-right',
    enableAttachments: false,
    enableEscalation: true,
  }, userConfig || {});

  // Initialize i18n
  const locale = config.locale || detectLocale();
  initI18n(locale);

  // Configure API
  configureApi({
    apiBaseUrl: config.apiBaseUrl,
    authToken: config.authToken,
  });

  // Inject styles
  injectStyles();

  // Create root container
  rootEl = document.createElement('div');
  rootEl.className = 'airpilot-root';

  // Apply theme
  const theme = detectTheme(config.theme);
  if (theme === 'dark') {
    rootEl.classList.add('airpilot-root--dark');
  }

  // Apply position
  if (config.position === 'bottom-left') {
    rootEl.classList.add('airpilot-root--bottom-left');
  }

  // Listen for system theme changes
  if (config.theme === 'auto' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (rootEl) rootEl.classList.toggle('airpilot-root--dark', e.matches);
    });
  }

  // Create bubble
  bubble = new ChatBubble({
    onToggle: () => togglePanel(),
  });
  rootEl.appendChild(bubble.render());

  // Determine auth mode
  const isAuthenticated = !!(config.authToken || config.userId);
  const existingGuest = getGuestSession();

  // Create panel
  panel = new ChatPanel({
    widgetName: config.widgetName,
    aiNickname: config.aiNickname,
    enableAttachments: config.enableAttachments,
    enableEscalation: config.enableEscalation,
    userId: config.userId || (existingGuest ? existingGuest.sessionId : null),
    onClose: () => closePanel(),
    onMinimize: () => minimizePanel(),
    onNewMessage: (msg) => handleNewMessage(msg),
  });
  rootEl.appendChild(panel.render());

  // Restore guest session if it exists
  if (!isAuthenticated && existingGuest) {
    setGuestSession(existingGuest);
    configureApi({ apiBaseUrl: config.apiBaseUrl, guestSession: existingGuest });
  }

  // Append to DOM
  document.body.appendChild(rootEl);

  initialized = true;

  // Restore open state
  if (getWidgetOpen()) {
    openPanel();
  }
}

// ─── Panel Controls ──────────────────────────────────────────────────────

function togglePanel() {
  if (isOpen) {
    closePanel();
  } else {
    openPanel();
  }
}

function openPanel() {
  const isAuthenticated = !!(config.authToken || config.userId);
  const existingGuest = getGuestSession();

  // If guest mode and no session, show guest form first
  if (!isAuthenticated && !existingGuest) {
    showGuestForm();
    return;
  }

  isOpen = true;
  unreadCount = 0;
  bubble.setOpen(true);
  bubble.setUnreadCount(0);
  panel.show();
  saveWidgetOpen(true);
}

function closePanel() {
  isOpen = false;
  if (bubble) bubble.setOpen(false);
  if (panel) panel.hide();
  saveWidgetOpen(false);
  hideGuestForm();
}

function minimizePanel() {
  isOpen = false;
  if (bubble) bubble.setOpen(false);
  if (panel) panel.minimize();
  saveWidgetOpen(false);
}

function showGuestForm() {
  if (guestFormEl) return;

  isOpen = true;
  bubble.setOpen(true);

  const panelEl = document.createElement('div');
  panelEl.className = 'airpilot-panel airpilot-panel--opening';
  panelEl.style.display = 'flex';

  // Header
  const header = document.createElement('div');
  header.className = 'airpilot-header';

  const info = document.createElement('div');
  info.className = 'airpilot-header-info';
  const titleEl = document.createElement('div');
  titleEl.className = 'airpilot-header-title';
  titleEl.textContent = config.widgetName || t('widget.title');
  info.appendChild(titleEl);
  header.appendChild(info);

  const actions = document.createElement('div');
  actions.className = 'airpilot-header-actions';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'airpilot-header-btn';
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('aria-label', t('widget.close'));
  closeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>';
  closeBtn.addEventListener('click', () => closePanel());
  actions.appendChild(closeBtn);
  header.appendChild(actions);
  panelEl.appendChild(header);

  // Guest form content
  const form = renderGuestForm((session) => {
    saveGuestSession(session);
    setGuestSession(session);
    configureApi({ apiBaseUrl: config.apiBaseUrl, guestSession: session });

    hideGuestForm();
    panel.setConversationId(null);
    panel.show();
    saveWidgetOpen(true);
  });
  panelEl.appendChild(form);

  guestFormEl = panelEl;
  rootEl.appendChild(guestFormEl);
}

function hideGuestForm() {
  if (guestFormEl && rootEl && rootEl.contains(guestFormEl)) {
    rootEl.removeChild(guestFormEl);
    guestFormEl = null;
  }
}

function handleNewMessage(msg) {
  if (!isOpen || (panel && !panel.isVisible())) {
    unreadCount++;
    if (bubble) {
      bubble.setUnreadCount(unreadCount);
      bubble.pulse();
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────

const AirPilot = {
  init,

  /** Open the chat panel programmatically. */
  open() {
    if (!initialized) return;
    openPanel();
  },

  /** Close the chat panel programmatically. */
  close() {
    if (!initialized) return;
    closePanel();
  },

  /** Toggle the chat panel. */
  toggle() {
    if (!initialized) return;
    togglePanel();
  },

  /** Destroy the widget and clean up. */
  destroy() {
    if (!initialized) return;
    if (panel) panel.destroy();
    if (rootEl && rootEl.parentNode) {
      rootEl.parentNode.removeChild(rootEl);
    }
    const style = document.querySelector('style[data-airpilot]');
    if (style && style.parentNode) style.parentNode.removeChild(style);

    initialized = false;
    rootEl = null;
    bubble = null;
    panel = null;
  },
};

window.AirPilot = AirPilot;

export default AirPilot;
