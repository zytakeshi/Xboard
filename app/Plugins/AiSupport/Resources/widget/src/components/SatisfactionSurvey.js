/**
 * SatisfactionSurvey Component
 *
 * 1-5 star rating displayed after conversation is resolved.
 */

import { t } from '../services/i18n.js';

const STAR_FILLED = '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
const STAR_EMPTY = '<svg viewBox="0 0 24 24"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>';

export class SatisfactionSurvey {
  /**
   * @param {Object} options
   * @param {Function} options.onSubmit - (rating: number) => void
   * @param {Function} [options.onSkip] - () => void
   */
  constructor(options) {
    this._onSubmit = options.onSubmit;
    this._onSkip = options.onSkip;
    this._el = null;
    this._rating = 0;
    this._hoverRating = 0;
    this._submitted = false;
    this._starButtons = [];
  }

  /**
   * Create and return the survey DOM element.
   * @returns {HTMLElement}
   */
  render() {
    this._el = document.createElement('div');
    this._el.className = 'airpilot-survey airpilot-survey--hidden';

    // Title
    const title = document.createElement('div');
    title.className = 'airpilot-survey-title';
    title.textContent = t('survey.title');
    this._el.appendChild(title);

    // Stars
    const starsContainer = document.createElement('div');
    starsContainer.className = 'airpilot-survey-stars';

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('button');
      star.className = 'airpilot-survey-star';
      star.setAttribute('type', 'button');
      star.setAttribute('aria-label', `${i} ${t(`survey.stars.${i}`)}`);
      star.innerHTML = STAR_EMPTY;

      star.addEventListener('mouseenter', () => {
        this._hoverRating = i;
        this._updateStars();
      });

      star.addEventListener('mouseleave', () => {
        this._hoverRating = 0;
        this._updateStars();
      });

      star.addEventListener('click', () => {
        this._rating = i;
        this._hoverRating = 0;
        this._updateStars();
        star.classList.add('airpilot-survey-star--pop');
      });

      this._starButtons.push(star);
      starsContainer.appendChild(star);
    }
    this._el.appendChild(starsContainer);

    // Label (shows current hover/selected rating label)
    this._labelEl = document.createElement('div');
    this._labelEl.className = 'airpilot-survey-label';
    this._el.appendChild(this._labelEl);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'airpilot-survey-actions';

    this._submitBtn = document.createElement('button');
    this._submitBtn.className = 'airpilot-survey-submit';
    this._submitBtn.setAttribute('type', 'button');
    this._submitBtn.textContent = t('survey.submit');
    this._submitBtn.disabled = true;
    this._submitBtn.addEventListener('click', () => this._submit());
    actions.appendChild(this._submitBtn);

    const skipBtn = document.createElement('button');
    skipBtn.className = 'airpilot-survey-skip';
    skipBtn.setAttribute('type', 'button');
    skipBtn.textContent = t('survey.skip');
    skipBtn.addEventListener('click', () => {
      this.hide();
      if (this._onSkip) this._onSkip();
    });
    actions.appendChild(skipBtn);

    this._el.appendChild(actions);

    // Thanks message (hidden initially)
    this._thanksEl = document.createElement('div');
    this._thanksEl.className = 'airpilot-survey-thanks';
    this._thanksEl.style.display = 'none';
    this._thanksEl.textContent = t('survey.thanks');
    this._el.appendChild(this._thanksEl);

    return this._el;
  }

  /**
   * Show the survey.
   */
  show() {
    if (this._submitted) return;
    if (this._el) {
      this._el.classList.remove('airpilot-survey--hidden');
    }
  }

  /**
   * Hide the survey.
   */
  hide() {
    if (this._el) {
      this._el.classList.add('airpilot-survey--hidden');
    }
  }

  /**
   * Check if visible.
   * @returns {boolean}
   */
  isVisible() {
    return this._el ? !this._el.classList.contains('airpilot-survey--hidden') : false;
  }

  /**
   * Get the root element.
   * @returns {HTMLElement}
   */
  getElement() {
    return this._el;
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  _updateStars() {
    const display = this._hoverRating || this._rating;

    for (let i = 0; i < 5; i++) {
      const star = this._starButtons[i];
      const filled = i < display;
      star.innerHTML = filled ? STAR_FILLED : STAR_EMPTY;
      star.classList.toggle('airpilot-survey-star--active', i < this._rating && !this._hoverRating);
      star.classList.toggle('airpilot-survey-star--hover', this._hoverRating > 0 && i < this._hoverRating);
    }

    // Update label
    if (display > 0) {
      this._labelEl.textContent = t(`survey.stars.${display}`);
    } else {
      this._labelEl.textContent = '';
    }

    // Enable submit button when a rating is selected
    if (this._submitBtn) {
      this._submitBtn.disabled = this._rating === 0;
    }
  }

  _submit() {
    if (this._rating === 0 || this._submitted) return;
    this._submitted = true;

    if (this._onSubmit) this._onSubmit(this._rating);

    // Show thanks, hide rating UI
    const starsEl = this._el.querySelector('.airpilot-survey-stars');
    const actionsEl = this._el.querySelector('.airpilot-survey-actions');
    const titleEl = this._el.querySelector('.airpilot-survey-title');
    if (starsEl) starsEl.style.display = 'none';
    if (actionsEl) actionsEl.style.display = 'none';
    if (titleEl) titleEl.style.display = 'none';
    if (this._labelEl) this._labelEl.style.display = 'none';
    if (this._thanksEl) this._thanksEl.style.display = '';

    // Auto-hide after 3s
    setTimeout(() => this.hide(), 3000);
  }
}
