/**
 * Internationalization Service
 *
 * Loads locale JSON files bundled at build time.
 * Auto-detects language from Xboard or browser.
 */

import zhCN from '../locales/zh-CN.json';
import en from '../locales/en.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import ru from '../locales/ru.json';

const LOCALES = {
  'zh-CN': zhCN,
  'zh': zhCN,     // fallback: zh → zh-CN
  'zh-TW': zhCN,  // fallback: zh-TW → zh-CN
  'en': en,
  'en-US': en,
  'en-GB': en,
  'ja': ja,
  'ja-JP': ja,
  'ko': ko,
  'ko-KR': ko,
  'ru': ru,
  'ru-RU': ru,
};

const DEFAULT_LOCALE = 'en';

let currentLocale = DEFAULT_LOCALE;
let currentStrings = en;

/**
 * Initialize i18n with the given locale.
 * Falls back to English if locale is not supported.
 * @param {string} locale
 */
export function initI18n(locale) {
  if (locale && LOCALES[locale]) {
    currentLocale = locale;
    currentStrings = LOCALES[locale];
  } else if (locale) {
    // Try base language (e.g., 'zh-Hans' → 'zh')
    const base = locale.split('-')[0];
    if (LOCALES[base]) {
      currentLocale = base;
      currentStrings = LOCALES[base];
    } else {
      currentLocale = DEFAULT_LOCALE;
      currentStrings = en;
    }
  } else {
    currentLocale = DEFAULT_LOCALE;
    currentStrings = en;
  }
}

/**
 * Get a translated string by key.
 * Supports nested keys with dot notation (e.g., 'survey.stars.5').
 * Supports interpolation: t('widget.unread', { count: 3 }) → '3 unread message(s)'
 *
 * @param {string} key
 * @param {Object} [params]
 * @returns {string}
 */
export function t(key, params) {
  let val = getNestedValue(currentStrings, key);

  // Fallback to English if key not found in current locale
  if (val == null) {
    val = getNestedValue(en, key);
  }

  // Still not found: return key itself
  if (val == null) return key;

  if (typeof val !== 'string') return String(val);

  // Interpolation: replace {name} with params.name
  if (params) {
    return val.replace(/\{(\w+)\}/g, (_, name) => {
      return params[name] != null ? String(params[name]) : `{${name}}`;
    });
  }

  return val;
}

/**
 * Get current locale code.
 * @returns {string}
 */
export function getCurrentLocale() {
  return currentLocale;
}

/**
 * Auto-detect locale from Xboard or browser.
 * @returns {string}
 */
export function detectLocale() {
  // 1. Check Xboard's data attribute
  const xboardLocale = document.documentElement.getAttribute('lang') ||
    document.querySelector('meta[name="locale"]')?.getAttribute('content');
  if (xboardLocale && LOCALES[xboardLocale]) return xboardLocale;

  // 2. Check browser language
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang && LOCALES[browserLang]) return browserLang;

  // 3. Try base language
  if (browserLang) {
    const base = browserLang.split('-')[0];
    if (LOCALES[base]) return base;
  }

  return DEFAULT_LOCALE;
}

// ─── Internal helpers ────────────────────────────────────────────────────

function getNestedValue(obj, key) {
  if (!obj || !key) return undefined;

  // Support flat keys like "widget.title".
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key];
  }

  const parts = key.split('.');
  let current = obj;
  for (const part of parts) {
    if (
      current == null ||
      typeof current !== 'object' ||
      !Object.prototype.hasOwnProperty.call(current, part)
    ) {
      current = undefined;
      break;
    }
    current = current[part];
  }

  if (current !== undefined) {
    return current;
  }

  // Support flat namespace objects like "survey.stars": { "1": "...", ... }
  for (let i = parts.length - 1; i > 0; i -= 1) {
    const flatPrefix = parts.slice(0, i).join('.');
    if (!Object.prototype.hasOwnProperty.call(obj, flatPrefix)) continue;

    let nested = obj[flatPrefix];
    let valid = true;
    for (const part of parts.slice(i)) {
      if (
        nested == null ||
        typeof nested !== 'object' ||
        !Object.prototype.hasOwnProperty.call(nested, part)
      ) {
        valid = false;
        break;
      }
      nested = nested[part];
    }

    if (valid && nested !== undefined) {
      return nested;
    }
  }

  return undefined;
}
