/**
 * Readmark - Minimal Storage & Data Engine (with Tag support)
 */
const Storage = {
  KEYS: { ITEMS: 'readmark_items', SETTINGS: 'readmark_settings' },
  DEFAULT_SETTINGS: { theme: 'system', language: 'system', openInNewTab: true, autoMarkReadOnOpen: false, showBadgeCount: true, enableContextMenu: true, lastFilter: 'all' },
  _get: (k, fb) => typeof chrome !== 'undefined' && chrome.storage?.local ? new Promise(r => chrome.storage.local.get([k], res => r(res?.[k] ?? fb))) : Promise.resolve((() => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } })()),
  _set: (k, v) => typeof chrome !== 'undefined' && chrome.storage?.local ? new Promise(r => chrome.storage.local.set({ [k]: v }, () => r(v))) : (localStorage.setItem(k, JSON.stringify(v)), Promise.resolve(v)),

  getSettings() { return this._get(this.KEYS.SETTINGS, {}).then(s => Object.assign({}, this.DEFAULT_SETTINGS, s)); },
  saveSettings(s) { return this.getSettings().then(cur => this._set(this.KEYS.SETTINGS, Object.assign({}, cur, s))); },
  setLastFilter(lastFilter) { return this.saveSettings({ lastFilter }); },
  getItems() { return this._get(this.KEYS.ITEMS, []); },
  async saveItems(items) { await this._set(this.KEYS.ITEMS, items); this.updateBadge(items); return items; },
  isRestrictedUrl, deriveTitleFromUrl,

  async addItem({ url, title, favIconUrl, readingTime, tags = [] }) {
    if (!url) return { success: false, error: 'URL required' };
    const clean = url.trim();
    if (this.isRestrictedUrl(clean)) return { success: false, isRestricted: true };
    const items = await this.getItems(), exist = items.find(i => i.url.toLowerCase() === clean.toLowerCase());
    if (exist) return { success: false, alreadyExists: true, item: exist };

    let t = (title || '').trim();
    if (!t || t === clean || t === clean.replace(/^https?:\/\//i, '')) t = this.deriveTitleFromUrl(clean);
    const cleanTags = (Array.isArray(tags) ? tags : []).map(x => String(x).trim().replace(/^#/, '')).filter(Boolean);
    const it = { id: `rm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, url: clean, title: t || clean, favIconUrl: (favIconUrl?.includes('google.com/s2/favicons') ? '' : favIconUrl) || '', addedAt: Date.now(), isRead: false, isPinned: false, readingTime: (typeof readingTime === 'number' && readingTime > 0) ? readingTime : null, tags: cleanTags };
    items.unshift(it); await this.saveItems(items);
    return { success: true, item: it };
  },

  async deleteItem(id) { return this.saveItems((await this.getItems()).filter(i => i.id !== id)); },
  async toggleRead(id) { const items = await this.getItems(), it = items.find(i => i.id === id); if (it) { it.isRead = !it.isRead; it.readAt = it.isRead ? Date.now() : null; await this.saveItems(items); } return items; },
  async togglePin(id) { const items = await this.getItems(), it = items.find(i => i.id === id); if (it) { it.isPinned = !it.isPinned; await this.saveItems(items); } return items; },
  async clearCompleted() { return this.saveItems((await this.getItems()).filter(i => !i.isRead || i.isPinned)); },
  clearAll() { return this.saveItems([]); },
  async markAllRead() { const now = Date.now(); return this.saveItems((await this.getItems()).map(i => i.isRead ? i : { ...i, isRead: true, readAt: now })); },
  async updateItemTitle(id, title) { const items = await this.getItems(), it = items.find(i => i.id === id); if (it && title?.trim()) { it.title = title.trim(); await this.saveItems(items); } return items; },
  async updateItemTags(id, tags) {
    const items = await this.getItems(), it = items.find(i => i.id === id);
    if (it) {
      it.tags = (Array.isArray(tags) ? tags : []).map(x => String(x).trim().replace(/^#/, '')).filter(Boolean);
      await this.saveItems(items);
    }
    return items;
  },

  async getStats() {
    const items = await this.getItems(), total = items.length, read = items.filter(i => i.isRead).length;
    return { total, read, unread: total - read, starred: items.filter(i => i.isPinned).length, bytes: this.formatBytes(new Blob([JSON.stringify(items)]).size) };
  },

  formatBytes(b) {
    if (!b) return '0 B';
    const k = 1024, i = Math.floor(Math.log(b) / Math.log(k));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${['B', 'KB', 'MB'][i]}`;
  },

  async updateBadge(items) {
    if (typeof chrome !== 'undefined' && chrome.action?.setBadgeText) {
      const s = await this.getSettings();
      if (!s.showBadgeCount) { chrome.action.setBadgeText({ text: '' }); return; }
      const unread = (items || []).filter(i => !i.isRead).length;
      chrome.action.setBadgeText({ text: unread > 0 ? String(unread) : '' });
      chrome.action.setBadgeBackgroundColor({ color: '#4285F4' });
    }
  },

  async exportJSON() {
    return JSON.stringify({ version: '1.2.0', exportedAt: new Date().toISOString(), generator: 'Readmark', settings: await this.getSettings(), items: await this.getItems() }, null, 2);
  },

  async exportHTML() {
    const items = await this.getItems();
    const rows = items.map(i => `        <DT><A HREF="${i.url}" ADD_DATE="${Math.floor(i.addedAt / 1000)}"${i.favIconUrl ? ` ICON="${i.favIconUrl}"` : ''}${(i.tags && i.tags.length) ? ` TAGS="${i.tags.join(',')}"` : ''}>${(i.title || i.url).replace(/[&<>]/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[m]))}</A>`).join('\n');
    return `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<TITLE>Bookmarks</TITLE>\n<H1>Readmark Reading List</H1>\n<DL><p>\n    <DT><H3>Readmark</H3>\n    <DL><p>\n${rows}\n    </DL><p>\n</DL><p>`;
  },

  async exportMarkdown() {
    const items = await this.getItems(), s = await this.getSettings();
    const labels = {
      tr: { t: 'Okuma Listesi', r: 'Okundu', u: 'Okunmadı', e: 'Dışa aktarma', c: 'Öğe' }, en: { t: 'Reading List', r: 'Read', u: 'Unread', e: 'Exported', c: 'Items' },
      de: { t: 'Leseliste', r: 'Gelesen', u: 'Ungelesen', e: 'Exportiert', c: 'Einträge' }, fr: { t: 'Liste de lecture', r: 'Lu', u: 'Non lu', e: 'Exporté', c: 'Éléments' },
      es: { t: 'Lista de lectura', r: 'Leído', u: 'No leído', e: 'Exportado', c: 'Elementos' }, it: { t: 'Elenco di lettura', r: 'Letto', u: 'Non letto', e: 'Esportato', c: 'Elementi' },
      pt_BR: { t: 'Lista de leitura', r: 'Lido', u: 'Não lido', e: 'Exportado', c: 'Itens' }, ru: { t: 'Список для чтения', r: 'Прочитано', u: 'Не прочитано', e: 'Экспортировано', c: 'Записей' },
      zh_CN: { t: '阅读清单', r: '已读', u: '未读', e: '导出于', c: '项' }, zh_TW: { t: '閱讀清單', r: '已讀', u: '未讀', e: '匯出于', c: '項' },
      ja: { t: 'リーディングリスト', r: '既読', u: '未読', e: 'エクスポート', c: '件' }, ko: { t: '읽기 목록', r: '읽음', u: '안 읽음', e: '내보낸 날짜', c: '개' },
      ar: { t: 'قائمة القراءة', r: 'مقروء', u: 'غير مقروء', e: 'تم التصدير', c: 'عنصر' }, hi: { t: 'पठन सूची', r: 'पढ़ा हुआ', u: 'अपठित', e: 'निर्यात किया गया', c: 'आइटम' },
      nl: { t: 'Leeslijst', r: 'Gelezen', u: 'Ongelezen', e: 'Geëxporteerd', c: 'Items' }, pl: { t: 'Lista do czytania', r: 'Przeczytane', u: 'Nieprzeczytane', e: 'Wyeksportowano', c: 'Elementy' },
      uk: { t: 'Список для читання', r: 'Прочитано', u: 'Не прочитано', e: 'Експортовано', c: 'Записів' }, sv: { t: 'Läslista', r: 'Läst', u: 'Oläst', e: 'Exporterad', c: 'Objekt' },
      id: { t: 'Daftar Bacaan', r: 'Sudah dibaca', u: 'Belum dibaca', e: 'Diekspor', c: 'Item' }, vi: { t: 'Danh sách đọc', r: 'Đã đọc', u: 'Chưa đọc', e: 'Đã xuất', c: 'Mục' }
    };
    const l = labels[s.language] || labels.en;
    const rows = items.map((it, idx) => {
      const tagStr = (it.tags && it.tags.length) ? ` \`[${it.tags.map(t => `#${t}`).join(' ')}]\`` : '';
      return `${idx + 1}. ${it.isPinned ? '❤️ ' : ''}${it.isRead ? `✅ [${l.r}]` : `⏳ [${l.u}]`} [${it.title || it.url}](${it.url})${tagStr} - *${new Date(it.addedAt).toLocaleDateString()}*`;
    }).join('\n');
    return `# Readmark ${l.t}\n\n*${l.e}: ${new Date().toLocaleString()}*\n\n## 📚 ${l.t} (${items.length} ${l.c})\n\n${rows}\n`;
  },

  async importData(content, fileType = 'json') {
    const existing = await this.getItems(), seen = new Set(existing.map(i => i.url.toLowerCase())), imported = [];
    if (fileType === 'json' || content.trim().startsWith('{') || content.trim().startsWith('[')) {
      const parsed = JSON.parse(content), incoming = Array.isArray(parsed) ? parsed : (parsed.items || []);
      incoming.forEach(it => {
        if (it?.url && !seen.has(it.url.toLowerCase())) {
          imported.push({ id: it.id || `rm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, url: it.url, title: it.title || it.url, favIconUrl: it.favIconUrl || '', addedAt: it.addedAt || Date.now(), isRead: Boolean(it.isRead), isPinned: Boolean(it.isPinned), tags: Array.isArray(it.tags) ? it.tags : [] });
          seen.add(it.url.toLowerCase());
        }
      });
    } else {
      const regex = /<A\s+HREF="([^"]+)"(?:\s+ADD_DATE="[^"]*")?(?:\s+ICON="[^"]*")?(?:\s+TAGS="([^"]*)")?[^>]*>([^<]*)<\/A>/gi;
      let m;
      while ((m = regex.exec(content)) !== null) {
        const [_, url, tagsStr, title] = m;
        if (url && !seen.has(url.toLowerCase()) && !url.startsWith('javascript:')) {
          const tags = tagsStr ? tagsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
          imported.push({ id: `rm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, url, title: title || url, favIconUrl: '', addedAt: Date.now(), isRead: false, isPinned: false, tags });
          seen.add(url.toLowerCase());
        }
      }
    }
    if (imported.length) await this.saveItems([...imported, ...existing]);
    return { importedCount: imported.length, totalCount: existing.length + imported.length };
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = Storage;
