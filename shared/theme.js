/**
 * readmark - Minimal Theme Engine
 */
const ThemeManager = {
  current: 'system',
  mq: window.matchMedia('(prefers-color-scheme: dark)'),

  init(theme = 'system') {
    this.set(theme);
    this.mq.addEventListener('change', () => this.current === 'system' && this.set('system'));
  },

  set(theme) {
    this.current = theme;
    const isDark = theme === 'system' ? this.mq.matches : theme === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-color-scheme', theme);
  },

  setTheme(theme) { this.set(theme); },
  getTheme() { return this.current; },
  getEffectiveTheme() { return this.current === 'system' ? (this.mq.matches ? 'dark' : 'light') : this.current; }
};

if (typeof module !== 'undefined' && module.exports) module.exports = ThemeManager;
