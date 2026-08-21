/**
 * Readmark - Background Service Worker (Manifest V3)
 */
const MENU_I18N = {
  tr: { page: 'Sayfayı kaydet', link: 'Bağlantıyı kaydet' }, en: { page: 'Save page', link: 'Save link' },
  de: { page: 'Seite speichern', link: 'Link speichern' }, fr: { page: 'Enregistrer la page', link: 'Enregistrer le lien' },
  es: { page: 'Guardar página', link: 'Guardar enlace' }, it: { page: 'Salva pagina', link: 'Salva link' },
  pt_BR: { page: 'Salvar página', link: 'Salvar link' }, ru: { page: 'Сохранить страницу', link: 'Сохранить ссылку' },
  zh_CN: { page: '保存页面', link: '保存链接' }, zh_TW: { page: '儲存頁面', link: '儲存連結' },
  ja: { page: 'ページを保存', link: 'リンクを保存' }, ko: { page: '페이지 저장', link: '링크 저장' },
  ar: { page: 'حفظ الصفحة', link: 'حفظ الرابط' }, hi: { page: 'पेज सहेजें', link: 'लिंक सहेजें' },
  nl: { page: 'Pagina opslaan', link: 'Link opslaan' }, pl: { page: 'Zapisz stronę', link: 'Zapisz link' },
  uk: { page: 'Зберегти сторінку', link: 'Зберегти посилання' }, sv: { page: 'Spara sida', link: 'Spara länk' },
  id: { page: 'Simpan halaman', link: 'Simpan tautan' }, vi: { page: 'Lưu trang', link: 'Lưu liên kết' }
};

importScripts('../shared/utils.js');

async function setupContextMenus() {
  const { readmark_settings: s = {} } = await chrome.storage.local.get(['readmark_settings']);
  chrome.contextMenus.removeAll(() => {
    if (s.enableContextMenu === false) return;
    let lang = s.language;
    if (!lang || lang === 'system') { try { lang = chrome.i18n?.getUILanguage?.().replace('-', '_') || 'tr'; } catch { lang = 'tr'; } if (!MENU_I18N[lang]) lang = lang.split('_')[0].toLowerCase(); }
    const t = MENU_I18N[lang] || MENU_I18N.en || MENU_I18N.tr;
    chrome.contextMenus.create({ id: 'readmark_page', title: t.page, contexts: ['page'] }, () => { if (chrome.runtime.lastError) {} });
    chrome.contextMenus.create({ id: 'readmark_link', title: t.link, contexts: ['link'] }, () => { if (chrome.runtime.lastError) {} });
  });
}

async function updateBadge() {
  if (!chrome.action?.setBadgeText) return;
  const { readmark_items: items = [], readmark_settings: s = {} } = await chrome.storage.local.get(['readmark_items', 'readmark_settings']);
  const unread = items.filter(i => !i.isRead).length;
  chrome.action.setBadgeText({ text: (s.showBadgeCount !== false && unread > 0) ? String(unread) : '' });
}

async function addItem(data) {
  if (!data?.url) return;
  const clean = data.url.trim();
  if (isRestrictedUrl(clean)) return;

  const { readmark_items: items = [] } = await chrome.storage.local.get(['readmark_items']);
  if (items.some(i => i.url.toLowerCase() === clean.toLowerCase())) return;

  let title = (data.title || '').trim();
  if (!title || title === clean || title === clean.replace(/^https?:\/\//i, '')) title = deriveTitleFromUrl(clean);

  let readingTime = data.readingTime || null;
  if (!readingTime && data.id && chrome.scripting?.executeScript) {
    try {
      const [res] = await chrome.scripting.executeScript({
        target: { tabId: data.id },
        func: () => {
          const root = document.querySelector('article, main, [role="main"], .post-content, .article-content, #content') || document.body;
          const words = (root?.innerText || '').trim().split(/\s+/).filter(Boolean).length;
          return words >= 60 ? Math.ceil(words / 200) : null;
        }
      });
      if (res?.result) readingTime = res.result;
    } catch {}
  }

  items.unshift({
    id: `rm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    url: clean, title: title || clean, favIconUrl: (data.favIconUrl && typeof data.favIconUrl === 'string' && !data.favIconUrl.includes('google.com/s2/favicons')) ? data.favIconUrl : '',
    addedAt: Date.now(), isRead: false, isPinned: false, readingTime: (typeof readingTime === 'number' && readingTime > 0) ? readingTime : null
  });

  await chrome.storage.local.set({ readmark_items: items });
  await updateBadge();
}

function initExtension() { chrome.action?.setBadgeBackgroundColor?.({ color: '#4285F4' }); setupContextMenus(); updateBadge(); }
chrome.runtime.onInstalled.addListener(initExtension);
chrome.runtime.onStartup.addListener(initExtension);
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'readmark_page' && tab?.url) await addItem(tab);
  else if (info.menuItemId === 'readmark_link' && info.linkUrl) await addItem({ url: info.linkUrl, title: info.selectionText || info.linkUrl });
});
chrome.commands?.onCommand?.addListener(async cmd => {
  if (cmd === 'add_current_tab') { const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); if (tab?.url) await addItem(tab); }
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.readmark_settings) {
      const { oldValue: o = {}, newValue: n = {} } = changes.readmark_settings;
      if (o.language !== n.language || o.enableContextMenu !== n.enableContextMenu) setupContextMenus();
      updateBadge();
    }
    if (changes.readmark_items) updateBadge();
  }
});
