/**
 * Mobile Viewport & Keyboard Helpers
 *
 * Handles iOS keyboard push-up, viewport resize, and safe area insets.
 * Ported from VilaAI's mobile handling patterns.
 */

let viewportHandler = null;
let resizeHandler = null;

/**
 * Detect if the device is mobile.
 * @returns {boolean}
 */
export function isMobile() {
  return window.innerWidth <= 480;
}

/**
 * Detect if the device is a tablet.
 * @returns {boolean}
 */
export function isTablet() {
  return window.innerWidth > 480 && window.innerWidth <= 768;
}

/**
 * Detect iOS device.
 * @returns {boolean}
 */
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Set up iOS keyboard handling.
 * When the virtual keyboard opens on iOS, it pushes the viewport up.
 * We listen to visualViewport resize to adjust the chat panel position.
 *
 * @param {HTMLElement} panelEl - The chat panel element
 * @param {Function} onKeyboardChange - Callback with (isOpen, keyboardHeight)
 * @returns {Function} cleanup function
 */
export function setupKeyboardHandling(panelEl, onKeyboardChange) {
  if (!panelEl) return () => {};

  const vv = window.visualViewport;
  if (!vv) {
    // Fallback for older browsers: use resize event
    resizeHandler = () => {
      const isSmall = window.innerHeight < 500;
      if (onKeyboardChange) onKeyboardChange(isSmall, 0);
    };
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }

  let prevHeight = vv.height;

  viewportHandler = () => {
    const currentHeight = vv.height;
    const diff = prevHeight - currentHeight;

    // If viewport shrunk by > 100px, keyboard is likely open
    if (diff > 100) {
      const keyboardHeight = diff;
      panelEl.style.height = `${currentHeight}px`;
      panelEl.style.bottom = '0';
      if (onKeyboardChange) onKeyboardChange(true, keyboardHeight);
    } else if (currentHeight >= prevHeight - 50) {
      // Keyboard closed
      panelEl.style.height = '';
      panelEl.style.bottom = '';
      if (onKeyboardChange) onKeyboardChange(false, 0);
    }

    prevHeight = currentHeight;
  };

  vv.addEventListener('resize', viewportHandler);

  return () => {
    vv.removeEventListener('resize', viewportHandler);
    panelEl.style.height = '';
    panelEl.style.bottom = '';
  };
}

/**
 * Prevent body scroll when chat panel is open on mobile.
 * @param {boolean} lock
 */
export function lockBodyScroll(lock) {
  if (lock) {
    document.body.style.overflow = 'hidden';
    // iOS-specific: prevent body from scrolling behind the modal
    if (isIOS()) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    }
  } else {
    document.body.style.overflow = '';
    if (isIOS()) {
      const scrollY = Math.abs(parseInt(document.body.style.top || '0', 10));
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    }
  }
}

/**
 * Scroll element to bottom.
 * @param {HTMLElement} el
 * @param {boolean} smooth
 */
export function scrollToBottom(el, smooth) {
  if (!el) return;
  if (smooth) {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  } else {
    el.scrollTop = el.scrollHeight;
  }
}

/**
 * Check if element is scrolled near the bottom (within threshold).
 * Used to decide whether to auto-scroll on new messages.
 * @param {HTMLElement} el
 * @param {number} threshold - pixels from bottom
 * @returns {boolean}
 */
export function isNearBottom(el, threshold) {
  if (!el) return true;
  const t = threshold != null ? threshold : 80;
  return el.scrollHeight - el.scrollTop - el.clientHeight < t;
}
