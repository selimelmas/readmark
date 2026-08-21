/**
 * Readmark - Background Service Worker (Manifest V3)
 */
const MENU_I18N = {
  en: { page: 'Save page', link: 'Save link' }, en_GB: { page: 'Save page', link: 'Save link' },
  tr: { page: 'Sayfayı kaydet', link: 'Bağlantıyı kaydet' }, de: { page: 'Seite speichern', link: 'Link speichern' },
  fr: { page: 'Enregistrer la page', link: 'Enregistrer le lien' }, es: { page: 'Guardar página', link: 'Guardar enlace' },
  it: { page: 'Salva pagina', link: 'Salva link' }, pt_BR: { page: 'Salvar página', link: 'Salvar link' },
  pt_PT: { page: 'Guardar página', link: 'Guardar link' }, ru: { page: 'Сохранить страницу', link: 'Сохранить ссылку' },
  zh_CN: { page: '保存页面', link: '保存链接' }, zh_TW: { page: '儲存頁面', link: '儲存連結' },
  ja: { page: 'ページを保存', link: 'リンクを保存' }, ko: { page: '페이지 저장', link: '링크 저장' },
  ar: { page: 'حفظ الصفحة', link: 'حفظ الرابط' }, hi: { page: 'पेज सहेजें', link: 'लिंक सहेजें' },
  nl: { page: 'Pagina opslaan', link: 'Link opslaan' }, pl: { page: 'Zapisz stronę', link: 'Zapisz link' },
  uk: { page: 'Зберегти сторінку', link: 'Зберегти посилання' }, sv: { page: 'Spara sida', link: 'Spara länk' },
  id: { page: 'Simpan halaman', link: 'Simpan tautan' }, vi: { page: 'Lưu trang', link: 'Lưu liên kết' },
  az: { page: 'Səhifəni saxla', link: 'Keçidi saxla' }, ca: { page: 'Desa la pàgina', link: 'Desa l\'enllaç' },
  da: { page: 'Gem side', link: 'Gem link' }, et: { page: 'Salvesta leht', link: 'Salvesta link' },
  eu: { page: 'Gorde orria', link: 'Gorde esteka' }, fil: { page: 'I-save ang pahina', link: 'I-save ang link' },
  hr: { page: 'Spremi stranicu', link: 'Spremi poveznicu' }, lv: { page: 'Saglabāt lapu', link: 'Saglabāt saiti' },
  lt: { page: 'Išsaugoti puslapį', link: 'Išsaugoti nuorodą' }, hu: { page: 'Oldal mentése', link: 'Hivatkozás mentése' },
  ms: { page: 'Simpan halaman', link: 'Simpan pautan' }, no: { page: 'Lagre side', link: 'Lagre lenke' },
  ro: { page: 'Salvează pagina', link: 'Salvează linkul' }, sq: { page: 'Ruaj faqen', link: 'Ruaj lidhjen' },
  sk: { page: 'Uložiť stránku', link: 'Uložiť odkaz' }, sl: { page: 'Shrani stran', link: 'Shrani povezavo' },
  fi: { page: 'Tallenna sivu', link: 'Tallenna linkki' }, sw: { page: 'Hifadhi ukurasa', link: 'Hifadhi kiungo' },
  cs: { page: 'Uložit stránku', link: 'Uložit odkaz' }, el: { page: 'Αποθήκευση σελίδας', link: 'Αποθήκευση συνδέσμου' },
  bg: { page: 'Запазване на страницата', link: 'Запазване на връзката' }, mk: { page: 'Зачувај страница', link: 'Зачувај врска' },
  sr: { page: 'Сачувај страницу', link: 'Сачувај везу' }, hy: { page: 'Պահպանել էջը', link: 'Պահպանել հղումը' },
  he: { page: 'שמור דף', link: 'שמור קישור' }, ur: { page: 'صفحہ محفوظ کریں', link: 'لنک محفوظ کریں' },
  fa: { page: 'ذخیره صفحه', link: 'ذخیره پیوند' }, mr: { page: 'पृष्ठ जतन करा', link: 'दुवा जतन करा' },
  bn: { page: 'পৃষ্ঠা সংরক্ষণ করুন', link: 'লিঙ্ক সংরক্ষণ করুন' }, pa: { page: 'ਪੰਨਾ ਸੰਭਾਲੋ', link: 'ਲਿੰਕ ਸੰਭਾਲੋ' },
  gu: { page: 'પૃષ્ઠ સાચવો', link: 'લિંક સાચવો' }, ta: { page: 'பக்கத்தைச் சேமி', link: 'இணைப்பைச் சேமி' },
  te: { page: 'పేజీని సేవ్ చేయండి', link: 'లింక్‌ను సేవ్ చేయండి' }, kn: { page: 'ಪುಟವನ್ನು ಉಳಿಸಿ', link: 'ಲಿಂಕ್ ಉಳಿಸಿ' },
  ml: { page: 'പേജ് സംരക്ഷിക്കുക', link: 'ലിങ്ക് സംരക്ഷിക്കുക' }, si: { page: 'පිටුව සුරකින්න', link: 'සබැඳිය සුරකින්න' },
  th: { page: 'บันทึกหน้า', link: 'บันทึกลิงก์' }, ka: { page: 'გვერდის შენახვა', link: 'ბმულის შენახვა' }
};

importScripts('../shared/utils.js');

async function setupContextMenus() {
  const { readmark_settings: s = {} } = await chrome.storage.local.get(['readmark_settings']);
  chrome.contextMenus.removeAll(() => {
    if (s.enableContextMenu === false) return;
    let lang = s.language;
    if (!lang || lang === 'system') { try { lang = chrome.i18n?.getUILanguage?.().replace('-', '_') || 'en'; } catch { lang = 'en'; } }
    if (!MENU_I18N[lang]) lang = lang.split('_')[0].toLowerCase();
    const t = MENU_I18N[lang] || MENU_I18N.en;
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
          const selectors = ['article', '[itemprop="articleBody"]', 'main', '[role="main"]', '.entry-content', '.post-content', '.article-content', '.markdown-body', '#content', '.story-body', 'section[data-field="body"]'];
          let el = null;
          for (const s of selectors) { const found = document.querySelector(s); if (found && (found.innerText || '').trim().length > 120) { el = found; break; } }
          if (!el) el = document.body;
          if (!el) return null;
          const clone = el.cloneNode(true);
          clone.querySelectorAll?.('header, footer, nav, aside, noscript, svg, [role="complementary"], .comments, .advertisement, .ad, script, style')?.forEach(n => n.remove());
          const txt = (clone.innerText || clone.textContent || '').trim();
          if (!txt) return null;
          const cjk = (txt.match(/[\u4e00-\u9fa5\u0800-\u4e00\uac00-\ud7a3]/g) || []).length;
          const words = txt.replace(/[\u4e00-\u9fa5\u0800-\u4e00\uac00-\ud7a3]/g, '').trim().split(/\s+/).filter(Boolean).length;
          const mins = (words / 200) + (cjk / 350);
          return (words >= 50 || cjk >= 80) ? Math.max(1, Math.ceil(mins)) : null;
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
