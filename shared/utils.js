/**
 * Readmark - Shared Utility Functions
 * Single source of truth for URL helpers used across popup, options, and service worker.
 */

function isRestrictedUrl(u) {
  return !u || typeof u !== 'string' ||
    /^(chrome|edge|brave|opera|vivaldi|about|devtools|chrome-extension|view-source):/i.test(u.trim()) ||
    u.trim().toLowerCase() === 'about:blank';
}

function deriveTitleFromUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url), p = u.pathname.split('/').filter(x => x && !/\.(html?|php|asp)$/i.test(x));
    if (p.length) {
      const last = decodeURIComponent(p[p.length - 1]).replace(/[-_]+/g, ' ').trim();
      if (last.length > 2) return last.charAt(0).toUpperCase() + last.slice(1);
    }
    return u.hostname.replace(/^www\./i, '');
  } catch { return url; }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { isRestrictedUrl, deriveTitleFromUrl };
